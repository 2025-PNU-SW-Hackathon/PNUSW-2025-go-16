// 📁 routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/request', paymentController.createPaymentRequest);
router.post('/initiate', paymentController.initiatePayment);
router.post('/release', paymentController.releasePayments);
router.get('/status/:chatRoomId', paymentController.getPaymentStatus);
router.post('/cancel', paymentController.cancelPayment);

module.exports = router;