// src/controllers/user_controller.js
const userService = require('../services/user_service');

// 👤 회원가입 컨트롤러
exports.registerUser = async (req, res, next) => {
  try {
    const {
      user_id,
      user_pwd,
      user_email,
      user_name,
      user_phone_number,
      user_region,
      user_gender
    } = req.body;

    // 필수 필드 검증
    if (!user_id || !user_pwd || !user_email || !user_name || !user_phone_number) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다. (user_id, user_pwd, user_email, user_name, user_phone_number)'
      });
    }

    // 기본값 설정 (user_gender는 int 타입)
    const userData = {
      user_id,
      user_pwd,
      user_email,
      user_name,
      user_phone_number,
      user_region: user_region || '미지정',
      user_gender: user_gender || 0  // 0: 미지정, 1: 남성, 2: 여성
    };

    const result = await userService.registerUser(userData);
    
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user_id: result.user_id,
        user_name: result.user_name,
        user_email: result.user_email
      }
    });
  } catch (err) {
    next(err);
  }
};

// 👤 사용자 프로필 조회 컨트롤러
exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const userProfile = await userService.getUserProfile(userId);
    
    res.json({
      success: true,
      data: {
        user_id: userProfile.user_id,
        nickname: userProfile.user_name,
        profile_image_url: userProfile.user_thumbnail || null
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const data = await userService.getMyReviews(user_id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const data = await userService.getMyProfile(user_id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMyMatchings = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const data = await userService.getMyMatchings(user_id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// 완료되지 않은 참여 모임
exports.getMyReservations = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const data = await userService.getMyReservations(user_id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const profileData = req.body;
    await userService.updateProfile(user_id, profileData);
    res.status(200).json({ success: true, message: '프로필이 수정되었습니다.' });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { old_password, new_password } = req.body;
    await userService.updatePassword(user_id, old_password, new_password);
    res.status(200).json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// 🆕 사용자 설정 변경
exports.updateUserSettings = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { push_notifications_enabled, marketing_opt_in } = req.body;
    
    await userService.updateUserSettings(user_id, {
      push_notifications_enabled,
      marketing_opt_in
    });
    
    res.json({
      success: true,
      message: '설정이 성공적으로 변경되었습니다.'
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 회원 탈퇴
exports.deleteUser = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { password } = req.body; // 비밀번호 확인용
    
    await userService.deleteUser(user_id, password);
    
    res.json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다.'
    });
  } catch (err) {
    next(err);
  }
};
