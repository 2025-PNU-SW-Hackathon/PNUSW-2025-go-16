// 📁 services/paymentService.js
const axios = require('axios');
const { getConnection } = require('../config/db_config');
require('dotenv').config();
const socketService = require('./socket_service');
const { getIO } = require('../config/socket_hub');
const messageService = require('./message_service');
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const pushService = require('./push_service');

exports.createPaymentRequest = async ({ chat_room_id, requester_id, amount, message, store_id }) => {
  const conn = await getConnection();
  console.log(requester_id + " request payment");
  // 방장 여부 확인
  const [[hostCheck]] = await conn.query(
    `SELECT user_id FROM reservation_table WHERE reservation_id = ?`,
    [chat_room_id]
  );

  if (!hostCheck || hostCheck.user_id !== requester_id) {
    throw new Error('요청자는 해당 채팅방의 방장이 아닙니다.');
  }

  const [result] = await conn.query(
    `INSERT INTO payment_request_table (chat_room_id, requester_id, amount, message) VALUES (?, ?, ?, ?)`,
    [chat_room_id, requester_id, amount, message]
  );

  await conn.query(
    `UPDATE reservation_table 
   SET reservation_status = 1, store_id = ?
   WHERE reservation_id = ?`,
    [store_id, chat_room_id]
  );

  const io = getIO(); // 전역 등록된 io 가져오기

  try {
    // 메시지를 db에 저장
    const new_message_result = await messageService.saveNewMessage(requester_id, chat_room_id, '결제를 요청하였습니다.');

    // 메시지를 해당 방에 브로드캐스트
    io.to(chat_room_id).emit('newMessage', new_message_result);

    // 읽음 처리
    const socketsInRoom = await io.in(chat_room_id).fetchSockets();
    for (const socket of socketsInRoom) {
      await messageService.markAllMessagesAsRead(socket.user.user_id, chat_room_id);
    }
  } catch (err) {
    console.error('메시지 저장 오류:', err);
  }

  try {
    //console.log(chat_room_id);
    await pushService.sendPaymentRequestPush({
      reservationId: chat_room_id,
      amount,                // 결제 금액

      // userIds: 특정 대상만 보낼 때 배열로 넘겨도 됨. 안 넘기면 방 전체 참여자 대상
    });
  } catch (err) {
    console.error('push notification err : ', err);
  }

  return { payment_request_id: result.insertId, status: 'pending' };
};

exports.initiatePayment = async ({ chat_room_id, amount, paymentKey, orderId, payment_method, payer_id }) => {
  const conn = await getConnection();
  let isConfirmed = false;
  let alreadyProcessed = false;

  try {

    // 1) 총 결제 금액 가져오기
    const [[req]] = await conn.query(
      `SELECT amount FROM payment_request_table WHERE payment_request_id = ? AND chat_room_id = ?`,
      [payment_request_id, chat_room_id]
    );

    if (!req) {
      return { ok: false, message: '결제 요청을 찾을 수 없습니다.' };
    }
    if (Number(amount) !== req.amount) {
      return {
        ok: false,
        expected: expectedAmount,
        total: totalAmount,
        participants,
        message: `결제 금액 불일치 (expected=${expectedAmount}, got=${amount})`
      };
    }
    const res = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      { paymentKey, orderId, amount },
      {
        auth: { username: TOSS_SECRET_KEY, password: '' },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (res.data.status === 'DONE') {
      isConfirmed = true;
    } else {
      throw new Error('결제 승인 실패: ' + res.data.status);
    }
  } catch (err) {
    const code = err.response?.data?.code;
    if (code === 'ALREADY_PROCESSED_PAYMENT') {
      console.warn('[⚠️ 이미 처리된 결제] paymentKey:', paymentKey);
      isConfirmed = true;
      alreadyProcessed = true;
    } else {

      // 결제 실패 푸시 알림.
      throw err;
    }
  }

  if (isConfirmed) {
    // 결제 완료 푸시 알림
    try {
        await pushService.sendPaymentSuccessPush({
          reservationId: chat_room_id,
          userId: payer_id,
          paymentId: paymentKey, // 딥링크: app://payments/{paymentId}
          amount
        });
      } catch (err) {console.log(err);}

    // DB 결제 상태 업데이트
    await conn.query(
      `UPDATE chat_room_users
       SET payment_status = 'completed',
           payment_method = ?,
           payment_key = ?,
           payment_amount = ?
       WHERE reservation_id = ? AND user_id = ?`,
      [payment_method, paymentKey, amount, chat_room_id, payer_id]
    );

    // 총 인원 수 확인
    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM chat_room_users
       WHERE reservation_id = ? AND is_kicked = 0`,
      [chat_room_id]
    );

    // 결제 완료 인원 수 확인
    const [[{ completed }]] = await conn.query(
      `SELECT COUNT(*) AS completed
       FROM chat_room_users
       WHERE reservation_id = ? AND payment_status = 'completed' AND is_kicked = 0`,
      [chat_room_id]
    );

    // 모든 인원이 결제 완료했을 경우 사장님에게 알림 전송
    if (total === completed) {
      try {
        await pushService.sendReservationRequestedPush(chat_room_id, null);
      }
      catch (err) {
        console.log(err);
      }
    }

    return {
      payment_status: 'completed',
      alreadyProcessed,
    };
  }

  throw new Error('결제 승인되지 않았습니다.');
};

exports.releasePayments = async (chat_room_id) => {
  const conn = await getConnection();

  // 이미 확정/거절/취소 상태인지 확인
  const [[resRow]] = await conn.query(
    `SELECT reservation_status, store_id FROM reservation_table WHERE reservation_id = ?`,
    [chat_room_id]
  );
  if (!resRow) throw new Error('예약을 찾을 수 없습니다.');

  // 멱등: 이미 확정(2) 이면 그냥 OK 리턴
  if (resRow.reservation_status === 2) {
    return { released_payments: [], idempotent: true };
  }
  // 거절(3)/취소(4)면 정산 불가
  if ([3, 4].includes(resRow.reservation_status)) {
    throw new Error('이미 거절/취소된 예약입니다.');
  }

  // 1. 정산할 참여자 목록 (결제 완료자)
  const [payments] = await conn.query(
    `SELECT user_id, payment_key, payment_amount
       FROM chat_room_users 
      WHERE reservation_id = ? 
        AND payment_status = 'completed'`,
    [chat_room_id]
  );

  // 2. 사장님 계좌 정보
  const [[store]] = await conn.query(
    `SELECT s.bank_code, s.account_number, s.account_holder_name
       FROM reservation_table r
       JOIN store_table s ON r.store_id = s.store_id
      WHERE r.reservation_id = ?`,
    [chat_room_id]
  );
  if (!store) throw new Error('가게/정산 계좌 정보를 찾을 수 없습니다.');

  // 3. 정산 실행
  const released = [];
  var cost = 0;
  for (const payment of payments) {
    await axios.post(
      'https://api.tosspayments.com/v1/escrow/confirm',
      {
        paymentKey: payment.payment_key,
        account: {
          bankCode: store.bank_code,
          accountNumber: store.account_number,
          holderName: store.account_holder_name
        }
      },
      {
        auth: { username: TOSS_SECRET_KEY, password: '' },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    cost += payment.payment_amount;
    released.push({
      payer_id: payment.user_id,
      paymentKey: payment.payment_key,
      status: 'RELEASED'
    });
  }

  // 4. 상태 확정
  await conn.query(
    `UPDATE reservation_table 
        SET reservation_status = 2 
      WHERE reservation_id = ?`,
    [chat_room_id]
  );

  try {
    await pushService.sendPayoutCompletedPush(chat_room_id, 'temp', cost);
  } catch (err) {
    console.log(err);
  }

  return { released_payments: released };
};

/*
exports.releasePayments = async (chat_room_id) => {
  const conn = await getConnection();

  // 1. 정산할 참여자 목록 (결제 완료자)
  const [payments] = await conn.query(
    `SELECT user_id, payment_key FROM chat_room_users WHERE reservation_id = ? AND payment_status = 'completed'`,
    [chat_room_id]
  );

  // 2. 사장님 계좌 정보 조회
  const [[store]] = await conn.query(
    `SELECT s.bank_code, s.account_number, s.account_holder_name
     FROM reservation_table r
     JOIN store_table s ON r.store_id = s.store_id
    WHERE r.reservation_id = ?`,
    [chat_room_id]
  );

  // 3. 정산 실행
  const released = [];
  for (const payment of payments) {
    await axios.post(
      'https://api.tosspayments.com/v1/escrow/confirm',
      {
        paymentKey: payment.payment_key,
        account: {
          bankCode: store.bank_code,
          accountNumber: store.account_number,
          holderName: store.account_holder_name
        }
      },
      {
        auth: { username: TOSS_SECRET_KEY, password: '' },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    released.push({
      payer_id: payment.user_id,
      paymentKey: payment.payment_key,
      status: 'RELEASED'
    });
  }
  await conn.query(
    `UPDATE reservation_table 
   SET reservation_status = 2 
   WHERE reservation_id = ?`,
    [chat_room_id]
  );
  return { released_payments: released };
};
*/

exports.getPaymentStatus = async (chat_room_id) => {
  const conn = await getConnection();

  // 1. 결제 요청 정보 (가장 최근 요청 1건)
  const [[request]] = await conn.query(
    `SELECT payment_request_id, requester_id, amount, message, status, request_time
     FROM payment_request_table
     WHERE chat_room_id = ?
     ORDER BY request_time DESC
     LIMIT 1`,
    [chat_room_id]
  );

  // 2. 참여자별 결제 상태 정보
  const [payments] = await conn.query(
    `SELECT
       user_id AS payer_id,
       payment_amount,
       payment_method,
       payment_status
     FROM chat_room_users
     WHERE reservation_id = ? AND is_kicked = 0`,
    [chat_room_id]
  );

  return {
    payment_request: request || null,
    payments
  };
};

exports.cancelPayment = async ({ paymentKey, cancelReason }) => {
  await axios.post(
    `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
    { cancelReason },
    {
      auth: { username: TOSS_SECRET_KEY, password: '' },
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const conn = await getConnection();
  await conn.query(
    `UPDATE chat_room_users SET payment_status = 'refunded' WHERE payment_key = ?`,
    [paymentKey]
  );
  return { success: true, refund_status: 'refunded' };
};

// 다건 환불 (거절 시 사용)
async function cancelAllCompletedPayments(conn, reservationId, reason) {
  const [payments] = await conn.query(
    `SELECT user_id, payment_key 
       FROM chat_room_users 
      WHERE reservation_id = ? 
        AND payment_status = 'completed'`,
    [reservationId]
  );

  const results = [];
  for (const p of payments) {
    await axios.post(
      `https://api.tosspayments.com/v1/payments/${p.payment_key}/cancel`,
      { cancelReason: reason || '예약 거절로 인한 전액 환불' },
      {
        auth: { username: TOSS_SECRET_KEY, password: '' },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    // 로컬 상태도 갱신
    await conn.query(
      `UPDATE chat_room_users 
          SET payment_status = 'refunded' 
        WHERE payment_key = ?`,
      [p.payment_key]
    );

    results.push({ payer_id: p.user_id, paymentKey: p.payment_key, status: 'CANCELED' });
  }
  return results;
}

exports.confirmReservationByStore = async ({ reservationId, storeId }) => {
  const conn = await getConnection();

  // 소유/권한 확인 + 최초 바인딩
  const [[row]] = await conn.query(
    `SELECT reservation_id, reservation_status, store_id
       FROM reservation_table
      WHERE reservation_id = ?`,
    [reservationId]
  );
  if (!row) throw new Error('예약을 찾을 수 없습니다.');
  if (row.store_id && row.store_id !== storeId) {
    throw new Error('다른 가게가 관리하는 예약입니다.');
  }

  // 필요시 bind
  /*
  if (!row.store_id) {
    await conn.query(
      `UPDATE reservation_table SET store_id = ? WHERE reservation_id = ?`,
      [storeId, reservationId]
    );
  }
  */
  // 멱등 응답
  if (row.reservation_status === 2) return { ok: true, idempotent: true };

  // 정산 실행 (이미 작성된 함수 재사용)
  const releaseResult = await exports.releasePayments(reservationId);

  // 채팅 로그 메시지 저장

  const io = getIO();

  try {
    // 메시지를 db에 저장
    const new_message_result = await messageService.saveNewMessage('admin', chat_room_id, '가게가 예약을 확정했습니다.');

    // 메시지를 해당 방에 브로드캐스트
    io.to(chat_room_id).emit('newMessage', new_message_result);

    // 읽음 처리
    const socketsInRoom = await io.in(chat_room_id).fetchSockets();
    for (const socket of socketsInRoom) {
      await messageService.markAllMessagesAsRead(socket.user.user_id, chat_room_id);
    }
  } catch (err) {
    console.error('메시지 저장 오류:', err);
  }

  // 예약 확정 푸쉬 알림
  // 🔔 푸시 발송
  await pushService.sendReservationConfirmedPush(chat_room_id);

  return { ok: true, released: releaseResult };
};

exports.rejectReservationByStore = async ({ reservationId, storeId}) => {
  const conn = await getConnection();

  // 소유/권한 확인 + 최초 바인딩
  const [[row]] = await conn.query(
    `SELECT reservation_id, reservation_status, store_id
       FROM reservation_table
      WHERE reservation_id = ?`,
    [reservationId]
  );
  if (!row) throw new Error('예약을 찾을 수 없습니다.');
  if (row.store_id && row.store_id !== storeId) {
    throw new Error('다른 가게가 관리하는 예약입니다.');
  }

  // 멱등 응답
  if (row.reservation_status === 3) return { ok: true, idempotent: true };

  // 결제 완료자 전액 환불
  const canceled = await cancelAllCompletedPayments(conn, reservationId, reason);

  // 상태 업데이트: 거절
  await conn.query(
    `UPDATE reservation_table 
        SET reservation_status = 0, store_id = NULL
      WHERE reservation_id = ?`,
    [reservationId]
  );

  // 채팅 로그 메시지 등록
  const io = getIO();

  try {
    // 메시지를 db에 저장
    const new_message_result = await messageService.saveNewMessage('admin', chat_room_id, '예약이 거절되었습니다.');

    // 메시지를 해당 방에 브로드캐스트
    io.to(chat_room_id).emit('newMessage', new_message_result);

    // 읽음 처리
    const socketsInRoom = await io.in(chat_room_id).fetchSockets();
    for (const socket of socketsInRoom) {
      await messageService.markAllMessagesAsRead(socket.user.user_id, chat_room_id);
    }
  } catch (err) {
    console.error('메시지 저장 오류:', err);
  }

  // 푸쉬 알림
  await pushService.sendReservationRejectedPush(reservationId);

  return { ok: true, canceled };
};