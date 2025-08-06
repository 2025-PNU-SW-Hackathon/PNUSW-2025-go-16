// 📁 controllers/paymentController.js
const paymentService = require('../services/paymentService');

exports.createPaymentRequest = async (req, res) => {
  try {
    const requester_id = req.user.user_id; // JWT에서 파싱된 user_id
    const result = await paymentService.createPaymentRequest({
      ...req.body,
      requester_id
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: err.message || '결제 요청 생성 실패' });
  }
};

exports.initiatePayment = async (req, res) => {
  try {
    const payer_id = req.user.user_id; // JWT에서 파싱된 user_id
    const result = await paymentService.initiatePayment({
      ...req.body,
      payer_id
    });
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '결제 승인 실패' });
  }
};

exports.releasePayments = async (req, res) => {
  try {
    const result = await paymentService.releasePayments(req.body.chat_room_id);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '정산 실패' });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const result = await paymentService.getPaymentStatus(req.params.chatRoomId);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '결제 상태 조회 실패' });
  }
};

exports.cancelPayment = async (req, res) => {
  try {
    const result = await paymentService.cancelPayment(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '결제 취소 실패' });
  }
};