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

// 🆕 채팅방 상세 정보 조회
exports.getChatRoomDetail = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;

    console.log('🔍 [API] 채팅방 상세 정보 조회 요청:', { user_id, roomId, timestamp: new Date().toISOString() });

    const data = await chatService.getChatRoomDetail(user_id, roomId);

    res.status(200).json({ 
      success: true, 
      message: '채팅방 정보 조회 성공',
      data 
    });
  } catch (err) {
    console.error('❌ [API] 채팅방 상세 정보 조회 에러:', err);
    next(err);
  }
};

// 👋 채팅방 나가기 = 모임 완전 탈퇴
exports.leaveChatRoom = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;

    const result = await chatService.leaveChatRoom(user_id, roomId);

    res.status(200).json({ 
      success: true, 
      message: result.is_host_left 
        ? (result.new_host_id ? '모임을 나가고 방장 권한이 이양되었습니다.' : '모임을 나가고 모임이 해산되었습니다.')
        : '모임을 나갔습니다.',
      data: result
    });
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

// 🏪 채팅용 가게 리스트 조회
exports.getStoreListForChat = async (req, res, next) => {
  try {
    const { keyword, limit = 10 } = req.query;
    
    const stores = await chatService.getStoreListForChat(keyword, parseInt(limit));
    
    res.status(200).json({ 
      success: true, 
      data: stores 
    });
  } catch (err) {
    next(err);
  }
};

// 🏪 가게 공유 메시지 전송
exports.shareStore = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;
    const { store_id } = req.body;

    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: '가게 ID가 필요합니다.'
      });
    }

    const result = await chatService.shareStore(user_id, roomId, store_id);
    
    res.status(200).json({ 
      success: true, 
      message: '가게 정보가 공유되었습니다.',
      data: result 
    });
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

// 👥 채팅방 참여자 목록 조회
exports.getChatParticipants = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;

    const data = await chatService.getChatParticipants(user_id, roomId);

    res.status(200).json({
      success: true,
      message: '참여자 목록 조회 성공',
      data: data
    });
  } catch (err) {
    next(err);
  }
};

// 🚫 참여자 강퇴 (방장 전용) - 새로운 엔드포인트
exports.kickParticipant = async (req, res, next) => {
  try {
    const requester_id = req.user.user_id;
    const { roomId, userId } = req.params;
    const { reason } = req.body || {};

    // 기존 kickUser 함수 재사용하되 응답 형태 개선
    const result = await chatService.kickUser(roomId, userId, requester_id);

    res.status(200).json({
      success: true,
      message: '참여자가 강퇴되었습니다',
      data: {
        kicked_user_id: result.kicked_user_id,
        kicked_user_name: result.kicked_user_name || '알 수 없는 사용자',
        remaining_participants: result.remaining_participants || 0,
        kicked_at: new Date().toISOString(),
        reason: reason || '관리자 권한으로 강퇴'
      }
    });
  } catch (err) {
    next(err);
  }
};

// 🧹 전체 시스템 중복 데이터 정리 (관리자용)
exports.cleanupDuplicateData = async (req, res, next) => {
  try {
    console.log('🧹 [API] 중복 데이터 정리 요청 받음');
    
    const result = await chatService.cleanupAllDuplicateChatRoomUsers();

    res.status(200).json({
      success: true,
      message: '중복 데이터 정리가 완료되었습니다.',
      data: result
    });
  } catch (err) {
    console.error('❌ [API] 중복 데이터 정리 중 오류:', err);
    next(err);
  }
};

// 🏪 채팅방 가게 선택 (방장 전용)
exports.selectStore = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;
    const { store_id } = req.body;

    console.log('🏪 [API] 가게 선택 요청 시작:', {
      user_id,
      roomId,
      store_id: store_id || 'null (선택 해제)',
      timestamp: new Date().toISOString()
    });

    const result = await chatService.selectStore(user_id, roomId, store_id);

    console.log('✅ [API] 가게 선택 성공:', {
      user_id,
      roomId,
      result: {
        chat_room_id: result.chat_room_id,
        selected_store_id: result.selected_store?.store_id || null,
        selected_store_name: result.selected_store?.store_name || null,
        message: result.message
      }
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        chat_room_id: result.chat_room_id,
        selected_store_id: result.selected_store?.store_id || null,
        selected_store_name: result.selected_store?.store_name || null,
        selected_store_address: result.selected_store?.store_address || null,
        selected_store_rating: result.selected_store?.store_rating || null,
        selected_store_thumbnail: result.selected_store?.store_thumbnail || null,
        selected_at: result.selected_store?.selected_at || null,
        selected_by: result.selected_store?.selected_by || null
      }
    });
  } catch (err) {
    console.error('❌ [API] 가게 선택 중 오류:', err);
    console.error('에러 상세:', err.stack);
    next(err);
  }
};

// 💰 채팅방 정산 시작 (방장 전용)
exports.startPayment = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;
    const { payment_per_person } = req.body;

    console.log('💰 [API] 정산 시작 요청:', {
      user_id,
      roomId,
      payment_per_person
    });

    const result = await chatService.startPayment(user_id, roomId, payment_per_person);

    res.status(200).json({
      success: true,
      message: '정산이 시작되었습니다.',
      data: result
    });
  } catch (err) {
    console.error('❌ [API] 정산 시작 중 오류:', err);
    next(err);
  }
};

// 💰 개별 입금 완료 처리
exports.completePayment = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;
    const { payment_method } = req.body;

    console.log('💰 [API] 입금 완료 요청:', {
      user_id,
      roomId,
      payment_method
    });

    const result = await chatService.completePayment(user_id, roomId, payment_method);

    res.status(200).json({
      success: true,
      message: '입금이 완료되었습니다.',
      data: result
    });
  } catch (err) {
    console.error('❌ [API] 입금 완료 중 오류:', err);
    next(err);
  }
};

// 💰 정산 상태 조회
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { roomId } = req.params;

    console.log('💰 [API] 정산 상태 조회 요청:', {
      user_id,
      roomId
    });

    const result = await chatService.getPaymentStatus(user_id, roomId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('❌ [API] 정산 상태 조회 중 오류:', err);
    next(err);
  }
};