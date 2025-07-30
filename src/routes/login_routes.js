const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller'); // 인증 관련 로직을 처리할 컨트롤러


// 사용자 로그인 처리 (POST /login)
router.post('/login', authController.loginUser); 

module.exports = router;