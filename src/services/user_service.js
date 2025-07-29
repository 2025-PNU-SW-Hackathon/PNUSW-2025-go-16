// src/services/user_service.js
const { getConnection } = require('../config/db_config');

exports.getMyReviews = async (user_id) => {
  const conn = getConnection();
  const [rows] = await conn.query(
    `SELECT r.review_id, r.store_id, s.store_name, r.review_text, r.review_rating, r.review_created_time
     FROM review_table r
     JOIN store_table s ON r.store_id = s.store_id
     WHERE r.user_id = ?`,
    [user_id]
  );
  return rows;
};

exports.getMyProfile = async (user_id) => {
  const conn = getConnection();
  const [rows] = await conn.query(
    `SELECT user_id, user_name, user_email, user_region, user_gender, user_phone_number, user_thumbnail
     FROM user_table WHERE user_id = ?`,
    [user_id]
  );
  return rows[0];
};

exports.getMyMatchings = async (user_id) => {
  const conn = getConnection();
  const [rows] = await conn.query(
    `SELECT r.reservation_id, r.reservation_match, r.reservation_start_time, r.reservation_store_name as store_name,
            '참여완료' as status
     FROM reservation_participant_table p
     JOIN reservation_table r ON p.reservation_id = r.reservation_id
     WHERE p.user_id = ?`,
    [user_id]
  );
  return rows;
};

exports.updateProfile = async (user_id, data) => {
  const conn = getConnection();
  const { user_name, user_region, user_phone_number, user_thumbnail } = data;
  await conn.query(
    `UPDATE user_table SET user_name=?, user_region=?, user_phone_number=?, user_thumbnail=?, user_updated_time=NOW()
     WHERE user_id = ?`,
    [user_name, user_region, user_phone_number, user_thumbnail, user_id]
  );
};

exports.updatePassword = async (user_id, old_password, new_password) => {
  const conn = getConnection();
  const [rows] = await conn.query('SELECT user_pwd FROM user_table WHERE user_id = ?', [user_id]);
  if (rows.length === 0 || rows[0].user_pwd !== old_password) {
    const err = new Error('기존 비밀번호가 일치하지 않습니다.');
    err.status = 400;
    err.errorCode = 'WRONG_PASSWORD';
    throw err;
  }
  await conn.query('UPDATE user_table SET user_pwd = ? WHERE user_id = ?', [new_password, user_id]);
};