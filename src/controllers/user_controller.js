// src/controllers/user_controller.js
const userService = require('../services/user_service');

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
