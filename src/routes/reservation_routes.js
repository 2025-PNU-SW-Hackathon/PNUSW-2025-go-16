// 🛣️ reservationRoutes.js
// /api/v1/reservations 하위 경로 라우팅 정의

const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation_controller');
const authMiddleware = require('../middlewares/authMiddleware');

// 모임 생성 (POST /reservations)
router.post('/', authMiddleware, reservationController.createReservation);

// 모임 참여 (POST /reservations/:reservation_id/join)
router.post('/:reservation_id/join', authMiddleware, reservationController.joinReservation);

// 모임 리스트 조회 (GET /reservations)
router.get('/', reservationController.getReservationList);

// 모임 삭제 (DELETE /reservations/:reservation_id)
router.delete(
  '/:reservation_id',
  authMiddleware,
  reservationController.cancelReservation
);

// 모임 세부 정보 조회 (GET /reservations/:reservation_id)
router.get(
  '/:reservation_id',
  authMiddleware,
  reservationController.getReservationDetail
);


module.exports = router;