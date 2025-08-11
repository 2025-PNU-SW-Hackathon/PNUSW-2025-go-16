// 🛣️ storeRoutes.js
// /api/v1/stores 하위 경로 라우팅 정의

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store_controller');

// 가게 목록 조회 (GET /stores)
router.get('/', storeController.getStoreList);

// 가게 상세 정보 조회 (GET /stores/:storeId/detail)
router.get('/:storeId/detail', storeController.getStoreDetail);

// 가게 결제 정보 조회 (GET /stores/:storeId/payment-info)
router.get('/:storeId/payment-info', storeController.getStorePaymentInfo);

// 가게 결제 정보 수정 (PUT /stores/:storeId/payment-info)
router.put('/:storeId/payment-info', storeController.updateStorePaymentInfo);

// 은행 코드 목록 조회 (GET /stores/banks)
router.get('/banks', storeController.getBankCodes);

module.exports = router; 