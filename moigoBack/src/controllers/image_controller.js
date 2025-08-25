// src/controllers/image_controller.js
const userService = require('../services/user_service');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // req.file.buffer 사용
const imageService = require('../services/image_service');
const { getConnection } = require('../config/db_config');


// 사용자 프로필 이미지 저장
/**
 * POST /api/v1/users/me/thumbnail
 * form-data: { userId: <string|number>, thumbnail: <file> }
 */
exports.uploadThumbnail = [
  upload.single('thumbnail'),
  async (req, res, next) => {
    console.log('thumbnail enter');
    const conn = getConnection();

    try {
      const userId = req.body.userId;

      // 0) 입력 검증
      if (!userId || String(userId).trim().length === 0) {
        return res.status(400).json({ error: 'userId is required' });
      }
      if (!req.file) {
        return res.status(400).json({ error: '파일(thumbnail)이 필요합니다.' });
      }

      // 1) 이미지 저장 (images insert)
      const saved = await imageService.saveImageLocal({
        ownerType: 'user',
        ownerId: userId,
        file: req.file,
        isPublic: 0,
      }); // { image_id, object_key ... }

      // 2) 기존 썸네일 조회 (있으면 이후에 정리 가능)
      const [prevRows] = await conn.query(
        `SELECT user_thumbnail FROM user_table WHERE user_id = ?`,
        [userId]
      );
      const prevImageId = prevRows?.[0]?.user_thumbnail || null;

      // 3) user_table 업데이트 (images.id 매핑)
      const [upd] = await conn.query(
        `UPDATE user_table SET user_thumbnail = ? WHERE user_id = ?`,
        [saved.image_id, userId]
      );

      // 3-1) 사용자 없음 → 막 저장한 이미지 고아 방지 처리(선택)
      if (upd.affectedRows === 0) {
        // user가 없으면 방금 저장한 이미지 지워서 고아 방지
        try { await imageService.deleteImage(saved.image_id); } catch (_) {}
        return res.status(404).json({ error: 'USER_NOT_FOUND' });
      }

      // 4) 이전 이미지 삭제 (선택)
      // if (prevImageId && Number(prevImageId) !== Number(saved.image_id)) {
      //   try { await imageService.deleteImage(prevImageId); } catch (_) {}
      // }

      return res.json({
        ok: true,
        image_id: saved.image_id,
        object_key: saved.object_key,
      });
    } catch (err) {
      next(err);
    }
  }
];
