// 🎮 chat_controller.js
// 채팅 기능 요청을 받아 서비스로 전달하고 응답 처리

const chatService = require('../services/chat_service');

// 💬 채팅방 목록 조회
exports.getChatRooms = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const data = await chatService.getChatRooms(user_id);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// 👋 채팅방 나가기
exports.leaveChatRoom = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;

    await chatService.leaveChatRoom(user_id, roomId);

    res.status(200).json({ success: true, message: '채팅방을 나갔습니다' });
  } catch (err) {
    next(err);
  }
};

// 📌 채팅방 상태 변경
exports.updateChatRoomStatus = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;
    const { status } = req.body;

    await chatService.updateChatRoomStatus(user_id, roomId, status);

    res.status(200).json({ success: true, message: '채팅방 상태가 예약완료로 변경되었습니다' });
  } catch (err) {
    next(err);
  }
};

// 🚫 채팅방 유저 강퇴
exports.kickUserFromRoom = async (req, res, next) => {
  try {
    const requester_id = req.user.user_id;
    const { roomId, userId: target_user_id } = req.params;

    await chatService.kickUser(roomId, target_user_id, requester_id);

    res.status(200).json({ success: true, message: '유저를 채팅방에서 강퇴했습니다' });
  } catch (err) {
    next(err);
  }
};

// 📨 채팅방 전체 메시지 조회 + 읽음 처리
exports.getAllMessages = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;

    const data = await chatService.getAllMessages(user_id, roomId);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// 🛠️ 채팅방 생성 및 입장
exports.enterChatRoom = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { group_id } = req.body;

    const result = await chatService.enterChatRoom(user_id, group_id);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// 💰 결제 관련 컨트롤러

// 방장의 예약금 결제 요청
exports.requestPayment = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.user_id;
    const { amount, message } = req.body;

    // 기본 유효성 검사
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '올바른 결제 금액을 입력해주세요.'
      });
    }

    const result = await chatService.requestPayment(roomId, userId, { amount, message });

    res.json({
      success: true,
      message: '예약금 결제 요청 메시지가 발송되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 결제 상태 확인
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.user_id;

    const paymentStatus = await chatService.getPaymentStatus(roomId, userId);

    res.json({
      success: true,
      data: paymentStatus
    });
  } catch (err) {
    next(err);
  }
};

// 결제 처리
exports.processPayment = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.user_id;
    const { payment_method, payment_amount } = req.body;

    // 기본 유효성 검사
    if (!payment_method || !payment_amount) {
      return res.status(400).json({
        success: false,
        message: '결제 방법과 금액을 입력해주세요.'
      });
    }

    const result = await chatService.processPayment(roomId, userId, { payment_method, payment_amount });

    res.json({
      success: true,
      message: '결제가 완료되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 결제 미완료 참가자 강퇴
exports.kickUnpaidParticipant = async (req, res, next) => {
  try {
    const { roomId, userId } = req.params;
    const requesterId = req.user.user_id;

    const result = await chatService.kickUnpaidParticipant(roomId, userId, requesterId);

    res.json({
      success: true,
      message: '참가자가 성공적으로 강퇴되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};