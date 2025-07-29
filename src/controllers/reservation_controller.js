// 🎮 reservationController.js
// 요청을 받아 서비스로 전달하고 응답 처리

const reservationService = require('../services/reservation_service');

exports.cancelReservation = async (req, res, next) => {
  try {
    const { reservation_id } = req.params;
    const user_id = req.user.user_id;

    const result = await reservationService.cancelReservation(reservation_id, user_id);

    res.status(200).json({ success: true, message: result });
  } catch (error) {
    next(error);
  }
};

exports.getReservationDetail = async (req, res, next) => {
  try {
    const { reservation_id } = req.params;
    const detail = await reservationService.getReservationDetail(reservation_id);

    res.status(200).json({ success: true, data: detail });
  } catch (error) {
    next(error);
  }
};

// 🧾 모임 생성 컨트롤러
exports.createReservation = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const data = req.body;

    const result = await reservationService.createReservation(user_id, data);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 🙋 모임 참여 컨트롤러
exports.joinReservation = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const reservation_id = req.params.reservation_id;

    const result = await reservationService.joinReservation(user_id, reservation_id);

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// 🔍 모임 리스트 조회 컨트롤러
exports.getReservationList = async (req, res, next) => {
  try {
    const filters = req.query;
    const data = await reservationService.getReservationList(filters);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};