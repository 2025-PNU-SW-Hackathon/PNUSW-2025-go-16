// src/routes/user_routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me/reviews', authMiddleware, userController.getMyReviews);
router.get('/me', authMiddleware, userController.getMyProfile);
router.get('/me/matchings', authMiddleware, userController.getMyMatchings);
router.get('/me/reservations', authMiddleware, userController.getMyReservations);
router.put('/me', authMiddleware, userController.updateProfile);
router.put('/me/password', authMiddleware, userController.updatePassword);

// 사용자 프로필 조회 API
router.get('/:userId/profile', authMiddleware, userController.getUserProfile);

module.exports = router;
