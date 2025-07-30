// 🔐 authController.js
// 요청을 받아 인증 관련 서비스로 전달하고 응답 처리 (로그인, 토큰 발급 등)

const authService = require('../services/auth_service'); 

exports.loginUser = async (req, res, next) => {
    try {
      const { user_id, user_pwd } = req.body; 
      
      // 기본 유효성 검사
      if (!user_id || !user_pwd) {
        return res.status(400).json({
          success: false,
          message: '아이디와 비밀번호를 입력해주세요.'
        });
      }
  
      // 로그인 서비스 호출
      const { token, user } = await authService.loginUser(user_id, user_pwd);
  
      // 로그인 성공 시
      res.json({
        success: true,
        message: '로그인 성공',
        token,
        data: {
          user_id: user.user_id,
          user_name: user.user_name,
          user_email: user.user_email,
          user_phone_number: user.user_phone_number
        }
      });
    } catch (err) {
      next(err);
    }
  };
