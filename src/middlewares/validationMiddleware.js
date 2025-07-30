// middlewares/validationMiddleware.js

exports.validateRegistration = (req, res, next) => {
    const { user_id, user_pwd, user_email, user_name, user_phone_number } = req.body;
  
    // 필수 필드 검사
    if (!user_id || !user_pwd || !user_email || !user_name || !user_phone_number) {
      return res.status(400).json({
        success: false,
        message: 'All required fields (user_id, user_pwd, user_email, user_name, user_phone_number) must be provided.',
      });
    }

    if (user_pwd.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
      }

    if (!user_email.includes('@') || !user_email.includes('.')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format.',
        });
      }


      //TODO: 이메일 중복 검사
      //전화번호 중복 검사
      //이름 중복 검사

      next();
    };
