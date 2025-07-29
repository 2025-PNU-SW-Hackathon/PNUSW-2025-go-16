// src/routes/user_routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/users/me/reviews', authMiddleware, userController.getMyReviews);
router.get('/users/me', authMiddleware, userController.getMyProfile);
router.get('/users/me/matchings', authMiddleware, userController.getMyMatchings);
router.put('/users/me', authMiddleware, userController.updateProfile);
router.put('/users/me/password', authMiddleware, userController.updatePassword);

module.exports = router;
