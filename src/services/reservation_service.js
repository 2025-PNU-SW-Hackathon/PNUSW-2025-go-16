// 📦 reservationService.js
// DB 직접 접근하는 비즈니스 로직 모음

const { getConnection } = require('../config/db_config');

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

  const createdAt = new Date().toISOString();

  const [result] = await conn.query(
    `INSERT INTO reservations
     (user_id, store_id, reservation_start_time, reservation_end_time,
      reservation_match, reservation_bio, reservation_max_participant_cnt,
      reservation_match_category, reservation_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      user_id,
      store_id,
      reservation_start_time,
      reservation_end_time,
      reservation_match,
      reservation_bio,
      reservation_max_participant_cnt,
      reservation_match_category,
      createdAt,
    ]
  );

  return {
    reservation_id: result.insertId,
    created_at: createdAt,
  };
};

// 🙋 2. 모임 참여 서비스
exports.joinReservation = async (user_id, reservation_id) => {
  const conn = getConnection();

  // 이미 참여한 경우 확인
  const [exists] = await conn.query(
    `SELECT * FROM reservation_participants WHERE user_id = ? AND reservation_id = ?`,
    [user_id, reservation_id]
  );
  if (exists.length > 0) {
    const err = new Error("이미 참여 중입니다.");
    err.statusCode = 409;
    err.errorCode = "ALREADY_JOINED";
    throw err;
  }

  // 모임 유효성 검사 (모집 중인지 확인)
  const [reservation] = await conn.query(
    `SELECT reservation_status FROM reservations WHERE reservation_id = ?`,
    [reservation_id]
  );
  if (!reservation.length || reservation[0].reservation_status !== 0) {
    const err = new Error("참여할 수 없는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_ACTION";
    throw err;
  }

  // 참가 등록
  await conn.query(
    `INSERT INTO reservation_participants (reservation_id, user_id) VALUES (?, ?)`,
    [reservation_id, user_id]
  );

  // 총 참여자 수 반환
  const [cnt] = await conn.query(
    `SELECT COUNT(*) AS participant_cnt FROM reservation_participants WHERE reservation_id = ?`,
    [reservation_id]
  );

  return {
    message: "모임에 참여하였습니다.",
    participant_cnt: cnt[0].participant_cnt,
  };
};

// 🔍 3. 모임 리스트 조회 서비스
exports.getReservationList = async (filters) => {
  const conn = getConnection();
  const { region, date, category, keyword } = filters;

  let query = `
    SELECT r.reservation_id, r.store_id, s.store_name,
           r.reservation_start_time, r.reservation_end_time,
           r.reservation_bio, r.reservation_match, r.reservation_status,
           COUNT(p.user_id) AS reservation_participant_cnt,
           r.reservation_max_participant_cnt
    FROM reservations r
    LEFT JOIN stores s ON r.store_id = s.store_id
    LEFT JOIN reservation_participants p ON r.reservation_id = p.reservation_id
    WHERE 1=1
  `;
  const params = [];

  if (region) {
    query += ` AND s.region = ?`;
    params.push(region);
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

  query += ` GROUP BY r.reservation_id ORDER BY r.reservation_start_time ASC`;

  const [rows] = await conn.query(query, params);
  return rows;
};
