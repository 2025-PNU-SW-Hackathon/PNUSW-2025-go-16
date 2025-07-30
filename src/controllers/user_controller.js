// 🎮 userController.js
// 요청을 받아 사용자 관련 서비스로 전달하고 응답 처리

const userService = require('../services/user_service');

// 📝 사용자 등록 (회원가입) 컨트롤러
exports.registerUser = async (req, res, next) => {
    try {
      const { user_id, user_pwd, user_email, user_name, user_phone_number, user_region, user_gender } = req.body;
      
      // 기본 유효성 검사
      if (!user_id || !user_pwd || !user_email || !user_name || !user_phone_number) {
        return res.status(400).json({
          success: false,
          message: '필수 필드가 누락되었습니다. (user_id, user_pwd, user_email, user_name, user_phone_number)'
        });
      }

      // 비밀번호 길이 검사
      if (user_pwd.length < 6) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 6자 이상이어야 합니다.'
        });
      }

      // 이메일 형식 검사
      if (!user_email.includes('@') || !user_email.includes('.')) {
        return res.status(400).json({
          success: false,
          message: '올바른 이메일 형식이 아닙니다.'
        });
      }

      const userData = {
        user_id,
        user_pwd,
        user_email,
        user_name,
        user_phone_number,
        user_region: user_region || "서울",
        user_gender: user_gender || 1
      };

      const result = await userService.registerUser(userData);
      
      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          user_id: result.user_id,
          user_name: result.user_name,
          user_email: result.user_email,
          user_phone_number: result.user_phone_number
        }
      });
    } catch (err) {
      next(err);
    }
  };
