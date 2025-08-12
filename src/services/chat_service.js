// 📦 chat_service.js
// DB 직접 접근하는 채팅 기능 비즈니스 로직 모음

const e = require('express');
const { getConnection } = require('../config/db_config');
const messageService = require('../services/message_service');
// 💬 1. 채팅방 목록 조회
exports.getChatRooms = async (user_id) => {
  const conn = getConnection();

  const [rows] = await conn.query(
    `SELECT 
      cr.reservation_id AS chat_room_id,                         
      cr.name AS name,                      
      (
        SELECT cm.message
        FROM chat_messages cm
        WHERE cm.chat_room_id = cr.reservation_id
        ORDER BY cm.message_id DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT cm.created_at
        FROM chat_messages cm
        WHERE cm.chat_room_id = cr.reservation_id
        ORDER BY cm.message_id DESC
        LIMIT 1
      ) AS last_message_time,
       (
        SELECT cm.sender_id
        FROM chat_messages cm
        WHERE cm.chat_room_id = cr.reservation_id
        ORDER BY cm.message_id DESC
        LIMIT 1
      ) AS sender_id
   FROM chat_rooms cr
   JOIN chat_room_users cru ON cr.reservation_id = cru.reservation_id
   WHERE cru.user_id = ? AND cru.is_kicked = 0`,
    [user_id]
  );

  return rows;
};

// 👋 2. 채팅방 나가기
exports.leaveChatRoom = async (user_id, room_id) => {
  const conn = getConnection();
  await conn.query(
    `DELETE FROM chat_room_users WHERE reservation_id = ? AND user_id = ?`,
    [room_id, user_id]
  );
};

// 📌 3. 채팅방 상태 변경
exports.updateChatRoomStatus = async (user_id, room_id, status) => {
  const conn = getConnection();
  // 나갔을때는 다시 들어올 수 있게 삭제.
  await conn.query('DELETE FROM chat_room_users WHERE reservation_id = ? AND user_id = ?;',
    [room_id, user_id]
  )
  // 참여자 수 줄이기
  await conn.query(
    `UPDATE reservation_table
    SET reservation_participant_cnt = reservation_participant_cnt - 1,
    reservation_status = 0
    WHERE reservation_id = ?`,
    [reservation_id]
  );
};

// 🚫 4. 유저 강퇴
exports.kickUser = async (room_id, target_user_id, requester_id) => {
  const conn = getConnection();

  // 요청자가 방장인지 확인 필요 
  const [result] = await conn.query('SELECT user_id from reservation_table WHERE reservation_id = ?',
    [room_id]
  );
  console.log(requester_id);
  if (result.length > 0 && result[0].user_id === requester_id) {
    // 요청자가 방장인지 확인된 경우
    const [worked] = await conn.query(
      `UPDATE chat_room_users
      SET is_kicked = 1
      WHERE reservation_id = ? AND user_id = ?`,
      [room_id, target_user_id]
    );
    if (worked.changedRows > 0) {
      // 참여자 수 줄이기
      await conn.query(
        `UPDATE reservation_table
        SET reservation_participant_cnt = reservation_participant_cnt - 1,
        reservation_status = 0
        WHERE reservation_id = ?`,
        [room_id]
      );
    }
    else {
      console.log("user not found");
    }
    return { kicked_user_id: target_user_id };
  }
  else {
    const err = new Error("권한이 없습니다.");
    err.statusCode = 401;
    err.errorCode = "INVALID_APPROACH";
    throw err;
  }
};

// 📨 5. 채팅방 전체 메시지 조회 + 읽음 처리
exports.getAllMessages = async (user_id, room_id) => {
  const conn = getConnection();
  console.log(user_id, room_id);
  await messageService.markAllMessagesAsRead(user_id, room_id);
  // 전체 메시지 조회 (최신순)
  const [messages] = await conn.query(
    `SELECT m.message_id AS id,
          m.sender_id,
          m.message,
          m.created_at,
          (
            SELECT COUNT(*)
            FROM chat_read_status
            WHERE chat_room_id = ? AND last_read_message_id IS NOT NULL AND last_read_message_id >= m.message_id
          ) AS read_count
   FROM chat_messages m
   WHERE m.chat_room_id = ?
   ORDER BY m.message_id DESC
   LIMIT 100`,
    [room_id, room_id]
  );

  return messages;
};

// 🛠️ 채팅방 생성 및 입장
exports.enterChatRoom = async (user_id, reservation_id) => {
  const conn = getConnection();
  const [existingReservation] = await conn.query(
    'SELECT reservation_match, reservation_status FROM reservation_table WHERE reservation_id = ?'
    , [reservation_id]);
  if (existingReservation.length == 0) {
    const err = new Error("존재하지 않는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_RESERVATION_ID";
    throw err;
  }
  if (existingReservation[0].reservation_status == 1) {
    const err = new Error("참여할 수 없는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_RESERVATION_ID";
    throw err;
  }

  // 1. 이미 채팅방이 있는지 확인
  const [existingRoom] = await conn.query(
    `SELECT id FROM chat_rooms WHERE reservation_id = ?`,
    [reservation_id]
  );

  let chat_room_id;

  if (existingRoom.length > 0) {
    // 기존 방 존재 → ID 재사용
    chat_room_id = existingRoom[0].id;
  } else {
    // 없으면 새로 생성
    const [insertResult] = await conn.query(
      `INSERT INTO chat_rooms (reservation_id, name, status) VALUES (?, ?, 0)`,
      [reservation_id, existingReservation[0].reservation_match]
    );
    chat_room_id = reservation_id;
  }

  // 2. chat_room_users에 등록 (중복 방지)
  await conn.query(
    `INSERT INTO chat_room_users (reservation_id, user_id, is_kicked)
     VALUES (?, ?, false)`,
    [reservation_id, user_id]
  );

  return {
    reservation_id,
    message: '입장 완료',
  };
};

// 💰 결제 관련 서비스

// 방장의 예약금 결제 요청
exports.requestPayment = async (roomId, userId, paymentData) => {
  const conn = getConnection();
  const { amount, message } = paymentData;

  try {
    // 방장 권한 확인 (테스트용으로 임시 비활성화)
    console.log('RoomId:', roomId, 'UserId:', userId); // 디버깅용
    
    // 테스트용으로 권한 확인 비활성화 - 나중에 다시 활성화할 예정
    /*
    const [roomInfo] = await conn.query(
      `SELECT rt.user_id FROM reservation_table rt
       JOIN chat_rooms cr ON rt.reservation_id = cr.reservation_id
       WHERE cr.id = ?`,
      [roomId]
    );

    if (roomInfo.length === 0 || roomInfo[0].user_id !== userId) {
      const err = new Error('방장만 결제 요청을 할 수 있습니다.');
      err.statusCode = 403;
      err.errorCode = 'FORBIDDEN';
      throw err;
    }
    */

    // 결제 요청 정보 저장
    const [result] = await conn.query(
      `INSERT INTO payment_request_table 
       (chat_room_id, requester_id, amount, message, request_time, status)
       VALUES (?, ?, ?, ?, NOW(), 'pending')`,
      [parseInt(roomId), userId, amount, message]
    );

    // 채팅방에 결제 요청 메시지 발송 (chat_messages 테이블 사용)
    // message_id 자동 생성
    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;
    
    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, parseInt(roomId), userId, `💰 예약금 결제 요청: ${amount}원 - ${message}`]
    );

    return {
      payment_request_id: result.insertId,
      amount,
      message
    };
  } catch (error) {
    console.log('MySQL Error:', error.message); // 구체적인 에러 메시지 출력
    console.log('Error Code:', error.code); // MySQL 에러 코드 출력
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 요청 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 결제 상태 확인
exports.getPaymentStatus = async (roomId, userId) => {
  const conn = getConnection();

  try {
    // 해당 채팅방의 결제 요청 상태 조회
    const [paymentRequests] = await conn.query(
      `SELECT 
        pr.payment_request_id,
        pr.amount,
        pr.message,
        pr.request_time,
        pr.status,
        u.user_name as requester_name
       FROM payment_request_table pr
       JOIN user_table u ON pr.requester_id = u.user_id
       WHERE pr.chat_room_id = ?
       ORDER BY pr.request_time DESC`,
      [roomId]
    );

    // 사용자의 결제 상태 조회
    const [userPayments] = await conn.query(
      `SELECT 
        payment_id,
        payment_amount,
        payment_method,
        payment_status,
        payment_time
       FROM payment_table
       WHERE chat_room_id = ? AND payer_id = ?
       ORDER BY payment_time DESC`,
      [roomId, userId]
    );

    return {
      payment_requests: paymentRequests,
      user_payments: userPayments
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 상태 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 결제 처리
exports.processPayment = async (roomId, userId, paymentData) => {
  const conn = getConnection();
  const { payment_method, payment_amount } = paymentData;

  try {
    // 결제 정보 저장
    const [result] = await conn.query(
      `INSERT INTO payment_table 
       (chat_room_id, payer_id, payment_amount, payment_method, payment_status, payment_time)
       VALUES (?, ?, ?, ?, 'completed', NOW())`,
      [parseInt(roomId), userId, payment_amount, payment_method]
    );

    // 결제 완료 메시지 발송 (chat_messages 테이블 사용)
    // message_id 자동 생성
    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;
    
    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, parseInt(roomId), userId, `✅ 결제 완료: ${payment_amount}원 (${payment_method})`]
    );

    return {
      payment_id: result.insertId,
      payment_amount,
      payment_method,
      payment_status: 'completed'
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 처리 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 결제 미완료 참가자 강퇴
exports.kickUnpaidParticipant = async (roomId, targetUserId, requesterId) => {
  const conn = getConnection();

  try {
    // 1. 방장 권한 확인 (테스트용으로 임시 비활성화)
    console.log('Kick request - RoomId:', roomId, 'TargetUserId:', targetUserId, 'RequesterId:', requesterId);
    
    // 테스트용으로 권한 확인 비활성화
    /*
    const [roomInfo] = await conn.query(
      `SELECT rt.user_id FROM reservation_table rt
       JOIN chat_rooms cr ON rt.reservation_id = cr.reservation_id
       WHERE cr.id = ?`,
      [roomId]
    );

    if (roomInfo.length === 0 || roomInfo[0].user_id !== requesterId) {
      const err = new Error('방장만 참가자를 강퇴할 수 있습니다.');
      err.statusCode = 403;
      err.errorCode = 'FORBIDDEN';
      throw err;
    }
    */

    // 2. 대상 사용자가 채팅방에 있는지 확인
    const [participantInfo] = await conn.query(
      `SELECT * FROM chat_room_users 
       WHERE reservation_id = (SELECT reservation_id FROM chat_rooms WHERE id = ?) 
       AND user_id = ? AND is_kicked = 0`,
      [roomId, targetUserId]
    );

    if (participantInfo.length === 0) {
      const err = new Error('강퇴할 참가자를 찾을 수 없습니다.');
      err.statusCode = 404;
      err.errorCode = 'PARTICIPANT_NOT_FOUND';
      throw err;
    }

    // 3. 대상 사용자의 결제 상태 확인
    const [paymentInfo] = await conn.query(
      `SELECT * FROM payment_table 
       WHERE chat_room_id = ? AND payer_id = ? AND payment_status = 'completed'`,
      [roomId, targetUserId]
    );

    if (paymentInfo.length > 0) {
      const err = new Error('결제를 완료한 참가자는 강퇴할 수 없습니다.');
      err.statusCode = 400;
      err.errorCode = 'PAYMENT_COMPLETED';
      throw err;
    }

    // 4. 참가자 강퇴 처리
    await conn.query(
      `UPDATE chat_room_users 
       SET is_kicked = 1 
       WHERE reservation_id = (SELECT reservation_id FROM chat_rooms WHERE id = ?) 
       AND user_id = ?`,
      [roomId, targetUserId]
    );

    // 5. 강퇴 메시지 발송
    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;
    
    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, parseInt(roomId), requesterId, `🚫 ${targetUserId}님이 결제 미완료로 강퇴되었습니다.`]
    );

    return {
      kicked_user_id: targetUserId,
      reason: 'payment_not_completed'
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '참가자 강퇴 중 오류가 발생했습니다.';
    }
    throw error;
  }
};