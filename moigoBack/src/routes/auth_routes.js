const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const userController = require('../controllers/user_controller');
const authMiddleware = require('../middlewares/authMiddleware');

// 로그인
router.post('/login', authController.login);

// 회원가입
router.post('/register', userController.registerUser);

// 로그아웃
router.post('/logout', authMiddleware, authController.logout);

module.exports = router; 