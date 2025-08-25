// src/controllers/review_controller.js
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const reviewService = require('../services/review_service');
const imageService  = require('../services/image_service');

/*
exports.createReview = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const reviewData = req.body;

    const review_id = await reviewService.createReview(user_id, reviewData);

    res.status(201).json({
      success: true,
      data: { review_id }
    });
  } catch (error) {
    next(error);
  }
};
*/
/**
 * POST /api/v1/reviews
 * Content-Type: multipart/form-data
 * form-data:
 *   - content, rating, store_id ... (reviewData)
 *   - images (File) 여러 장 (최대 5장)
 */
exports.createReview = [
  // ✅ 여러 장 이미지 받기
  upload.array('images', 5),

  async (req, res, next) => {
    console.log("enter review post");
    
    try {
      const user_id    = req.user?.user_id || req.body.user_id; // (인증 없이 body로도 받을 수 있게 보완)
      const reviewData = req.body;

      if (!user_id) {
        return res.status(400).json({ success: false, error: 'user_id required' });
      }

      // 1) 리뷰 생성 (텍스트/평점 등)
      const review_id = await reviewService.createReview(user_id, reviewData);

      // 2) 이미지 저장 (있으면)
      const files = Array.isArray(req.files) ? req.files : [];
      const savedImages = [];

      for (const file of files) {
        const saved = await imageService.saveImageLocal({
          ownerType: 'review',
          ownerId:   review_id,
          file,
          isPublic:  1, // 정책에 맞게 조정
        });
        savedImages.push(saved);
      }

      // 3) 응답 (이미지 배열 포함)
      res.status(201).json({
        success: true,
        data: {
          review_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }
];