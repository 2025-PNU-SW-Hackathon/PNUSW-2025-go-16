// services/user_service.js

const { getConnection } = require('../config/db_config');
const bcrypt = require('bcryptjs');

// 사용자 등록 서비스
exports.registerUser = async (userData) => {
    const conn = getConnection();
    const {
      user_id,
      user_pwd,
      user_email,
      user_name,
      user_region,
      user_phone_number,
      user_gender,
    } = userData;

    try {
        // 사용자 ID 중복 확인
        const [existingUser] = await conn.query(
          `SELECT user_id FROM user_table WHERE user_id = ?`,
          [user_id]
        );
    
        if (existingUser.length > 0) {
          const err = new Error('이미 존재하는 사용자 ID입니다.');
          err.statusCode = 409;
          err.errorCode = 'DUPLICATE_USER_ID';
          throw err;
        }

        // 이메일 중복 확인
        const [existingEmail] = await conn.query(
          `SELECT user_id FROM user_table WHERE user_email = ?`,
          [user_email]
        );
    
        if (existingEmail.length > 0) {
          const err = new Error('이미 사용 중인 이메일입니다.');
          err.statusCode = 409;
          err.errorCode = 'DUPLICATE_EMAIL';
          throw err;
        }
    
        // 비밀번호 해싱
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user_pwd, salt);
    
        const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
        // 사용자 정보 데이터베이스에 삽입
        const [result] = await conn.query(
          `INSERT INTO user_table
           (user_id, user_pwd, user_email, user_name, user_region, user_phone_number,
            user_gender, user_updated_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user_id,
            hashedPassword,
            user_email,
            user_name,
            user_region,
            user_phone_number,
            user_gender,
            createdAt,
          ]
        );

        // 삽입된 사용자 정보 반환 (비밀번호 제외)
        return {
          user_id: user_id,
          user_email: user_email,
          user_name: user_name,
          user_phone_number: user_phone_number,
          user_region: user_region,
          user_gender: user_gender
        };
    } catch (error) {
      // 이미 정의된 에러가 아니면 일반 서버 에러로 처리
      if (!error.statusCode) {
        error.statusCode = 500;
        error.message = '회원가입 중 오류가 발생했습니다.';
      }
      throw error;
    }
  };
