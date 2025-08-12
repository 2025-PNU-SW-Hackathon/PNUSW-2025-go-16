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

// 사용자 관련
router.get('/me/reviews', authMiddleware, userController.getMyReviews);
router.get('/me', authMiddleware, userController.getMyProfile);
router.get('/me/matchings', authMiddleware, userController.getMyMatchings);
router.get('/me/reservations', authMiddleware, userController.getMyReservations);
router.put('/me', authMiddleware, userController.updateProfile);
router.put('/me/password', authMiddleware, userController.updatePassword);

// 사용자 프로필 조회 API
router.get('/:userId/profile', authMiddleware, userController.getUserProfile);

module.exports = router;
