// 📦 reservationService.js
// DB 직접 접근하는 비즈니스 로직 모음

const { getConnection } = require('../config/db_config');
const chatService = require('../services/chat_service');

// 🧾 1. 모임 생성 서비스
exports.createReservation = async (user_id, data) => {
  const conn = getConnection();
  const {
    store_id,
    reservation_start_time,
    reservation_end_time,
    reservation_match,
    reservation_bio,
    reservation_max_participant_cnt,
    reservation_match_category,
  } = data;

  const createdAt = new Date(); // MySQL DATETIME 타입과 호환
  const [rows] = await conn.query('SELECT MAX(reservation_id) as maxId FROM reservation_table');
  const reservation_current_id = (rows[0].maxId || 0) + 1;

  const [result] = await conn.query(
    `INSERT INTO reservation_table
     (reservation_id, user_id, store_id, reservation_start_time, reservation_end_time,
      reservation_match, reservation_bio, reservation_max_participant_cnt,
      reservation_match_category, reservation_status, reservation_created_time,
      reservation_participant_cnt, reservation_participant_id, reservation_user_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?)`,
    [
      reservation_current_id,
      user_id,
      store_id,
      reservation_start_time,
      reservation_end_time,
      reservation_match,
      reservation_bio,
      reservation_max_participant_cnt,
      reservation_match_category,
      createdAt,
      user_id,      // participant_id 초기값 = user_id
      '알수없음',
    ]
  );

  const create_chatRoom = await chatService.enterChatRoom(user_id, reservation_current_id);
  return {
    reservation_id: reservation_current_id,
    created_at: createdAt.toISOString(),
  };
};

// 🙋 2. 모임 참여 서비스
exports.joinReservation = async (user_id, reservation_id) => {
  const conn = getConnection();

  // 이미 참여했는지 확인
  const [exists] = await conn.query(
    `SELECT * FROM chat_room_users WHERE user_id = ? AND reservation_id = ?`,
    [user_id, reservation_id]
  );
  if (exists.length > 0) {
    const err = new Error("이미 참여 중입니다.");
    err.statusCode = 409;
    err.errorCode = "ALREADY_JOINED";
    throw err;
  }

  // 모임 유효성 검사
  const [reservation] = await conn.query(
    `SELECT reservation_status FROM reservation_table WHERE reservation_id = ?`,
    [reservation_id]
  );
  if (reservation.length == 0 || reservation[0].reservation_status !== 0) {
    const err = new Error("참여할 수 없는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_ACTION";
    throw err;
  }

  // 참여 등록
  // 참여자 목록에 추가
  // 채팅방에 참여자로 추가
  const create_chatRoom = await chatService.enterChatRoom(user_id, reservation_id);

  // 참여자 수 증가 (reservation_table에 기록된 수치 업데이트)
  // 모임 정보 업데이트
  var reservation_status_value = reservation[0].reservation_participant_cnt+1 >= reservation[0].reservation_max_participant_cnt ? 1 : 0;
  await conn.query(
    `UPDATE reservation_table
    SET reservation_participant_cnt = reservation_participant_cnt + 1,
    reservation_status = ?
    WHERE reservation_id = ?`,
    [reservation_status_value, reservation_id]
  );

  // 현재 참여자 수 반환 (return 용)
  const [cnt] = await conn.query(
    `SELECT reservation_participant_cnt FROM reservation_table WHERE reservation_id = ?`,
    [reservation_id]
  );

  return {
    message: "모임에 참여하였습니다.",
    participant_cnt: cnt[0].reservation_participant_cnt,
  };
};

// 🔍 3. 모임 리스트 조회 서비스
exports.getReservationList = async (filters) => {
  const conn = getConnection();
  const { region, date, category, keyword } = filters;

  let query = `
    SELECT r.reservation_id, r.store_id, r.reservation_store_name,
           r.reservation_start_time, r.reservation_end_time,
           r.reservation_bio, r.reservation_match, r.reservation_status,
           r.reservation_participant_cnt,
           r.reservation_max_participant_cnt
    FROM reservation_table r
    LEFT JOIN store_table s ON r.store_id = s.store_id
    WHERE 1=1
  `;
  const params = [];

  if (region) {
    query += ` AND s.store_address LIKE ?`;
    params.push(`%${region}%`);
  }

  if (date) {
    query += ` AND DATE(r.reservation_start_time) = ?`;
    params.push(date);
  }

  if (category) {
    query += ` AND r.reservation_match_category = ?`;
    params.push(category);
  }

  if (keyword) {
    query += ` AND (r.reservation_match LIKE ? OR r.reservation_bio LIKE ?)`;
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  query += ` ORDER BY r.reservation_start_time ASC`;

  const [rows] = await conn.query(query, params);
  return rows;
};

// 2차 명세서 추가 부분
// 모임 취소 
exports.cancelReservation = async (reservation_id, user_id) => {
  const conn = getConnection();
  const [rows] = await conn.query(
    'SELECT user_id FROM reservation_table WHERE reservation_id = ?',
    [reservation_id]
  );

  if (rows.length === 0) {
    const error = new Error('예약을 찾을 수 없습니다.');
    error.status = 404;
    error.errorCode = 'RESERVATION_NOT_FOUND';
    throw error;
  }

  if (rows[0].user_id !== user_id) {
    const error = new Error('권한이 없습니다.');
    console.log(error);
    error.status = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  // ? 취소 후 로직 정의 필요
  await conn.query(
    'DELETE FROM reservation_table WHERE reservation_id = ?',
    [reservation_id]
  );
  // 모임 취소 알림.
  // 참여자에게 kicked 설정

  return '모임이 정상적으로 취소되었습니다.';
};

// 모임 세부 정보 전송
exports.getReservationDetail = async (reservation_id) => {
  const conn = getConnection();
  const [reservationRows] = await conn.query(
    'SELECT * FROM reservation_table WHERE reservation_id = ?',
    [reservation_id]
  );

  if (reservationRows.length === 0) {
    const error = new Error('예약을 찾을 수 없습니다.');
    error.status = 404;
    error.errorCode = 'RESERVATION_NOT_FOUND';
    throw error;
  }

  const reservation = reservationRows[0];

  const [participants] = await conn.query(
    `SELECT u.user_id, u.user_name
     FROM chat_room_users r
     JOIN user_table u ON r.user_id = u.user_id
     WHERE r.reservation_id = ?`,
    [reservation_id]
  );

  return {
    reservation_id: reservation.reservation_id,
    store_id: reservation.store_id,
    store_name: reservation.reservation_store_name,
    reservation_start_time: reservation.reservation_start_time,
    reservation_end_time: reservation.reservation_end_time,
    reservation_match: reservation.reservation_match,
    reservation_bio: reservation.reservation_bio,
    reservation_status: reservation.reservation_status,
    reservation_participant_cnt: reservation.reservation_participant_cnt,
    reservation_max_participant_cnt: reservation.reservation_max_participant_cnt,
    participants: participants
  };
};
