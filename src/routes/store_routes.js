// 🛣️ storeRoutes.js
// /api/v1/stores 하위 경로 라우팅 정의

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store_controller');
const authMiddleware = require('../middlewares/authMiddleware');

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

// 🆕 매장 정보 조회 (GET /stores/me) - 사장님만 접근 가능
router.get('/me', authMiddleware, storeController.getMyStoreInfo);

// 🆕 매장 기본 정보 수정 (PUT /stores/me/basic-info) - 사장님만 접근 가능
router.put('/me/basic-info', authMiddleware, storeController.updateMyStoreBasicInfo);

// 🆕 매장 상세 정보 수정 (PUT /stores/me/details) - 사장님만 접근 가능
router.put('/me/details', authMiddleware, storeController.updateMyStoreDetails);

// 🆕 예약 설정 수정 (PUT /stores/me/settings/reservation) - 사장님만 접근 가능
router.put('/me/settings/reservation', authMiddleware, storeController.updateMyStoreReservationSettings);

module.exports = router; 