// services/admin_notify_service.js
const { getIO } = require('../config/socket_hub');

/**
 * 관리자(Admin) 측에서 발생한 이벤트를 특정 채팅방에 브로드캐스트
 * @param {string} room - 이벤트를 보낼 채팅방 ID
 * @param {string} eventName - 소켓 이벤트명 (예: 'adminNotification')
 * @param {object} payload - 전송할 데이터
 */
exports.sendAdminEvent = (room, eventName, payload) => {
  const io = getIO();

  // 관리자 이벤트는 모든 유저에게 전송 (제외 없음)
  io.to(room).emit(eventName, payload);
};