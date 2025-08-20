// src/routes/user_routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const authController = require('../controllers/auth_controller');
const storeController = require('../controllers/store_controller');
const authMiddleware = require('../middlewares/authMiddleware');

// 인증 관련
router.post('/login', authController.login);
router.post('/register', userController.registerUser);
router.post('/store/login', authController.storeLogin);
router.post('/store/register', storeController.registerStore);

// 아이디 중복 검사 (토큰 불필요)
router.post('/check-duplicate', userController.checkUserIdDuplicate);

// 사용자 관련
router.get('/me/reviews', authMiddleware, userController.getMyReviews);
router.get('/me', authMiddleware, userController.getMyProfile);
router.get('/me/matchings', authMiddleware, userController.getMyMatchings);
router.get('/me/reservations', authMiddleware, userController.getMyReservations);
router.put('/me', authMiddleware, userController.updateProfile);
router.put('/me/password', authMiddleware, userController.updatePassword);
router.post('/login', authController.login);
router.post('/register', userController.registerUser);
router.get('/:userId/profile', authMiddleware, userController.getUserProfile);

// 🆕 사용자 설정 변경 (PATCH /users/me)
router.patch('/me', authMiddleware, userController.updateUserSettings);

// 🆕 회원 탈퇴 (DELETE /users/me)
router.delete('/me', authMiddleware, userController.deleteUser);

// 🆕 1단계: 기본 사업자 회원가입 (POST /users/store/register/basic)
router.post('/store/register/basic', storeController.registerStoreBasic);

// 🆕 2단계: 사업자 정보 등록 (POST /users/store/:storeId/business-registration)
router.post('/store/:storeId/business-registration', storeController.completeBusinessRegistration);

// 🆕 사업자 등록 상태 확인 (GET /users/store/:storeId/business-registration/status)
router.get('/store/:storeId/business-registration/status', storeController.checkBusinessRegistrationStatus);

module.exports = router;
