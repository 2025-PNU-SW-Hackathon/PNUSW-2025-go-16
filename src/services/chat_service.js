// 📦 chat_service.js
// DB 직접 접근하는 채팅 기능 비즈니스 로직 모음

const { getConnection } = require('../config/db_config');

// 💬 1. 채팅방 목록 조회
exports.getChatRooms = async (user_id) => {
  const conn = getConnection();

  const [rows] = await conn.query(
    `SELECT cr.id AS chat_room_id,
            cr.name AS chat_room_name,
            (
              SELECT message
              FROM chat_messages
              WHERE chat_room_id = cr.id
              ORDER BY id DESC
              LIMIT 1
            ) AS last_message,
            (
              SELECT created_at
              FROM chat_messages
              WHERE chat_room_id = cr.id
              ORDER BY id DESC
              LIMIT 1
            ) AS last_message_time
     FROM chat_rooms cr
     JOIN chat_room_users cru ON cr.id = cru.chat_room_id
     WHERE cru.user_id = ? AND cru.is_kicked = FALSE`,
    [user_id]
  );

  return rows;
};

// 👋 2. 채팅방 나가기
exports.leaveChatRoom = async (user_id, room_id) => {
  const conn = getConnection();
  await conn.query(
    `DELETE FROM chat_room_users WHERE chat_room_id = ? AND user_id = ?`,
    [room_id, user_id]
  );
};

// 📌 3. 채팅방 상태 변경
exports.updateChatRoomStatus = async (user_id, room_id, status) => {
  const conn = getConnection();
  await conn.query(
    `UPDATE chat_rooms SET status = ? WHERE id = ?`,
    [status, room_id]
  );
};

// 🚫 4. 유저 강퇴
exports.kickUser = async (room_id, target_user_id, requester_id) => {
  const conn = getConnection();

  // 요청자가 방장인지 확인 필요 (구현 예정)

  await conn.query(
    `UPDATE chat_room_users
     SET is_kicked = TRUE
     WHERE chat_room_id = ? AND user_id = ?`,
    [room_id, target_user_id]
  );

  return { kicked_user_id: target_user_id };
};

// 📨 5. 채팅방 전체 메시지 조회 + 읽음 처리
exports.getAllMessages = async (user_id, room_id) => {
  const conn = getConnection();

  // 전체 메시지 조회 (최신순)
  const [messages] = await conn.query(
    `SELECT m.id AS message_id,
            m.sender_id,
            m.message,
            m.created_at,
            (
              SELECT COUNT(*)
              FROM chat_read_status
              WHERE chat_room_id = ? AND last_read_message_id >= m.id
            ) AS read_count
     FROM chat_messages m
     WHERE m.chat_room_id = ?
     ORDER BY m.id DESC
     LIMIT 100`,
    [room_id, room_id]
  );

  // 마지막 메시지 ID 기준으로 읽음 처리
  const last_message_id = messages.length > 0 ? messages[0].message_id : 0;

  await conn.query(
    `INSERT INTO chat_read_status (chat_room_id, user_id, last_read_message_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE last_read_message_id = ?`,
    [room_id, user_id, last_message_id, last_message_id]
  );

  return messages;
};

// 🛠️ 채팅방 생성 및 입장
exports.enterChatRoom = async (user_id, reservation_id) => {
  const conn = getConnection();
  const [existingReservation] = await conn.query(
    'SELECT reservation_match FROM reservation_table WHERE reservation_id = ?'
  , [reservation_id]);
  if (existingReservation.length == 0) {
    const err = new Error("존재하지 않는 모임입니다.");
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
    [chat_room_id, user_id]
  );

  return {
    chat_room_id,
    message: '입장 완료',
  };
};