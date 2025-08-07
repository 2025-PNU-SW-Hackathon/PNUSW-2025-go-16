// 📁 routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment_controller');
const authMiddleware = require('../middlewares/authMiddleware'); // ✅ 미들웨어 import

// ✅ 인증 필요한 요청에 authMiddleware 추가
router.post('/request', authMiddleware, paymentController.createPaymentRequest);
router.post('/initiate', authMiddleware, paymentController.initiatePayment);
router.post('/release', authMiddleware, paymentController.releasePayments);
router.get('/status/:chatRoomId', authMiddleware, paymentController.getPaymentStatus);
router.post('/cancel', authMiddleware, paymentController.cancelPayment);

module.exports = router;