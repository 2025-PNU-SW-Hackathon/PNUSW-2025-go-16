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


// ✅ 예약 확정 / 거절 (사장님 동작)
// 경로 예: /api/v1/payments/reservations/:reservationId/confirm|reject
// ==============================
router.post(
  '/reservations/:reservationId/confirm',
  authMiddleware,
  paymentController.confirmReservationByStore
);

router.post(
  '/reservations/:reservationId/reject',
  authMiddleware,
  paymentController.rejectReservationByStore
);

module.exports = router;