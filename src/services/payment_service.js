// 📁 services/paymentService.js
const axios = require('axios');
const { getConnection } = require('../config/db_config');
require('dotenv').config();

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const bankCodes = [
  { name: "KB국민은행", code: "04" },
  { name: "하나은행", code: "05" },
  { name: "신한은행", code: "88" },
  { name: "우리은행", code: "20" },
  { name: "NH농협은행", code: "11" },
  { name: "IBK기업은행", code: "03" },
  { name: "SC제일은행", code: "23" },
  { name: "씨티은행", code: "27" },
  { name: "부산은행", code: "32" },
  { name: "대구은행", code: "31" },
  { name: "광주은행", code: "34" },
  { name: "제주은행", code: "35" },
  { name: "경남은행", code: "39" },
  { name: "토스뱅크", code: "92" },
  { name: "케이뱅크", code: "89" },
  { name: "카카오뱅크", code: "90" },
  { name: "새마을금고", code: "45" },
  { name: "수협은행", code: "07" },
  { name: "저축은행중앙회", code: "50" },
  { name: "우체국예금보험", code: "71" },
  { name: "산림조합", code: "64" }
];
exports.createPaymentRequest = async ({ chat_room_id, requester_id, amount, message }) => {
  const conn = await getConnection();

  // 방장 여부 확인
  const [[hostCheck]] = await conn.query(
    `SELECT user_id FROM reservation_table WHERE chat_room_id = ?`,
    [chat_room_id]
  );

  if (!hostCheck || hostCheck.user_id !== requester_id) {
    throw new Error('요청자는 해당 채팅방의 방장이 아닙니다.');
  }

  const [result] = await conn.query(
    `INSERT INTO payment_request_table (chat_room_id, requester_id, amount, message) VALUES (?, ?, ?, ?)`,
    [chat_room_id, requester_id, amount, message]
  );

  return { payment_request_id: result.insertId, status: 'pending' };
};

exports.initiatePayment = async ({ chat_room_id, amount, paymentKey, orderId, payment_method, payer_id }) => {
  const res = await axios.post(
    'https://api.tosspayments.com/v1/payments/confirm',
    { paymentKey, orderId, amount },
    {
      auth: { username: TOSS_SECRET_KEY, password: '' },
      headers: { 'Content-Type': 'application/json' },
    }
  );

  // ✅ 결제 승인 상태 확인
  if (res.data.status !== 'DONE') {
    throw new Error('결제 승인 실패: ' + res.data.status);
  }

  const conn = await getConnection();

  // ✅ 결제 상태 업데이트
  await conn.query(
    `UPDATE chat_room_users
     SET payment_status = 'completed', payment_method = ?, payment_key = ?, payment_amount = ?
     WHERE chat_room_id = ? AND user_id = ?`,
    [payment_method, paymentKey, amount, chat_room_id, payer_id]
  );

  // ✅ 총 인원 수 확인
  const [[{ total }]] = await conn.query(
    `SELECT COUNT(*) AS total FROM chat_room_users WHERE chat_room_id = ? AND is_kicked = 0`,
    [chat_room_id]
  );

  // ✅ 결제 완료 인원 수 확인
  const [[{ completed }]] = await conn.query(
    `SELECT COUNT(*) AS completed FROM chat_room_users WHERE chat_room_id = ? AND payment_status = 'completed' AND is_kicked = 0`,
    [chat_room_id]
  );

  // ✅ 모든 인원이 결제 완료 시 사장님에게 알림 보내기
  if (total === completed) {
    // 알림 보내기 (가정: sendNotification 함수 또는 외부 알림 서비스)
    await sendReservationNotificationToOwner({
    });
  }

  return { payment_status: 'completed' };
};

exports.releasePayments = async (chat_room_id) => {
  const conn = await getConnection();

  // 1. 정산할 참여자 목록 (결제 완료자)
  const [payments] = await conn.query(
    `SELECT user_id, payment_key FROM chat_room_users WHERE chat_room_id = ? AND payment_status = 'completed'`,
    [chat_room_id]
  );

  // 2. 사장님 계좌 정보 조회
  const [[store]] = await conn.query(
    `SELECT s.bank_code, s.account_number, s.account_holder_name
     FROM chat_rooms cr
     JOIN store_table s ON cr.store_id = s.store_id
     WHERE cr.chat_room_id = ?`,
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

  return { released_payments: released };
};

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
     WHERE chat_room_id = ? AND is_kicked = 0`,
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