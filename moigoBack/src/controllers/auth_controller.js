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

// 로그아웃
exports.logout = async (req, res, next) => {
  try {
    // JWT 토큰은 클라이언트에서 삭제하도록 처리
    // 서버에서는 토큰 블랙리스트 처리나 세션 무효화 로직을 추가할 수 있음
    res.json({ 
      success: true, 
      message: '로그아웃 되었습니다.' 
    });
  } catch (err) {
    next(err);
  }
};