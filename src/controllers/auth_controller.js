const authService = require('../services/auth_service');

// 일반 사용자 로그인
exports.login = async (req, res, next) => {
  try {
    const { user_id, user_pwd } = req.body;

    // 기본 검증
    if (!user_id || !user_pwd) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID와 비밀번호를 입력해주세요.'
      });
    }

    const result = await authService.login(user_id, user_pwd);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (err) {
    next(err);
  }
};

// 사장님 로그인
exports.storeLogin = async (req, res, next) => {
  try {
    const { store_id, store_pwd } = req.body;

    // 기본 검증
    if (!store_id || !store_pwd) {
      return res.status(400).json({
        success: false,
        message: '가게 ID와 비밀번호를 입력해주세요.'
      });
    }

    const result = await authService.storeLogin(store_id, store_pwd);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (err) {
    next(err);
  }
}; 