// src/controllers/user_controller.js
const userService = require('../services/user_service');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // req.file.buffer 사용
const imageService = require('../services/image_service');

// 👤 아이디 중복 검사 컨트롤러
exports.checkUserIdDuplicate = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    // 기본 검증
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 입력해주세요.'
      });
    }

    const result = await userService.checkUserIdDuplicate(user_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

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

    // 기존 서비스 호출 (리뷰 목록)
    const reviews = await userService.getMyReviews(user_id);
    // reviews 예시 요소:
    // {
    //   review_id, store_id, store_name,
    //   review_text, review_rating, review_created_time
    // }

    // 각 리뷰에 images 배열 붙이기
    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const imgs = await imageService.listImagesByOwner({
          ownerType: 'review',
          ownerId: r.review_id,
        });

        const images = imgs.map(img => ({
          image_id: img.image_id,
          url: `/api/v1/images/${img.image_id}`, // 바이너리 스트리밍 API
          mime_type: img.mime_type,
        }));

        return { ...r, images };
      })
    );

    res.status(200).json({ success: true, data: enriched });
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

/**
 * PUT /api/v1/users/me
 * Content-Type:
 *  - application/json (이미지 없이 텍스트만 수정)
 *  - multipart/form-data (텍스트 + thumbnail 파일 함께 수정)
 *
 * form-data keys:
 *  - user_name, user_email, user_phone_number, user_region (텍스트)
 *  - thumbnail (file, 선택)
 */
exports.updateProfile = [
  upload.single('thumbnail'), // 파일 없으면 그냥 무시됨
  async (req, res, next) => {
    try {
      const user_id = req.user.user_id;
      const profileData = req.body;

      // 1) 텍스트 필드 업데이트 (기존 로직 사용)
      await userService.updateProfile(user_id, profileData);

      // 2) 썸네일 파일이 있으면 이미지 저장 + user_table.user_thumbnail 매핑
      let thumbnailPayload = null;
      if (req.file) {
        // 2-1) 이미지 저장 (images 테이블 insert + 파일 저장)
        const saved = await imageService.saveImageLocal({
          ownerType: 'user',
          ownerId:   user_id,
          file:      req.file,
          isPublic:  1, // 공개 정책에 맞게 설정
        });

        // (선택) 이전 파일/레코드 삭제
        // if (prevImageId && Number(prevImageId) !== Number(saved.image_id)) {
        //   try { await imageService.deleteImage(prevImageId); } catch (_) {}
        // }

        // 응답에 노출할 썸네일 정보
        thumbnailPayload = {
          image_id: saved.image_id,
          url: `/api/v1/users/${user_id}/thumbnail`,
        };
      }

      // 3) 응답
      res.status(200).json({
        success: true,
        message: '프로필이 수정되었습니다.',
        data: {
          user_id,
          ...(profileData.user_name ? { user_name: profileData.user_name } : {}),
          ...(thumbnailPayload ? { thumbnail: thumbnailPayload } : {}),
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

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

/**
 * 프로필 이미지 업로드
 * POST /api/v1/users/me/thumbnail
 * form-data: { userId, thumbnail }
 */
exports.uploadThumbnail = [
  upload.single('thumbnail'),
  async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      if (!req.file) return res.status(400).json({ error: '파일이 필요합니다.' });

      // 이미지 저장
      const saved = await imageService.saveImageLocal({
        ownerType: 'user',
        ownerId: userId,
        file: req.file,
        isPublic: 1,
      });

      return res.json({
        ok: true,
        image_id: saved.image_id,
        object_key: saved.object_key,
      });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * 프로필 이미지 조회
 * GET /api/v1/users/:userId/thumbnail
 */
exports.getThumbnail = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await imageService.sendImageByOwner(res , {ownerId : userId, ownerType : 'user' ,index : 0});
  } catch (err) {
    next(err);
  }
};