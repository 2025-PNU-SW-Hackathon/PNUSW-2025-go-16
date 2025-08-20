// services/push_message_factory.js
// Expo로 보낼 메시지(title/body/data...)를 "type"과 payload로 만들어주는 빌더.
// (명세서의 type별 필드를 그대로 반영)

function formatDateKST(iso) {
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

// ── type별 표시 템플릿 (title/body) ─────────────────────────
const templates = {
  // 일반 사용자
  CHAT_MESSAGE: ({ senderName, text }) => ({
    title: senderName ? `${senderName}님이 보낸 메시지` : '새 메시지',
    body: text ? String(text).slice(0, 80) : ''
  }),
  PAYMENT_REQUEST: ({ amount, dueAtISO, roomId }) => ({
    title: '예약금 결제가 필요해요',
    body:
      `${(amount ?? 0).toLocaleString()}원` +
      (dueAtISO ? `, 마감 ${formatDateKST(dueAtISO)}` : '') +
      (roomId ? ` (방 ${roomId})` : '')
  }),
  RESERVATION_CONFIRMED: ({ storeName, timeISO, roomId }) => ({
    title: '예약이 확정되었어요',
    body:
      `${storeName || '가게'}` +
      (timeISO ? `, ${formatDateKST(timeISO)}` : '') +
      (roomId ? ` (방 ${roomId})` : '')
  }),
  RESERVATION_REJECTED: ({ storeName, reason, roomId }) => ({
    title: '예약이 거절되었어요',
    body:
      `${storeName || '가게'}` +
      (reason ? ` / 사유: ${reason}` : '') +
      (roomId ? ` (방 ${roomId})` : '')
  }),
  RESERVATION_CANCELED: ({ canceledBy, roomId }) => ({
    title: '모임이 취소되었어요',
    body:
      `취소 주체: ${canceledBy === 'store' ? '사장님' : '방장'}` +
      (roomId ? ` (방 ${roomId})` : '')
  }),
  PAYMENT_SUCCESS: ({ amount }) => ({
    title: '결제가 완료되었어요',
    body: `${(amount ?? 0).toLocaleString()}원이 결제되었습니다`
  }),
  REFUND_COMPLETED: ({ amount }) => ({
    title: '환불이 완료되었어요',
    body: `${(amount ?? 0).toLocaleString()}원이 환불되었습니다`
  }),
  PAYMENT_FAILED: ({ reason }) => ({
    title: '결제에 실패했어요',
    body: reason ? `사유: ${reason}` : ''
  }),

  // 사장님
  RESERVATION_REQUESTED: ({ roomId, meta }) => ({
    title: '새 예약 요청이 도착했어요',
    body: meta?.peopleCount
      ? `인원 ${meta.peopleCount}` + (meta.time ? `, ${formatDateKST(meta.time)}` : '') + (roomId ? ` (방 ${roomId})` : '')
      : (meta?.time ? `${formatDateKST(meta.time)}` : '확인해주세요')
  }),
  PAYOUT_COMPLETED: ({ amount }) => ({
    title: '정산이 완료되었어요',
    body: `${(amount ?? 0).toLocaleString()}원이 정산되었습니다`
  })
};

// ── 공통 빌더: expo 메시지 1건 만들기 ───────────────────────
function buildExpoMessage({ to, type, data, options }) {
  // title/body 템플릿
  const t = templates[type] ? templates[type](data || {}) : { title: '알림', body: '' };

  // 프론트 계약(명세)대로 data 구성
  // (명세에 roomId가 포함되어 있어 유지함. 둘 중 하나만 쓰려면 너희 규칙에 맞춰 제거 가능)
  const payload = {
    v: 1,
    eventId:
      data?.eventId ||
      `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    // 공통 식별자
    reservationId: data?.reservationId,
    roomId: data?.roomId,
    // 각 타입별 필드 그대로 전달
    ...data
  };

  // 플랫폼 옵션 기본값
  const opts = {
    sound: 'default',
    priority: 'high',      // 예약/결제 계열은 high 권장
    channelId: 'default',  // Android
    ttl: 300,              // 5분
    ...options
  };

  return {
    to,
    title: t.title,
    body: t.body,
    data: payload,
    sound: opts.sound,
    priority: opts.priority,
    channelId: opts.channelId,
    ttl: opts.ttl,
    badge: opts.badge
  };
}

module.exports = { buildExpoMessage };