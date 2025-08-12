const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db_config');

// 일반 사용자 로그인
exports.login = async (user_id, user_pwd) => {
  const conn = getConnection();
  
  try {
    // 사용자 조회
    const [users] = await conn.query(
      'SELECT * FROM user_table WHERE user_id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return {
        success: false,
        message: '존재하지 않는 사용자입니다.'
      };
    }

    const user = users[0];

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(user_pwd, user.user_pwd);
    
    if (!isMatch) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
      };
    }

    // JWT 토큰 생성
    const payload = {
      user_id: user.user_id,
      user_name: user.user_name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    return {
      success: true,
      message: '로그인 성공',
      data: {
        token,
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          user_email: user.user_email,
          user_region: user.user_region
        }
      }
    };

  } catch (error) {
    console.error('로그인 중 오류:', error);
    throw new Error('로그인 중 오류가 발생했습니다.');
  }
};

// 사장님 로그인
exports.storeLogin = async (store_id, store_pwd) => {
  const conn = getConnection();
  
  try {
    // 가게 조회
    const [stores] = await conn.query(
      'SELECT * FROM store_table WHERE store_id = ?',
      [store_id]
    );

    if (stores.length === 0) {
      return {
        success: false,
        message: '존재하지 않는 가게입니다.'
      };
    }

    const store = stores[0];

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(store_pwd, store.store_pwd);
    
    if (!isMatch) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
      };
    }

    // JWT 토큰 생성
    const payload = {
      store_id: store.store_id,
      store_name: store.store_name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    return {
      success: true,
      message: '사장님 로그인 성공',
      data: {
        token,
        store: {
          store_id: store.store_id,
          store_name: store.store_name,
          business_number: store.business_number,
          store_address: store.store_address
        }
      }
    };

  } catch (error) {
    console.error('사장님 로그인 중 오류:', error);
    throw new Error('사장님 로그인 중 오류가 발생했습니다.');
  }
}; 