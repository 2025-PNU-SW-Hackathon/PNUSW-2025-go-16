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