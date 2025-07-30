const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

// 회원가입 (POST /register)
router.post('/', userController.registerUser);

module.exports = router;
