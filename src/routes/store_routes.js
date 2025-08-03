// 🛣️ storeRoutes.js
// /api/v1/stores 하위 경로 라우팅 정의

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store_controller');

// 가게 목록 조회 (GET /stores)
router.get('/', storeController.getStoreList);

module.exports = router; 