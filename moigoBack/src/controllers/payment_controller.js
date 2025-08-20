// 📁 controllers/paymentController.js
const paymentService = require('../services/payment_service');
const pushService = require('../services/push_service');
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
      payer_id,
    });

    const statusCode = result.alreadyProcessed ? 201 : 200;

    res.status(statusCode).json({
      message: result.alreadyProcessed
        ? '이미 처리된 결제입니다.'
        : '결제가 성공적으로 완료되었습니다.',
      ...result,
    });
  } catch (err) {
    console.error(err);
    try {
      await pushService.sendPaymentFailedPush(req.body.chat_room_id, payer_id, null);
    } catch (err) {
      console.log(err);
    }
    // 서비스 레이어에서 throw 한 에러 코드/메시지 반영
    const status = err.status || 500;
    const code = err.code || 'PAYMENT_FAILED';
    const message = err.message || '결제 승인 실패';

    res.status(status).json({
      ok: false,
      code,
      message,
    });
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

// ---------------------- 추가: 예약 확정/거절 ----------------------

// ✅ 예약 확정 (사장님 전용)
exports.confirmReservationByStore = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);
    // authMiddleware가 세팅한 토큰 정보에서 우선 사용, 없으면 body의 store_id 백업
    const tokenStoreId = req.user?.store_id;
    const bodyStoreId  = req.body?.store_id;
    const storeId = tokenStoreId || bodyStoreId;

    if (!reservationId || !storeId) {
      return res.status(400).json({ ok: false, message: 'reservationId/store_id 누락' });
    }
    // 둘 다 있으면 동일성 체크
    if (tokenStoreId && bodyStoreId && tokenStoreId !== bodyStoreId) {
      return res.status(400).json({ ok: false, message: 'store_id 인증 불일치' });
    }

    const result = await paymentService.confirmReservationByStore({
      reservationId,
      storeId,
    });

    return res.json({ ok: true, ...result, status: 'confirmed' });
  } catch (err) {
    console.error('[confirmReservationByStore] error:', err);
    res.status(400).json({ ok: false, message: err.message || '예약 확정 실패' });
  }
};

// ✅ 예약 거절 (사장님 전용)
exports.rejectReservationByStore = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);
    const tokenStoreId = req.user?.store_id;
    const bodyStoreId  = req.body?.store_id;
    const storeId = tokenStoreId || bodyStoreId;

    if (!reservationId || !storeId) {
      return res.status(400).json({ ok: false, message: 'reservationId/store_id/reason 누락' });
    }
    if (tokenStoreId && bodyStoreId && tokenStoreId !== bodyStoreId) {
      return res.status(400).json({ ok: false, message: 'store_id 인증 불일치' });
    }

    const result = await paymentService.rejectReservationByStore({
      reservationId,
      storeId,
    });

    return res.json({ ok: true, ...result, status: 'rejected' });
  } catch (err) {
    console.error('[rejectReservationByStore] error:', err);
    res.status(400).json({ ok: false, message: err.message || '예약 거절 실패' });
  }
};