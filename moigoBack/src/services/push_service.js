// services/push.js
// - 단일 파일: 공통 헬퍼 + 타입별 발송 함수
// - 명세 준수: reservationId만 사용 (roomId 제거)
// - Expo 전송, receipt 기반 만료 토큰 정리 포함

const { Expo } = require('expo-server-sdk');
const { getConnection } = require('../config/db_config');

const expo = new Expo();

// DB 테이블명
const USER_TOKEN_TABLE = 'user_push_tokens';   // (account_id, expo_token, updated_at)
const STORE_TOKEN_TABLE = 'store_push_tokens';  // (account_id, expo_token, updated_at)

async function saveUserExpoToken(account_id, expo_token) {
    const conn = getConnection();
    try {
        await conn.query(
            `INSERT INTO user_push_tokens
        (account_id, expo_token, updated_at, is_active, failure_count)
       VALUES (?, ?, NOW(), 1, 0)
       ON DUPLICATE KEY UPDATE
        updated_at = NOW(),
        is_active = 1,
        last_error_code = NULL,
        failure_count = 0`,
            [account_id, expo_token]
        );
        console.log(`✅ Expo token 저장 성공: ${account_id} - ${expo_token}`);
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            console.log('⚠️ [Push] user_push_tokens 테이블이 존재하지 않습니다. 토큰 저장을 건너뜁니다.');
            return;
        }
        console.error('❌ Expo token 저장 오류:', err);
        throw err;
    }
}

// 🏪 사장님 Expo 토큰 저장/업데이트
async function saveStoreExpoToken(store_id, expo_token) {
    const conn = getConnection();
    try {
        await conn.query(
            `INSERT INTO store_push_tokens
        (account_id, expo_token, updated_at, is_active, failure_count)
       VALUES (?, ?, NOW(), 1, 0)
       ON DUPLICATE KEY UPDATE
        updated_at = NOW(),
        is_active = 1,
        last_error_code = NULL,
        failure_count = 0`,
            [store_id, expo_token]
        );
        console.log(`✅ 사장님 Expo token 저장 성공: ${store_id} - ${expo_token}`);
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            console.log('⚠️ [Push] store_push_tokens 테이블이 존재하지 않습니다. 토큰 저장을 건너뜁니다.');
            return;
        }
        console.error('❌ 사장님 Expo token 저장 오류:', err);
        throw err;
    }
}


/* ============================================================
 * 공통 DB 헬퍼
 * ============================================================ */
async function q(sql, params = []) {
    const conn = getConnection();
    try {
        const [rows] = await conn.query(sql, params);
        return rows;
    } finally {
        if (typeof conn.release === 'function') conn.release();
    }
}

// ⚠️ reservationId 기준으로 참가자 user_id 조회
// ✅ reservation_id 기준 참여자 user_id 목록 (강퇴자 제외, 중복 제거)
async function getUserIdsByReservation(reservationId) {
    const rows = await q(
        `SELECT DISTINCT cru.user_id
       FROM chat_room_users AS cru
      WHERE cru.reservation_id = ?
        AND COALESCE(cru.is_kicked, 0) = 0`,
        [reservationId]
    );
    return rows.map(r => r.user_id);
}

// ✅ reservation_id로 가게(store) 식별
async function getStoreIdByReservation(reservationId) {
    const rows = await q(
        `SELECT rt.store_id
       FROM reservation_table AS rt
      WHERE rt.reservation_id = ?
      LIMIT 1`,
        [reservationId]
    );
    return rows.length ? rows[0].store_id : null;
}

async function getTokensByAccountIds(table, accountIds = []) {
    if (!Array.isArray(accountIds) || !accountIds.length) return [];
    try {
        const rows = await q(
            `SELECT expo_token FROM ${table} WHERE account_id IN (?)`,
            [accountIds]
        );
        return rows.map(r => r.expo_token);
    } catch (error) {
        // 테이블이 존재하지 않는 경우 빈 배열 반환
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log(`⚠️ [Push] ${table} 테이블이 존재하지 않습니다. 푸시 알림을 건너뜁니다.`);
            return [];
        }
        throw error;
    }
}

async function deleteTokens(table, tokens = []) {
    if (!Array.isArray(tokens) || !tokens.length) return;
    try {
        await q(`DELETE FROM ${table} WHERE expo_token IN (?)`, [tokens]);
    } catch (error) {
        // 테이블이 존재하지 않는 경우 조용히 건너뜀
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log(`⚠️ [Push] ${table} 테이블이 존재하지 않습니다. 토큰 삭제를 건너뜁니다.`);
            return;
        }
        throw error;
    }
}

/* ============================================================
 * 공통 전송기 (Expo + 만료 토큰 정리)
 * ============================================================ */
async function sendWithCleanup({ table, tokens, title, body, data, options }) {
  console.log('🚀 [Push] sendWithCleanup start:', { tokenCount: tokens.length, type: data?.type });

  const valid = [];
  const invalid = [];
  for (const t of tokens) (Expo.isExpoPushToken(t) ? valid : invalid).push(t);

  if (invalid.length) {
    console.warn('⚠️ [Push] Invalid expo tokens, deleting:', invalid);
    deleteTokens(table, invalid).catch(() => { });
  }
  if (!valid.length) {
    console.log('⚠️ [Push] No valid tokens found. Abort.');
    return { requested: tokens.length, sent: 0, invalid, tickets: [], receipts: [] };
  }

  const messages = valid.map(to => ({
    to,
    title: title || '알림',
    body: body || '',
    sound: options?.sound ?? 'default',
    priority: options?.priority ?? 'high',
    channelId: options?.channelId ?? 'default',
    ttl: options?.ttl ?? 300,
    data
  }));

  console.log(`📨 [Push] Prepared ${messages.length} messages`);

  const tickets = [];
  const idToToken = new Map();

  for (const chunk of expo.chunkPushNotifications(messages)) {
    console.log(`➡️ [Push] Sending chunk of size ${chunk.length}`);
    try {
      const res = await expo.sendPushNotificationsAsync(chunk);
      console.log('🎟️ [Push] Tickets received:', res);

      res.forEach((ticket, i) => {
        tickets.push(ticket);
        const token = chunk[i].to;
        if (ticket.status === 'ok' && ticket.id) {
          idToToken.set(ticket.id, token);
          console.log(`✅ [Push] Ticket OK: token=${token}, ticketId=${ticket.id}`);
        } else if (ticket.status === 'error') {
          console.error(`❌ [Push] Ticket error: token=${token}, message=${ticket.message}`);
          if (ticket?.details?.error === 'DeviceNotRegistered') {
            deleteTokens(table, [token]).catch(() => { });
            console.warn(`🗑️ [Push] Deleted inactive token: ${token}`);
          }
        }
      });
    } catch (err) {
      console.error('🚨 [Push] Error while sending chunk:', err);
    }
  }

  // receipts 최종 확인
  const receipts = [];
  const ids = Array.from(idToToken.keys());
  console.log(`🔍 [Push] Checking receipts for ${ids.length} tickets`);

  for (const idChunk of expo.chunkPushNotificationReceiptIds(ids)) {
    try {
      const rec = await expo.getPushNotificationReceiptsAsync(idChunk);
      receipts.push(rec);
      console.log('📩 [Push] Receipt batch:', rec);

      for (const [rid, info] of Object.entries(rec)) {
        const token = idToToken.get(rid);
        if (!token) continue;

        if (info.status === 'ok') {
          console.log(`✅ [Push] Delivered: token=${token}, receiptId=${rid}`);
        } else if (info.status === 'error') {
          console.error(`❌ [Push] Failed: token=${token}, receiptId=${rid}, error=${info?.details?.error}, message=${info?.message}`);
          if (info?.details?.error === 'DeviceNotRegistered') {
            await deleteTokens(table, [token]).catch(() => { });
            console.warn(`🗑️ [Push] Deleted inactive token: ${token}`);
          }
        }
      }
    } catch (err) {
      console.error('🚨 [Push] Receipt fetch failed:', err);
    }
  }

  console.log(`🏁 [Push] Done. requested=${tokens.length}, sent=${valid.length}, receipts=${receipts.length}`);
  return { requested: tokens.length, sent: valid.length, invalid, tickets, receipts };
}

function fmtKST(iso) {
    try { return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }); }
    catch { return iso; }
}

/* ============================================================
 * 타입별 발송 함수
 *  - 모든 data는 reservationId만 사용
 *  - deepLink는 reservationId 기반 경로
 * ============================================================ */

/** 1) CHAT_MESSAGE: 예약방 참가자 중 제외 대상(excludeUserIds) 빼고 전송 **/
async function sendChatMessagePushToUserIds({
    reservationId,
    targetUserIds = [],     // 푸시 보낼 사용자들(오프라인 유저)
    messageId,
    senderId,
    senderName,
    text
}) {
    if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) {
        return { requested: 0, sent: 0 };
    }

    // 토큰 조회
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, targetUserIds);
    if (!tokens.length) {
        console.log("no tokens");
        return { requested: 0, sent: 0 };
    }

    // 표시용 문구
    const title = senderName ? `${senderName}님이 보낸 메시지` : '새 메시지';
    const body = text ? String(text).slice(0, 80) : '';

    // 명세에 맞춘 payload (reservationId만 사용)
    const data = {
        v: 1,
        eventId: `chat_${reservationId}_${messageId || Date.now()}`,
        type: 'CHAT_MESSAGE',
        reservationId,
        messageId,
        senderId,
        senderName,
        text,
        deepLink: `app://chat/${reservationId}`
    };

    return sendWithCleanup({
        table: USER_TOKEN_TABLE,
        tokens,
        title,
        body,
        data,
        options: { priority: 'high', channelId: 'default' }
    });
}


/** 2) PAYMENT_REQUEST: 참가자에게 결제 요청 */
async function sendPaymentRequestPush({ reservationId, userIds, amount }) {
  //console.log(reservationId);
  try {
    // ✅ 대상 유저 계산 (매개변수 userIds가 없으면 예약방 참여자 전원)
    const participants = await getUserIdsByReservation(reservationId);
    const targets = participants;

    console.log('[PAYMENT_REQUEST] targets:', targets);
    if (!targets.length) return { requested: 0, sent: 0, reason: 'no-targets' };

    // ✅ 토큰 조회
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, targets);
    console.log('[PAYMENT_REQUEST] tokenCount:', tokens.length);
    if (!tokens.length) return { requested: targets.length, sent: 0, reason: 'no-tokens' };

    // ✅ 마감 시간: 현재로부터 20분 뒤 (UTC ISO)
    const dueAtISO = new Date(Date.now() + 20 * 60 * 1000).toISOString();

    // ✅ 표시 문구
    const title = '예약금 결제가 필요해요';
    const body = `${(amount ?? 0).toLocaleString()}원을 20분 안에 결제해 주세요!`;

    // ✅ payload (프론트는 data.dueAtISO를 기준으로 타이머/표시)
    const data = {
      v: 1,
      eventId: `payreq_${reservationId}_${Date.now()}`,
      type: 'PAYMENT_REQUEST',
      reservationId,
      amount,
      dueAtISO,
      deepLink: `app://reservation/${reservationId}/payment`
    };

    const result = await sendWithCleanup({
      table: USER_TOKEN_TABLE,
      tokens,
      title,
      body,
      data,
      options: { priority: 'high', channelId: 'default' }
    });

    console.log('[PAYMENT_REQUEST] result:', {
      requested: result.requested,
      sent: result.sent,
      invalid: result.invalid?.length ?? 0
    });

    return result;
  } catch (err) {
    console.error('[PAYMENT_REQUEST] error:', err);
    throw err;
  }
}

// ✅ 가게명 조회: reservation_table ↔ store_table
async function getStoreNameByReservation(reservationId) {
  const rows = await q(
    `SELECT COALESCE(r.reservation_store_name, s.store_name) AS store_name
       FROM reservation_table r
  LEFT JOIN store_table s ON r.store_id = s.store_id
      WHERE r.reservation_id = ?`,
    [reservationId]
  );
  return rows?.[0]?.store_name || null;
}


/** 3) RESERVATION_CONFIRMED: 참가자 전체 (현재 시각 사용, storeName DB조회) */
async function sendReservationConfirmedPush({ reservationId }) {
  // 참가자 조회
  const userIds = await getUserIdsByReservation(reservationId);
  if (!userIds.length) return { requested: 0, sent: 0, reason: 'no-participants' };

  // 토큰 조회
  const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, userIds);
  if (!tokens.length) return { requested: userIds.length, sent: 0, reason: 'no-tokens' };

  // 현재 시각 (UTC ISO) 사용
  const timeISO = new Date().toISOString();

  // 가게명 조회
  const storeName = await getStoreNameByReservation(reservationId);

  const title = '예약이 확정되었어요';
  const body  = `${storeName || '가게'}${timeISO ? `, ${fmtKST(timeISO)}` : ''}`;

  const data = {
    v: 1,
    eventId: `resv_conf_${reservationId}_${Date.now()}`, // 중복 방지용 타임스탬프 포함
    type: 'RESERVATION_CONFIRMED',
    reservationId,
    timeISO,          // 프론트에서 카운트다운/표시용
    storeName,
    deepLink: `app://reservation/${reservationId}` // 필요시 app://room/${reservationId}/reservation 로 변경
  };

  return sendWithCleanup({
    table: USER_TOKEN_TABLE,
    tokens,
    title,
    body,
    data,
    options: { priority: 'high', channelId: 'default' }
  });
}

/** 4) RESERVATION_REJECTED: 참가자 전체 */
async function sendReservationRejectedPush({ reservationId, userIds}) {
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, userIds || []);
    if (!tokens.length) return { requested: 0, sent: 0 };

    const title = '예약이 거절되었어요';
    const body = `${storeName || '가게'}${reason ? ` / 사유: ${reason}` : ''}`;

    const data = {
        v: 1,
        eventId: `resv_rej_${reservationId}`,
        type: 'RESERVATION_REJECTED',
        reservationId,
        storeName,
        deepLink: `app://reservation/${reservationId}`
    };

    return sendWithCleanup({ table: USER_TOKEN_TABLE, tokens, title, body, data, options: {} });
}

/** 5) RESERVATION_CANCELED: 참가자 전체 (reservationId 기반) */
async function sendReservationCanceledPush({ reservationId, canceledBy }) {
  // 1) 참가자 user_id 스냅샷
  const userIds = await getUserIdsByReservation(reservationId);
  if (!userIds.length) {
    return { requested: 0, sent: 0, reason: 'no-participants' };
  }

  // 2) 참가자 토큰 조회
  const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, userIds);
  if (!tokens.length) {
    return { requested: userIds.length, sent: 0, reason: 'no-tokens' };
  }

  // 3) 메시지/페이로드 구성
  const title = '모임이 취소되었어요';
  const body  = '모임이 취소되었습니다.';

  const data = {
    v: 1,
    eventId: `resv_cancel_${reservationId}_${Date.now()}`, // 중복 방지용 타임스탬프 포함
    type: 'RESERVATION_CANCELED',
    reservationId,
    canceledBy, // 'store' | 'host'
    deepLink: `app://reservation/${reservationId}`
  };

  // 4) 전송 (만료 토큰 정리 포함)
  return sendWithCleanup({
    table: USER_TOKEN_TABLE,
    tokens,
    title,
    body,
    data,
    options: { priority: 'high', channelId: 'default' }
  });
}

/** 6) PAYMENT_SUCCESS: 개인 */
async function sendPaymentSuccessPush({ reservationId, userId, paymentId, amount }) {
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, [userId]);
    if (!tokens.length) return { requested: 0, sent: 0 };

    const title = '결제가 완료되었어요';
    const body = `${(amount ?? 0).toLocaleString()}원이 결제되었습니다`;

    const data = {
        v: 1,
        eventId: `pay_succ_${paymentId || Date.now()}`,
        type: 'PAYMENT_SUCCESS',
        reservationId,
        paymentId,
        amount,
        deepLink: `app://payments/${paymentId}`
    };

    return sendWithCleanup({ table: USER_TOKEN_TABLE, tokens, title, body, data, options: {} });
}

/** 7) REFUND_COMPLETED: 개인 */
async function sendRefundCompletedPush({ reservationId, userId, refundId, amount }) {
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, [userId]);
    if (!tokens.length) return { requested: 0, sent: 0 };

    const title = '환불이 완료되었어요';
    const body = `${(amount ?? 0).toLocaleString()}원이 환불되었습니다`;

    const data = {
        v: 1,
        eventId: `refund_${refundId || Date.now()}`,
        type: 'REFUND_COMPLETED',
        reservationId,
        refundId,
        amount,
        deepLink: `app://payments/${refundId}`
    };

    return sendWithCleanup({ table: USER_TOKEN_TABLE, tokens, title, body, data, options: {} });
}

/** 8) PAYMENT_FAILED: 개인 */
async function sendPaymentFailedPush({ reservationId, userId, reason }) {
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, [userId]);
    if (!tokens.length) return { requested: 0, sent: 0 };

    const title = '결제에 실패했어요';
    const body = reason ? `사유: ${reason}` : '';

    const data = {
        v: 1,
        eventId: `pay_fail_${reservationId}_${Date.now()}`,
        type: 'PAYMENT_FAILED',
        reservationId,
        reason,
        deepLink: `app://reservation/${reservationId}/payment`
    };

    return sendWithCleanup({ table: USER_TOKEN_TABLE, tokens, title, body, data, options: {} });
}

/** 9) RESERVATION_REQUESTED: 사장님(예약 요청) */
async function sendReservationRequestedPush({ reservationId, meta }) {
    const storeId = await getStoreIdByReservation(reservationId);
    if (!storeId) return { requested: 0, sent: 0 };

    const tokens = await getTokensByAccountIds(STORE_TOKEN_TABLE, [storeId]);
    if (!tokens.length) return { requested: 0, sent: 0 };

    const title = '새 예약 요청이 도착했어요';
    const body = meta?.peopleCount
        ? `인원 ${meta.peopleCount}${meta.time ? `, ${fmtKST(meta.time)}` : ''}`
        : (meta?.time ? `${fmtKST(meta.time)}` : '확인해주세요');

    const data = {
        v: 1,
        eventId: `req_${reservationId}`,
        type: 'RESERVATION_REQUESTED',
        reservationId,
        storeId,
        meta,
        deepLink: `app://store/reservations/${reservationId}`
    };

    return sendWithCleanup({ table: STORE_TOKEN_TABLE, tokens, title, body, data, options: {} });
}

/** 10) PAYOUT_COMPLETED: 사장님(정산 완료) */
async function sendPayoutCompletedPush({ reservationId, payoutId, amount }) {
    const storeId = await getStoreIdByReservation(reservationId);
    if (!storeId) return { requested: 0, sent: 0 };

    const tokens = await getTokensByAccountIds(STORE_TOKEN_TABLE, [storeId]);
    if (!tokens.length) return { requested: 0, sent: 0 };

    const title = '정산이 완료되었어요';
    const body = `${(amount ?? 0).toLocaleString()}원이 정산되었습니다`;

    const data = {
        v: 1,
        eventId: `payout_${payoutId || Date.now()}`,
        type: 'PAYOUT_COMPLETED',
        reservationId,
        payoutId,
        amount,
        deepLink: `app://store/payouts/${payoutId}`
    };

    return sendWithCleanup({ table: STORE_TOKEN_TABLE, tokens, title, body, data, options: {} });
}

/** 11) USER_JOINED: 새 참가자 입장 알림(참가자 전원, 본인 제외) */
async function sendUserJoinedPush({ reservationId, joinedUserId, joinedUserName }) {
  try {
    // 1) 현재 예약방 참가자 조회
    const allUserIds = await getUserIdsByReservation(reservationId);
    if (!allUserIds?.length) {
      console.log('no participant');
      return { requested: 0, sent: 0, reason: 'no-participants' };
    }

    // 2) 본인 제외 대상 계산
    const targets = allUserIds.filter(uid => uid !== joinedUserId);
    if (!targets.length) {
      console.log('no targets');
      return { requested: 0, sent: 0, reason: 'no-targets-after-exclude' };
    }

    // 3) 푸시 토큰 조회
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, targets);
    if (!tokens.length) {
      return { requested: targets.length, sent: 0, reason: 'no-tokens' };
    }

    // 4) 메시지/페이로드
    const title = '새로운 참가자가 합류했어요';
    const body  = joinedUserName ? `${joinedUserName}님이 모임에 참여했어요` : '새로운 참가자가 모임에 참여했어요';

    const data = {
      v: 1,
      eventId: `user_joined_${reservationId}_${joinedUserId}_${Date.now()}`,
      type: 'USER_JOINED',
      reservationId,
      joinedUserId,
      joinedUserName,
      deepLink: `app://reservation/${reservationId}`
    };

    // 5) 전송 (만료 토큰 정리 포함)
    return await sendWithCleanup({
      table: USER_TOKEN_TABLE,
      tokens,
      title,
      body,
      data,
      options: { priority: 'high', channelId: 'default' }
    });
  } catch (err) {
    console.error('[USER_JOINED] error:', err);
    throw err;
  }
}

/** 12) USER_LEFT: 참가자 퇴장 알림(참가자 전원, 본인 제외) */
async function sendUserLeftPush({ reservationId, leftUserId, leftUserName }) {
  try {
    // 1) 현재 예약방 참가자 조회
    const allUserIds = await getUserIdsByReservation(reservationId);
    if (!allUserIds?.length) {
      console.log('[USER_LEFT] no participants');
      return { requested: 0, sent: 0, reason: 'no-participants' };
    }

    // 2) 본인 제외 대상 계산 (호출 타이밍이 퇴장 전/후 어떤 경우든 안전하게)
    const targets = allUserIds.filter(uid => uid !== leftUserId);
    if (!targets.length) {
      console.log('[USER_LEFT] no targets after exclude');
      return { requested: 0, sent: 0, reason: 'no-targets-after-exclude' };
    }

    // 3) 푸시 토큰 조회
    const tokens = await getTokensByAccountIds(USER_TOKEN_TABLE, targets);
    if (!tokens.length) {
      return { requested: targets.length, sent: 0, reason: 'no-tokens' };
    }

    // 4) 메시지/페이로드
    const title = '참가자가 모임을 떠났어요';
    const body  = leftUserName
      ? `${leftUserName}님이 모임에서 나갔습니다`
      : '어떤 참가자가 모임에서 나갔습니다';

    const data = {
      v: 1,
      eventId: `user_left_${reservationId}_${leftUserId || 'unknown'}_${Date.now()}`,
      type: 'USER_LEFT',
      reservationId,
      leftUserId,
      leftUserName,
      deepLink: `app://reservation/${reservationId}`
    };

    // 5) 전송 (만료 토큰 정리 포함)
    return await sendWithCleanup({
      table: USER_TOKEN_TABLE,
      tokens,
      title,
      body,
      data,
      options: { priority: 'high', channelId: 'default' }
    });
  } catch (err) {
    console.error('[USER_LEFT] error:', err);
    throw err;
  }
}

module.exports = {
    // 타입별 API (컨트롤러/서비스에서 바로 import)
    saveUserExpoToken,
    saveStoreExpoToken,
    getUserIdsByReservation,
    sendChatMessagePushToUserIds,
    sendPaymentRequestPush,
    sendReservationConfirmedPush,
    sendReservationRejectedPush,
    sendReservationCanceledPush,
    sendPaymentSuccessPush,
    sendRefundCompletedPush,
    sendPaymentFailedPush,
    sendReservationRequestedPush,
    sendPayoutCompletedPush, 
    sendUserJoinedPush,
    sendUserLeftPush
};