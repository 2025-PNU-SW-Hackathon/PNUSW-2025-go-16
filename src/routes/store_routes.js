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

// 🆕 예약 설정 조회 (GET /stores/me/settings/reservation) - 사장님만 접근 가능
router.get('/me/settings/reservation', authMiddleware, storeController.getMyStoreReservationSettings);

// 🆕 예약 설정 수정 (PUT /stores/me/settings/reservation) - 사장님만 접근 가능
router.put('/me/settings/reservation', authMiddleware, storeController.updateMyStoreReservationSettings);

// 🆕 사장님 대시보드 현황 조회 (GET /stores/me/dashboard) - 사장님만 접근 가능
router.get('/me/dashboard', authMiddleware, storeController.getMyStoreDashboard);

// 🆕 사장님 예약 목록 현황 조회 (GET /stores/me/reservations) - 사장님만 접근 가능
router.get('/me/reservations', authMiddleware, storeController.getMyStoreReservations);

// 🆕 스포츠 카테고리 조회 (GET /stores/me/sports-categories) - 사장님만 접근 가능
router.get('/me/sports-categories', authMiddleware, storeController.getSportsCategories);

// 🆕 스포츠 카테고리 추가 (POST /stores/me/sports-categories) - 사장님만 접근 가능
router.post('/me/sports-categories', authMiddleware, storeController.addSportsCategory);

// 🆕 스포츠 카테고리 개별 삭제 (DELETE /stores/me/sports-categories/:category_name) - 사장님만 접근 가능
router.delete('/me/sports-categories/:category_name', authMiddleware, storeController.deleteSportsCategory);

// 🆕 사업자 정보 수정 (PUT /stores/me/business-info) - 사장님만 접근 가능
router.put('/me/business-info', authMiddleware, storeController.updateMyStoreBusinessInfo);

// 🆕 사장님 비밀번호 변경 (PUT /stores/me/password) - 사장님만 접근 가능
router.put('/me/password', authMiddleware, storeController.updateStorePassword);

// 🆕 매장 회원 탈퇴 (DELETE /stores/me) - 사장님만 접근 가능
router.delete('/me', authMiddleware, storeController.deleteMyStore);

module.exports = router; 