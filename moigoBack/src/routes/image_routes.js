// src/routes/image_routes.js
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image_controller');

// 단건 이미지 스트리밍
// 예: GET /api/v1/images/2001
router.get('/:imageId', imageController.getImageById);

module.exports = router;