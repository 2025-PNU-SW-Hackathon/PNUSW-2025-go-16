//  services/auth_service.js


const { getConnection } = require('../config/db_config'); // 데이터베이스 연결 모듈
const bcrypt = require('bcryptjs'); // 비밀번호 해싱 라이브러리
const jwt = require('jsonwebtoken'); // JWT 라이브러리


// 🔑  사용자 로그인 서비스
exports.loginUser = async (user_id, password) => {
    const conn = getConnection();
    try {
      // user_id로 db에서 사용자 찾기
      const [rows] = await conn.query(
        `SELECT user_id, user_pwd, user_name, user_email, user_phone_number, user_gender FROM user_table WHERE user_id = ?`,
        [user_id]
      );
  
      if (rows.length === 0) {
        const err = new Error('아이디 또는 비밀번호가 잘못되었습니다.');
        err.statusCode = 401;
        err.errorCode = 'INVALID_CREDENTIALS';
        throw err;
      }
  
      const user = rows[0];
  
      // 입력된 비밀번호와 저장된 해시된 비밀번호 비교
      const isMatch = await bcrypt.compare(password, user.user_pwd);
      if (!isMatch) {
        const err = new Error('아이디 또는 비밀번호가 잘못되었습니다.');
        err.statusCode = 401;
        err.errorCode = 'INVALID_CREDENTIALS';
        throw err;
      }
  
      // 로그인 성공 시 JWT 토큰 생성
      const payload = {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email
      };
  
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1h' }
      );
  
      // 비밀번호 필드를 제거하고 사용자 정보 반환
      delete user.user_pwd;
  
      return { token, user };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
        error.message = '로그인 중 오류가 발생했습니다.';
      }
      throw error;
    }
  };

