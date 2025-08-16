// 🛣️ chat_routes.js
// /api/v1/chat 하위 경로 라우팅 정의

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat_controller');
const authMiddleware = require('../middlewares/authMiddleware');

// 채팅방 목록 조회 (GET /chats)
router.get('/', authMiddleware, chatController.getChatRooms);

// 채팅방 나가기 (DELETE /chats/:roomId/leave)
router.delete('/:roomId/leave', authMiddleware, chatController.leaveChatRoom);

// 채팅방 상태 변경 (PATCH /chats/:roomId/status)
router.patch('/:roomId/status', authMiddleware, chatController.updateChatRoomStatus);

// 채팅방 유저 강퇴 (DELETE /chats/:roomId/kick/:userId)
router.delete('/:roomId/kick/:userId', authMiddleware, chatController.kickUserFromRoom);

// 채팅방 전체 메시지 조회 (GET /chats/:roomId/all-messages)
router.get('/:roomId/all-messages', authMiddleware, chatController.getAllMessages);

// 채팅방 생성 및 입장
router.post('/enter', authMiddleware, chatController.enterChatRoom);

/*
// 💰 결제 관련 라우터
// 방장의 예약금 결제 요청 (POST /chats/:roomId/payments/request)
router.post('/:roomId/payments/request', authMiddleware, chatController.requestPayment);

// 결제 상태 확인 (GET /chats/:roomId/payments/status)
router.get('/:roomId/payments/status', authMiddleware, chatController.getPaymentStatus);

// 결제 처리 (POST /chats/:roomId/payments/process)
router.post('/:roomId/payments/process', authMiddleware, chatController.processPayment);

// 결제 미완료 참가자 강퇴 (DELETE /chats/:roomId/participants/:userId)
router.delete('/:roomId/participants/:userId', authMiddleware, chatController.kickUnpaidParticipant);
*/
module.exports = router;