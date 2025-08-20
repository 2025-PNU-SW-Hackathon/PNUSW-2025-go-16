// src/services/user_service.js
const { getConnection } = require('../config/db_config');
const bcrypt = require('bcryptjs');

// 👤 아이디 중복 검사 서비스
exports.checkUserIdDuplicate = async (user_id) => {
  const conn = getConnection();
  
  try {
    // 사용자 ID 조회
    const [users] = await conn.query(
      'SELECT user_id FROM user_table WHERE user_id = ?',
      [user_id]
    );

    if (users.length > 0) {
      return {
        success: false,
        message: '이미 사용 중인 아이디입니다.',
        isDuplicate: true
      };
    }

    return {
      success: true,
      message: '사용 가능한 아이디입니다.',
      isDuplicate: false
    };

  } catch (error) {
    console.error('아이디 중복 검사 중 오류:', error);
    throw new Error('아이디 중복 검사 중 오류가 발생했습니다.');
  }
};

// 👤 회원가입 서비스
exports.registerUser = async (userData) => {
  const conn = getConnection();
  
  try {
    const {
      user_id,
      user_pwd,
      user_email,
      user_name,
      user_phone_number,
      user_region,
      user_gender
    } = userData;

    // 이메일 중복 확인
    const [existingUsers] = await conn.query(
      'SELECT user_id FROM user_table WHERE user_email = ?',
      [user_email]
    );

    if (existingUsers.length > 0) {
      const err = new Error('이미 사용 중인 이메일입니다.');
      err.statusCode = 400;
      err.errorCode = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_pwd, salt);

    // 사용자 등록
    const [result] = await conn.query(
      `INSERT INTO user_table (
        user_id, user_pwd, user_email, user_name, user_phone_number, 
        user_region, user_gender, user_updated_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, hashedPassword, user_email, user_name, user_phone_number,
        user_region, user_gender, new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );

    return {
      user_id,
      user_name,
      user_email
    };

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '회원가입 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 👤 사용자 프로필 조회 서비스
exports.getUserProfile = async (userId) => {
  const conn = getConnection();
  
  try {
    const [rows] = await conn.query(
      `SELECT user_id, user_name, user_thumbnail 
       FROM user_table 
       WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      const err = new Error('사용자를 찾을 수 없습니다.');
      err.statusCode = 404;
      err.errorCode = 'USER_NOT_FOUND';
      throw err;
    }

    return rows[0];
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '사용자 프로필 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

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
    `SELECT r.reservation_id,
            r.store_id AS store_id,
            r.reservation_start_time,
            r.reservation_end_time,
            r.reservation_bio,
            r.reservation_match,
            r.reservation_status,
            r.reservation_participant_cnt,
            r.reservation_max_participant_cnt,
            r.reservation_ex2
     FROM chat_room_users cru
     JOIN chat_rooms cr ON cru.reservation_id = cr.reservation_id
     JOIN reservation_table r ON cr.reservation_id = r.reservation_id
     WHERE cru.user_id = ?
       AND r.reservation_start_time > NOW()`,
    [user_id]
  );
  return rows;
};

exports.getMyReservations = async (user_id) => {
  const conn = getConnection();
  
  console.log(`🔍 [DEBUG] 사용자 예약 조회 - user_id: ${user_id}`);
  
  const [rows] = await conn.query(
    `SELECT r.reservation_id,
            r.store_id AS store_id,
            r.reservation_start_time,
            r.reservation_end_time,
            r.reservation_bio,
            r.reservation_match,
            r.reservation_status,
            r.reservation_participant_cnt,
            r.reservation_max_participant_cnt,
            r.reservation_ex2
     FROM chat_room_users cru
     JOIN chat_rooms cr ON cru.reservation_id = cr.reservation_id
     JOIN reservation_table r ON cr.reservation_id = r.reservation_id
     WHERE cru.user_id = ?
       AND r.reservation_start_time >= NOW()
     ORDER BY r.reservation_start_time ASC`,
    [user_id]
  );
  
  console.log(`🔍 [DEBUG] 조회된 예약 수: ${rows.length}`);
  
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

exports.updatePassword = async (user_id, current_password, new_password) => {
  const conn = getConnection();
  
  // 현재 비밀번호 확인
  const [rows] = await conn.query(
    'SELECT user_pwd FROM user_table WHERE user_id = ?', 
    [user_id]
  );
  
  if (rows.length === 0) {
    const err = new Error('사용자를 찾을 수 없습니다.');
    err.statusCode = 404;
    throw err;
  }

  // bcrypt로 비밀번호 확인
  const isMatch = await bcrypt.compare(current_password, rows[0].user_pwd);
  if (!isMatch) {
    const err = new Error('기존 비밀번호가 일치하지 않습니다.');
    err.statusCode = 400;
    throw err;
  }

  // 새 비밀번호 해시화
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(new_password, salt);

  // 비밀번호 업데이트
  await conn.query(
    'UPDATE user_table SET user_pwd = ? WHERE user_id = ?',
    [hashedNewPassword, user_id]
  );
};

// 🆕 사용자 설정 변경
exports.updateUserSettings = async (user_id, settings) => {
  const conn = getConnection();
  try {
    const { push_notifications_enabled, marketing_opt_in } = settings;
    
    // ex1, ex2 필드를 활용하여 설정 저장
    await conn.query(
      'UPDATE user_table SET ex1 = ?, ex2 = ? WHERE user_id = ?',
      [
        push_notifications_enabled ? '1' : '0',
        marketing_opt_in ? '1' : '0',
        user_id
      ]
    );
    
    return true;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '사용자 설정 변경 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 회원 탈퇴
exports.deleteUser = async (user_id, password) => {
  const conn = getConnection();
  try {
    // 비밀번호 확인
    const [users] = await conn.query(
      'SELECT user_pwd FROM user_table WHERE user_id = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      const err = new Error('사용자를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, users[0].user_pwd);
    
    if (!isMatch) {
      const err = new Error('비밀번호가 일치하지 않습니다.');
      err.statusCode = 401;
      throw err;
    }
    
    // 관련 데이터 삭제 (예약 참여, 리뷰 등)
    await conn.query('DELETE FROM reservation_participant_table WHERE user_id = ?', [user_id]);
    await conn.query('DELETE FROM review_table WHERE user_id = ?', [user_id]);
    
    // 사용자 삭제
    await conn.query('DELETE FROM user_table WHERE user_id = ?', [user_id]);
    
    return true;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '회원 탈퇴 중 오류가 발생했습니다.';
    }
    throw error;
  }
};