// routes/match_routes.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match_controller');

// 필요하면 인증 미들웨어 추가
// const authMiddleware = require('../middlewares/auth');

router.get('/', /* authMiddleware, */ matchController.listMatches);

module.exports = router;