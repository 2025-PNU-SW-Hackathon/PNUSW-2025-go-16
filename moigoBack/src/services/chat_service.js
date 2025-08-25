// 📦 chat_service.js
// DB 직접 접근하는 채팅 기능 비즈니스 로직 모음

const e = require('express');
const { getConnection } = require('../config/db_config');
const messageService = require('../services/message_service');
const pushService = require('./push_service');
// 💬 1. 채팅방 목록 조회 (중복 제거)
exports.getChatRooms = async (user_id) => {
  const conn = getConnection();

  console.log('🔍 [DEBUG] 채팅방 목록 조회 시작 - user_id:', user_id);

  // 🧹 먼저 중복된 chat_room_users 데이터 정리
  await cleanupDuplicateChatRoomUsers(conn, user_id);

  const [rows] = await conn.query(
    `SELECT DISTINCT
      cr.reservation_id AS chat_room_id,                         
      cr.name AS name,
      rt.user_id AS host_id,
      rt.reservation_status,                                     -- 🆕 모집 상태 추가
      rt.reservation_participant_cnt,                            -- 🆕 현재 참여자 수 추가
      rt.reservation_max_participant_cnt,                        -- 🆕 최대 참여자 수 추가
      rt.reservation_start_time,                                 -- 🆕 모임 시작 시간 추가
      rt.reservation_match,                                      -- 🆕 경기명 추가
      rt.reservation_bio,                                        -- 🆕 모임명 추가
      rt.selected_store_id,                                      -- 🆕 선택된 가게 ID 추가
      rt.selected_store_name,                                    -- 🆕 선택된 가게 이름 추가
      rt.selected_at,                                            -- 🆕 가게 선택 시간 추가
      rt.selected_by,                                            -- 🆕 가게 선택한 사용자 추가
      (
        SELECT cm.message
        FROM chat_messages cm
        WHERE cm.chat_room_id = cr.reservation_id
        ORDER BY cm.message_id DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT cm.created_at
        FROM chat_messages cm
        WHERE cm.chat_room_id = cr.reservation_id
        ORDER BY cm.message_id DESC
        LIMIT 1
      ) AS last_message_time,
      (
        SELECT cm.sender_id
        FROM chat_messages cm
        WHERE cm.chat_room_id = cr.reservation_id
        ORDER BY cm.message_id DESC
        LIMIT 1
      ) AS last_message_sender_id,
      (
        SELECT cm.sender_id
        FROM chat_messages cm
        WHERE cm.chat_room_id = cr.reservation_id
        ORDER BY cm.message_id DESC
        LIMIT 1
      ) AS sender_id
   FROM chat_rooms cr
   JOIN chat_room_users cru ON cr.reservation_id = cru.reservation_id
   JOIN reservation_table rt ON cr.reservation_id = rt.reservation_id
   WHERE cru.user_id = ? AND cru.is_kicked = 0
   ORDER BY COALESCE(last_message_time, rt.reservation_created_time) DESC`,
    [user_id]
  );

  console.log('🔍 [DEBUG] 중복 제거 후 채팅방 수:', rows.length);

  // 방장 여부 판별 및 상태 정보 추가
  const processedRows = await Promise.all(rows.map(async (row) => {
    const isHost = row.host_id === user_id;
    const role = isHost ? '방장' : '참가자';

    // 🆕 모집 상태 메시지 생성
    const statusMessages = {
      0: '모집 중',
      1: '모집 마감',
      2: '진행 중',
      3: '완료'
    };

    console.log('📋 [DEBUG] 채팅방 정보:', {
      chat_room_id: row.chat_room_id,
      name: row.name,
      host_id: row.host_id,
      current_user: user_id,
      role: role,
      reservation_status: row.reservation_status,
      status_message: statusMessages[row.reservation_status],
      participant_count: `${row.reservation_participant_cnt}/${row.reservation_max_participant_cnt}`,
      last_message_sender: row.last_message_sender_id
    });

    // 🆕 선택된 가게 정보 처리
    const selectedStore = row.selected_store_id ? {
      store_id: row.selected_store_id,
      store_name: row.selected_store_name,
      selected_at: row.selected_at ? new Date(row.selected_at).toISOString() : null,
      selected_by: row.selected_by
    } : null;

    // 🆕 정산 상태 간단 정보 조회
    let paymentStatus = 'not_started';
    let paymentProgress = null;

    try {
      const [paymentSession] = await conn.query(
        'SELECT payment_status, completed_payments, total_participants FROM payment_sessions WHERE chat_room_id = ? ORDER BY started_at DESC LIMIT 1',
        [row.chat_room_id]
      );

      if (paymentSession.length > 0) {
        const session = paymentSession[0];
        paymentStatus = session.payment_status;

        if (session.payment_status === 'in_progress') {
          paymentProgress = `${session.completed_payments}/${session.total_participants}`;
        }
      }
    } catch (paymentError) {
      console.log('🔍 [CHAT LIST] 정산 정보 조회 실패 (무시):', paymentError.message);
    }

    return {
      ...row,
      is_host: isHost,                                            // 🆕 방장 여부 플래그
      user_role: role,                                            // 🆕 사용자 역할
      status_message: statusMessages[row.reservation_status],     // 🆕 상태 메시지
      is_recruitment_closed: row.reservation_status === 1,        // 🆕 모집 마감 여부
      participant_info: `${row.reservation_participant_cnt}/${row.reservation_max_participant_cnt}`, // 🆕 참여자 정보
      reservation_start_time: row.reservation_start_time ? new Date(row.reservation_start_time).toISOString() : null,  // 🆕 시작 시간 ISO 형식
      match_name: row.reservation_match,                         // 🆕 경기명
      reservation_title: row.reservation_bio,                   // 🆕 방 제목
      selected_store: selectedStore,                              // 🆕 선택된 가게 정보
      payment_status: paymentStatus,                              // 🆕 정산 상태
      payment_progress: paymentProgress                           // 🆕 정산 진행률
    };
  }));

  return processedRows;
};

// 🧹 중복된 chat_room_users 데이터 정리 함수 (개별 사용자)
async function cleanupDuplicateChatRoomUsers(conn, user_id) {
  console.log('🧹 [CLEANUP] 중복 채팅방 사용자 데이터 정리 시작 - user_id:', user_id);

  try {
    // 1. 현재 사용자의 중복 데이터 확인
    const [duplicates] = await conn.query(
      `SELECT reservation_id, COUNT(*) as count 
       FROM chat_room_users 
       WHERE user_id = ? 
       GROUP BY reservation_id 
       HAVING COUNT(*) > 1`,
      [user_id]
    );

    if (duplicates.length > 0) {
      console.log('🚨 [CLEANUP] 발견된 중복 데이터:', duplicates.length, '개의 채팅방');

      // 2. 각 reservation_id별로 가장 오래된 것만 남기고 나머지 삭제
      for (const duplicate of duplicates) {
        console.log(`🧹 [CLEANUP] 채팅방 ${duplicate.reservation_id}에서 ${duplicate.count}개 중복 데이터 정리`);

        // ROW_NUMBER()를 사용하여 중복 제거 (id 컬럼이 없을 수도 있으므로)
        const [deleteResult] = await conn.query(
          `DELETE t1 FROM chat_room_users t1
           INNER JOIN chat_room_users t2 
           WHERE t1.user_id = ? AND t1.reservation_id = ?
           AND t1.user_id = t2.user_id AND t1.reservation_id = t2.reservation_id
           AND t1.rowid > t2.rowid`,
          [user_id, duplicate.reservation_id]
        );

        // 위 쿼리가 실패하면 대안 방법 사용
        if (deleteResult.affectedRows === 0) {
          await conn.query(
            `DELETE FROM chat_room_users 
             WHERE user_id = ? AND reservation_id = ?`,
            [user_id, duplicate.reservation_id]
          );

          // 다시 하나만 추가
          await conn.query(
            `INSERT IGNORE INTO chat_room_users (reservation_id, user_id, is_kicked)
             VALUES (?, ?, false)`,
            [duplicate.reservation_id, user_id]
          );
        }

        console.log(`✅ [CLEANUP] 채팅방 ${duplicate.reservation_id} 중복 데이터 정리 완료`);
      }
    } else {
      console.log('✅ [CLEANUP] 중복 데이터 없음');
    }
  } catch (error) {
    console.error('❌ [CLEANUP] 중복 데이터 정리 중 오류:', error);
    // 정리 실패해도 메인 기능에 영향주지 않도록 에러를 던지지 않음
  }
}

// 🧹 전체 시스템 중복 데이터 정리 함수 (관리자용)
exports.cleanupAllDuplicateChatRoomUsers = async () => {
  const conn = getConnection();

  console.log('🧹 [SYSTEM CLEANUP] 전체 시스템 중복 채팅방 데이터 정리 시작');

  try {
    // 1. 전체 중복 데이터 현황 파악
    const [allDuplicates] = await conn.query(
      `SELECT user_id, reservation_id, COUNT(*) as count 
       FROM chat_room_users 
       GROUP BY user_id, reservation_id 
       HAVING COUNT(*) > 1
       ORDER BY count DESC`
    );

    if (allDuplicates.length > 0) {
      console.log('🚨 [SYSTEM CLEANUP] 전체 중복 데이터 현황:', allDuplicates.length, '개 그룹');

      let totalCleaned = 0;

      // 2. 각 중복 그룹별로 정리
      for (const duplicate of allDuplicates) {
        console.log(`🧹 [SYSTEM CLEANUP] 사용자 ${duplicate.user_id}, 채팅방 ${duplicate.reservation_id}: ${duplicate.count}개 중복`);

        // 가장 최근 레코드 하나만 남기고 나머지 삭제 (created_at 기준)
        const [deleteResult] = await conn.query(
          `DELETE FROM chat_room_users 
           WHERE user_id = ? AND reservation_id = ?
           AND id NOT IN (
             SELECT * FROM (
               SELECT MAX(id) FROM chat_room_users 
               WHERE user_id = ? AND reservation_id = ?
             ) as temp
           )`,
          [duplicate.user_id, duplicate.reservation_id, duplicate.user_id, duplicate.reservation_id]
        );

        totalCleaned += deleteResult.affectedRows;
        console.log(`✅ [SYSTEM CLEANUP] ${deleteResult.affectedRows}개 중복 레코드 삭제`);
      }

      console.log(`🎉 [SYSTEM CLEANUP] 전체 정리 완료: 총 ${totalCleaned}개 중복 레코드 삭제`);

      return {
        success: true,
        duplicateGroups: allDuplicates.length,
        totalCleaned: totalCleaned
      };
    } else {
      console.log('✅ [SYSTEM CLEANUP] 전체 시스템에 중복 데이터 없음');
      return {
        success: true,
        duplicateGroups: 0,
        totalCleaned: 0
      };
    }
  } catch (error) {
    console.error('❌ [SYSTEM CLEANUP] 전체 중복 데이터 정리 중 오류:', error);
    throw error;
  }
};

// 👋 2. 채팅방 나가기 = 모임 완전 탈퇴 (방장 권한 이양 포함)
exports.leaveChatRoom = async (user_id, room_id) => {
  const conn = getConnection();

  try {
    // 트랜잭션 시작 (MySQL2 방식)
    await conn.query('START TRANSACTION');

    // 1. 현재 모임 정보 및 방장 여부 확인
    const [reservationInfo] = await conn.query(
      `SELECT user_id as host_id, reservation_participant_cnt, reservation_max_participant_cnt, 
              reservation_status, reservation_match 
       FROM reservation_table WHERE reservation_id = ?`,
      [room_id]
    );

    if (!reservationInfo.length) {
      throw new Error('존재하지 않는 모임입니다.');
    }

    const isHost = reservationInfo[0].host_id === user_id;
    const currentParticipantCount = reservationInfo[0].reservation_participant_cnt;

    // 2. 사용자 정보 조회
    const [userInfo] = await conn.query(
      `SELECT user_name FROM user_table WHERE user_id = ?`,
      [user_id]
    );

    const userName = userInfo.length > 0 ? userInfo[0].user_name : '알 수 없는 사용자';

    // 3. 사용자가 실제 참여자인지 확인
    const [participantCheck] = await conn.query(
      `SELECT * FROM chat_room_users WHERE reservation_id = ? AND user_id = ? AND is_kicked = 0`,
      [room_id, user_id]
    );

    if (!participantCheck.length) {
      throw new Error('이미 나간 모임이거나 참여하지 않은 모임입니다.');
    }

    let newHostId = null;
    let hostTransferMessage = '';

    // 4. 방장인 경우 권한 이양 처리
    if (isHost && currentParticipantCount > 1) {
      // 가장 먼저 가입한 다른 참여자에게 방장 권한 이양
      const [nextHost] = await conn.query(
        `SELECT cru.user_id, u.user_name 
         FROM chat_room_users cru
         JOIN user_table u ON cru.user_id = u.user_id
         WHERE cru.reservation_id = ? AND cru.user_id != ? AND cru.is_kicked = 0
         ORDER BY cru.joined_at ASC
         LIMIT 1`,
        [room_id, user_id]
      );

      if (nextHost.length > 0) {
        newHostId = nextHost[0].user_id;
        const newHostName = nextHost[0].user_name;

        // 방장 권한 이양
        await conn.query(
          `UPDATE reservation_table SET user_id = ? WHERE reservation_id = ?`,
          [newHostId, room_id]
        );

        hostTransferMessage = ` 방장 권한이 ${newHostName}님에게 이양되었습니다.`;
      }
    } else if (isHost && currentParticipantCount <= 1) {
      // 마지막 참여자(방장)가 나가는 경우 - 모임 해산
      await conn.query(
        `UPDATE reservation_table SET reservation_status = 3 WHERE reservation_id = ?`,
        [room_id]
      );
    }

    // 5. 채팅방에서 사용자 제거
    await conn.query(
      `DELETE FROM chat_room_users WHERE reservation_id = ? AND user_id = ?`,
      [room_id, user_id]
    );

    // 6. 모임 참여자 수 감소
    const newParticipantCount = currentParticipantCount - 1;
    await conn.query(
      `UPDATE reservation_table
       SET reservation_participant_cnt = ?,
           reservation_status = CASE 
             WHEN ? = 0 THEN 3  -- 참여자가 0명이면 완료 상태
             WHEN ? < reservation_max_participant_cnt THEN 0  -- 정원 미달이면 모집중
             ELSE reservation_status 
           END
       WHERE reservation_id = ?`,
      [newParticipantCount, newParticipantCount, newParticipantCount, room_id]
    );

    // 7. 시스템 메시지 생성
    const systemMessage = `${userName}님이 모임을 나가셨습니다.${hostTransferMessage}`;

    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, room_id, 'system', systemMessage]
    );

    // 트랜잭션 커밋
    await conn.query('COMMIT');

    // 8. 실시간 알림 전송
    try {
      const { getIO } = require('../config/socket_hub');
      const io = getIO();

      // 시스템 메시지 전송
      const systemMessageData = {
        message_id: nextMessageId,
        chat_room_id: room_id,
        sender_id: 'system',
        message: systemMessage,
        created_at: new Date(),
        message_type: 'system_leave',
        user_name: userName,
        user_id: user_id
      };

      io.to(room_id.toString()).emit('newMessage', systemMessageData);

      // 사용자 퇴장 이벤트 전송
      const leaveEventData = {
        room_id: parseInt(room_id),
        user_id: user_id,
        user_name: userName,
        left_at: new Date().toISOString(),
        remaining_participants: newParticipantCount,
        is_host_left: isHost,
        new_host_id: newHostId,
        meeting_status: newParticipantCount === 0 ? 3 : (newParticipantCount < reservationInfo[0].reservation_max_participant_cnt ? 0 : reservationInfo[0].reservation_status)
      };

      io.to(room_id.toString()).emit('userLeftRoom', leaveEventData);

      // 방장 권한 이양 시 추가 알림
      if (newHostId) {
        io.to(room_id.toString()).emit('hostTransferred', {
          room_id: parseInt(room_id),
          previous_host: user_id,
          new_host: newHostId,
          transferred_at: new Date().toISOString()
        });
      }

    } catch (error) {
      console.log('소켓 전송 실패:', error.message);
    }

    try {
      await pushService.sendUserLeftPush({
        reservationId: room_id,
        leftUserId: user_id,
        leftUserName: userName
      });
    } catch (err) {
      console.log('모임 나가기 푸시 알림', room_id, user_id, userName, err);
    }

    // 9. 응답 데이터 반환
    return {
      roomId: parseInt(room_id),
      left_at: new Date().toISOString(),
      reservation_id: parseInt(room_id),
      remaining_participants: newParticipantCount,
      is_host_left: isHost,
      new_host_id: newHostId,
      meeting_status: newParticipantCount === 0 ? 3 : (newParticipantCount < reservationInfo[0].reservation_max_participant_cnt ? 0 : reservationInfo[0].reservation_status)
    };

  } catch (error) {
    // 트랜잭션 롤백
    try {
      await conn.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('롤백 실패:', rollbackError);
    }
    throw error;
  }
};

// 👋 2. 채팅방 나가기 = 모임 완전 탈퇴 (방장 권한 이양 포함)
// 상태코드: 0=모집중, 1=잠시대기(확정이전), 2=확정, 3=취소, 4=거절
/*
exports.leaveChatRoom = async (user_id, reservation_id) => {
  const conn = getConnection();

  try {
    await conn.query('START TRANSACTION');

    // 1) 모임 스냅샷 (락)
    const [resvRows] = await conn.query(
      `SELECT user_id AS host_id,
              reservation_participant_cnt,
              reservation_max_participant_cnt,
              reservation_status,
              reservation_match
         FROM reservation_table
        WHERE reservation_id = ? FOR UPDATE`,
      [reservation_id]
    );
    if (!resvRows.length) throw new Error('존재하지 않는 모임입니다.');

    const snap = resvRows[0];
    const isHost = snap.host_id === user_id;
    const beforeCnt = snap.reservation_participant_cnt;
    const statusBefore = snap.reservation_status;

    // 2) 사용자 표시명
    const [urows] = await conn.query(
      `SELECT user_name FROM user_table WHERE user_id = ?`,
      [user_id]
    );
    const userName = urows.length ? urows[0].user_name : '알 수 없는 사용자';

    // 3) 실제 참여자인지
    const [partRows] = await conn.query(
      `SELECT 1 FROM chat_room_users
        WHERE reservation_id = ? AND user_id = ? AND COALESCE(is_kicked,0)=0`,
      [reservation_id, user_id]
    );
    if (!partRows.length) {
      throw new Error('이미 나간 모임이거나 참여하지 않은 모임입니다.');
    }

    // 4) 방장 이탈 처리(참여자 2명 이상일 때만 권한 이양)
    let newHostId = null;
    let hostTransferMessage = '';
    if (isHost && beforeCnt > 1) {
      const [nextRows] = await conn.query(
        `SELECT cru.user_id, u.user_name
           FROM chat_room_users AS cru
           JOIN user_table u ON u.user_id = cru.user_id
          WHERE cru.reservation_id = ?
            AND cru.user_id <> ?
            AND COALESCE(cru.is_kicked,0)=0
          ORDER BY cru.joined_at ASC
          LIMIT 1 FOR UPDATE`,
        [reservation_id, user_id]
      );
      if (nextRows.length) {
        newHostId = nextRows[0].user_id;
        const newHostName = nextRows[0].user_name;
        await conn.query(
          `UPDATE reservation_table SET user_id = ? WHERE reservation_id = ?`,
          [newHostId, reservation_id]
        );
        hostTransferMessage = ` 방장 권한이 ${newHostName}님에게 이양되었습니다.`;
      }
    }

    // 5) 채팅방에서 사용자 제거
    await conn.query(
      `DELETE FROM chat_room_users WHERE reservation_id = ? AND user_id = ?`,
      [reservation_id, user_id]
    );

    // 6) 참여자 수 감소 + 상태 업데이트 규칙 적용
    //  - 감소 후 인원이 0명이면 3(취소)
    //  - 그 외에는 기존 상태 유지(0/1/2 그대로)
    if (statusBefore === 3 || statusBefore === 4) {
      // 이미 취소/거절 상태면 인원만 감소, 상태 유지
      await conn.query(
        `UPDATE reservation_table
            SET reservation_participant_cnt = GREATEST(reservation_participant_cnt - 1, 0)
          WHERE reservation_id = ?`,
        [reservation_id]
      );
    } else {
      await conn.query(
        `UPDATE reservation_table
            SET reservation_participant_cnt = GREATEST(reservation_participant_cnt - 1, 0),
                reservation_status = CASE
                   WHEN reservation_participant_cnt - 1 <= 0 THEN 3  -- 모두 나가면 취소
                   ELSE reservation_status                       -- 나머지는 상태 유지(0/1/2 유지)
                END
          WHERE reservation_id = ?`,
        [reservation_id]
      );
    }

    // 7) 최신 스냅샷 재조회
    const [afterRows] = await conn.query(
      `SELECT user_id AS host_id,
              reservation_participant_cnt,
              reservation_max_participant_cnt,
              reservation_status
         FROM reservation_table
        WHERE reservation_id = ?`,
      [reservation_id]
    );
    const after = afterRows[0];
    const newParticipantCount = after.reservation_participant_cnt;
    const meetingStatus = after.reservation_status;

    // 8) 시스템 메시지 기록
    const systemMessage = `${userName}님이 모임을 나가셨습니다.${hostTransferMessage}`;
    const [maxIdRes] = await conn.query(`SELECT MAX(message_id) AS maxId FROM chat_messages FOR UPDATE`);
    const nextMessageId = (maxIdRes[0]?.maxId || 0) + 1;
    await conn.query(
      `INSERT INTO chat_messages (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, reservation_id, 'system', systemMessage]
    );

    await conn.query('COMMIT');

    // 9) 소켓 브로드캐스트 (업데이트 '후' 값 사용)
    try {
      const { getIO } = require('../config/socket_hub');
      const io = getIO();

      io.to(String(reservation_id)).emit('newMessage', {
        message_id: nextMessageId,
        chat_room_id: reservation_id,
        sender_id: 'system',
        message: systemMessage,
        created_at: new Date(),
        message_type: 'system_leave',
        user_name: userName,
        user_id: user_id
      });

      io.to(String(reservation_id)).emit('userLeftRoom', {
        room_id: reservation_id,
        user_id,
        user_name: userName,
        left_at: new Date().toISOString(),
        remaining_participants: newParticipantCount,
        is_host_left: isHost,
        new_host_id: newHostId,
        meeting_status: meetingStatus
      });

      if (newHostId) {
        io.to(String(reservation_id)).emit('hostTransferred', {
          room_id: reservation_id,
          previous_host: user_id,
          new_host: newHostId,
          transferred_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.log('소켓 전송 실패:', e.message);
    }
    
    // 10) 응답
    return {
      roomId: reservation_id,
      reservation_id,
      left_at: new Date().toISOString(),
      remaining_participants: newParticipantCount,
      is_host_left: isHost,
      new_host_id: newHostId,
      meeting_status: meetingStatus
    };
  } catch (error) {
    try { await conn.query('ROLLBACK'); } catch (_) {}
    throw error;
  }
};
*/
// 📌 3. 채팅방 상태 변경
exports.updateChatRoomStatus = async (user_id, room_id, status) => {
  const conn = getConnection();

  // 🆕 방장 권한 확인 추가
  const [hostCheck] = await conn.query(
    'SELECT user_id FROM reservation_table WHERE reservation_id = ?',
    [room_id]
  );

  if (!hostCheck.length || hostCheck[0].user_id !== user_id) {
    const err = new Error("권한이 없습니다. 방장만 모임 상태를 변경할 수 있습니다.");
    err.statusCode = 403;
    err.errorCode = "UNAUTHORIZED";
    throw err;
  }

  // 모임 상태 변경
  await conn.query(
    `UPDATE reservation_table SET reservation_status = ? WHERE reservation_id = ?`,
    [status, room_id]
  );

  // 🆕 실시간 상태 변경 알림
  try {
    const { getIO } = require('../config/socket_hub');
    const io = getIO();
    const statusMessages = {
      0: '모집 중',
      1: '모집 마감',
      2: '진행 중',
      3: '완료'
    };

    io.to(room_id.toString()).emit('reservationStatusChanged', {
      reservation_id: room_id,
      new_status: status,
      status_message: statusMessages[status],
      changed_by: user_id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log('소켓 상태 변경 알림 실패:', error.message);
  }
};

// 🚫 4. 유저 강퇴
exports.kickUser = async (room_id, target_user_id, requester_id) => {
  const conn = getConnection();

  // 요청자가 방장인지 확인 필요 
  const [result] = await conn.query('SELECT user_id from reservation_table WHERE reservation_id = ?',
    [room_id]
  );
  console.log(requester_id);
  if (result.length > 0 && result[0].user_id === requester_id) {
    // 요청자가 방장인지 확인된 경우
    const [worked] = await conn.query(
      `UPDATE chat_room_users
      SET is_kicked = 1
      WHERE reservation_id = ? AND user_id = ?`,
      [room_id, target_user_id]
    );
    if (worked.changedRows > 0) {
      // 참여자 수 줄이기
      await conn.query(
        `UPDATE reservation_table
        SET reservation_participant_cnt = reservation_participant_cnt - 1,
        reservation_status = CASE 
          WHEN reservation_participant_cnt - 1 < reservation_max_participant_cnt THEN 0 
          ELSE reservation_status 
        END
        WHERE reservation_id = ?`,
        [room_id]
      );

      // 강퇴된 사용자 정보 조회
      const [userInfo] = await conn.query(
        `SELECT user_name FROM user_table WHERE user_id = ?`,
        [target_user_id]
      );

      const userName = userInfo.length > 0 ? userInfo[0].user_name : '알 수 없는 사용자';

      // 시스템 메시지 생성 - 사용자 강퇴 알림
      const systemMessage = `${userName}님이 강퇴되었습니다.`;

      // 시스템 메시지 저장
      const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
      const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

      await conn.query(
        `INSERT INTO chat_messages 
         (message_id, chat_room_id, sender_id, message, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [nextMessageId, room_id, 'system', systemMessage]
      );

      // 현재 참여자 수 조회 (소켓 이벤트에서 사용하기 위해)
      const [participantCount] = await conn.query(
        `SELECT reservation_participant_cnt FROM reservation_table WHERE reservation_id = ?`,
        [room_id]
      );

      // 실시간으로 시스템 메시지 전송
      try {
        const { getIO } = require('../config/socket_hub');
        const io = getIO();
        const systemMessageData = {
          message_id: nextMessageId,
          chat_room_id: room_id,
          sender_id: 'system',
          message: systemMessage,
          created_at: new Date(),
          message_type: 'system_kick', // 시스템 메시지 타입 추가
          user_name: userName, // 강퇴된 사용자 이름
          user_id: target_user_id, // 강퇴된 사용자 ID
          kicked_by: requester_id // 강퇴한 사용자 ID
        };

        io.to(room_id.toString()).emit('newMessage', systemMessageData);

        // 🆕 참여자 강퇴 전용 소켓 이벤트 추가
        const kickEventData = {
          room_id: parseInt(room_id),
          kicked_user_id: target_user_id,
          kicked_user_name: userName,
          kicked_by: requester_id,
          remaining_participants: participantCount.length > 0 ? participantCount[0].reservation_participant_cnt : 0,
          timestamp: new Date().toISOString()
        };

        io.to(room_id.toString()).emit('participantKicked', kickEventData);

      } catch (error) {
        console.log('소켓 전송 실패 (서버 시작 중일 수 있음):', error.message);
      }

      return {
        kicked_user_id: target_user_id,
        kicked_user_name: userName,
        remaining_participants: participantCount.length > 0 ? participantCount[0].reservation_participant_cnt : 0
      };
    }
    else {
      console.log("user not found");
      const err = new Error("강퇴할 사용자를 찾을 수 없습니다.");
      err.statusCode = 404;
      err.errorCode = "USER_NOT_FOUND";
      throw err;
    }
  }
  else {
    const err = new Error("권한이 없습니다. 방장만 참여자를 강퇴할 수 있습니다.");
    err.statusCode = 403;
    err.errorCode = "FORBIDDEN";
    throw err;
  }
};

// 📨 5. 채팅방 전체 메시지 조회 + 읽음 처리
exports.getAllMessages = async (user_id, room_id) => {
  const conn = getConnection();
  console.log('🔍 [DEBUG] 메시지 조회 - user_id:', user_id, 'room_id:', room_id);

  // 먼저 방장 정보 조회
  const [hostInfo] = await conn.query(
    `SELECT rt.user_id AS host_id FROM reservation_table rt WHERE rt.reservation_id = ?`,
    [room_id]
  );
  const hostId = hostInfo.length > 0 ? hostInfo[0].host_id : null;

  console.log('🔍 [DEBUG] 방장 정보 - host_id:', hostId, 'current_user:', user_id, 'is_host:', hostId === user_id);

  await messageService.markAllMessagesAsRead(user_id, room_id);

  // 전체 메시지 조회 (최신순) + 사용자 이름과 방장 여부 포함
  const [messages] = await conn.query(
    `SELECT m.message_id AS id,
          m.sender_id,
          m.message,
          m.created_at,
          u.user_name,
          CASE WHEN m.sender_id = ? THEN true ELSE false END AS is_sender_host,
          (
            SELECT COUNT(*)
            FROM chat_read_status
            WHERE chat_room_id = ? AND last_read_message_id IS NOT NULL AND last_read_message_id >= m.message_id
          ) AS read_count
   FROM chat_messages m
   LEFT JOIN user_table u ON m.sender_id = u.user_id
   WHERE m.chat_room_id = ?
   ORDER BY m.message_id DESC
   LIMIT 100`,
    [hostId, room_id, room_id]
  );

  // 메시지 타입 처리 및 가게 공유 메시지 정보 추가
  const processedMessages = messages.map(message => {
    const messageData = { ...message };

    // 🆕 방장 관련 정보 추가
    messageData.sender_role = messageData.is_sender_host ? '방장' : '참가자';
    messageData.current_user_is_host = hostId === user_id;  // 현재 사용자가 방장인지

    console.log('📝 [DEBUG] 메시지 처리:', {
      message_id: messageData.id,
      sender_id: messageData.sender_id,
      sender_name: messageData.user_name,
      is_sender_host: messageData.is_sender_host,
      sender_role: messageData.sender_role,
      current_user_is_host: messageData.current_user_is_host
    });

    // 가게 공유 메시지인지 확인
    if (message.message && message.message.includes('🏪')) {
      messageData.message_type = 'store_share';

      // 가게 공유 메시지에서 store_id 추출
      const storeIdMatch = message.message.match(/store_id:\s*(\d+)/);
      if (storeIdMatch) {
        messageData.store_id = parseInt(storeIdMatch[1]);
      }

      // 가게명 추출
      const storeMatch = message.message.match(/🏪\s*(.+?)\n/);
      if (storeMatch) {
        messageData.store_name = storeMatch[1];
      }

      // 주소 추출
      const addressMatch = message.message.match(/📍\s*(.+?)\n/);
      if (addressMatch) {
        messageData.store_address = addressMatch[1];
      }

      // 평점 추출
      const ratingMatch = message.message.match(/⭐\s*(\d+(?:\.\d+)?)/);
      if (ratingMatch) {
        messageData.store_rating = parseFloat(ratingMatch[1]);
      }
    } else if (message.sender_id === 'system') {
      messageData.message_type = 'system';
    } else {
      messageData.message_type = 'user_message';
    }

    return messageData;
  });

  console.log('🔍 [DEBUG] 처리된 메시지 수:', processedMessages.length);
  return processedMessages;
};

// 🛠️ 채팅방 생성 및 입장
exports.enterChatRoom = async (user_id, reservation_id) => {
  const conn = getConnection();
  const [existingReservation] = await conn.query(
    'SELECT reservation_match, reservation_bio, reservation_status FROM reservation_table WHERE reservation_id = ?'
    , [reservation_id]);
  if (existingReservation.length == 0) {
    const err = new Error("존재하지 않는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_RESERVATION_ID";
    throw err;
  }
  if (existingReservation[0].reservation_status == 1) {
    const err = new Error("참여할 수 없는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_RESERVATION_ID";
    throw err;
  }

  // 1. 이미 채팅방이 있는지 확인
  const [existingRoom] = await conn.query(
    `SELECT id FROM chat_rooms WHERE reservation_id = ?`,
    [reservation_id]
  );

  let chat_room_id;

  if (existingRoom.length > 0) {
    // 기존 방 존재 → ID 재사용
    chat_room_id = existingRoom[0].id;
  } else {
    // 없으면 새로 생성
    const [insertResult] = await conn.query(
      `INSERT INTO chat_rooms (reservation_id, name, status) VALUES (?, ?, 0)`,
      [reservation_id, existingReservation[0].reservation_bio || '모임']  // 🆕 방 제목(reservation_title) 사용
    );
    chat_room_id = reservation_id;
  }

  // 2. chat_room_users에 등록 (강화된 중복 방지)
  try {
    await conn.query(
      `INSERT IGNORE INTO chat_room_users (reservation_id, user_id, is_kicked)
       VALUES (?, ?, false)`,
      [reservation_id, user_id]
    );
    console.log('✅ [ENTER] 채팅방 사용자 등록 완료 - user_id:', user_id, 'reservation_id:', reservation_id);
  } catch (insertError) {
    // 이미 존재하는 경우 무시하고 계속 진행
    console.log('⚠️ [ENTER] 이미 등록된 사용자 - user_id:', user_id, 'reservation_id:', reservation_id);
  }

  // 3. 시스템 메시지 생성 - 사용자 입장 알림
  const messageService = require('../services/message_service');
  const { getIO } = require('../config/socket_hub');

  const [userInfo] = await conn.query(
    `SELECT user_name FROM user_table WHERE user_id = ?`,
    [user_id]
  );

  const userName = userInfo.length > 0 ? userInfo[0].user_name : '알 수 없는 사용자';
  const systemMessage = `${userName}님이 모임에 참여하셨습니다.`;

  // 시스템 메시지 저장
  const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
  const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

  await conn.query(
    `INSERT INTO chat_messages 
     (message_id, chat_room_id, sender_id, message, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [nextMessageId, reservation_id, 'system', systemMessage]
  );

  // 실시간으로 시스템 메시지 전송
  try {
    const io = getIO();
    const systemMessageData = {
      message_id: nextMessageId,
      chat_room_id: reservation_id,
      sender_id: 'system',
      message: systemMessage,
      created_at: new Date(),
      message_type: 'system_join', // 시스템 메시지 타입 추가
      user_name: userName, // 참여한 사용자 이름
      user_id: user_id // 참여한 사용자 ID
    };

    io.to(reservation_id.toString()).emit('newMessage', systemMessageData);
  } catch (error) {
    console.log('소켓 전송 실패 (서버 시작 중일 수 있음):', error.message);
  }

  // 🆕 모집 상태 및 선택된 가게 정보 조회 후 반환
  const [reservationDetails] = await conn.query(
    `SELECT reservation_status, reservation_participant_cnt, reservation_max_participant_cnt, 
            reservation_match, reservation_bio, reservation_start_time, user_id as host_id,
            selected_store_id, selected_store_name, selected_at, selected_by
     FROM reservation_table WHERE reservation_id = ?`,
    [reservation_id]
  );

  const reservation = reservationDetails[0];
  const statusMessages = {
    0: '모집 중',
    1: '모집 마감',
    2: '진행 중',
    3: '완료'
  };

  // 🆕 선택된 가게 정보 처리
  const selectedStore = reservation.selected_store_id ? {
    store_id: reservation.selected_store_id,
    store_name: reservation.selected_store_name,
    selected_at: reservation.selected_at ? new Date(reservation.selected_at).toISOString() : null,
    selected_by: reservation.selected_by
  } : null;

  // 🆕 정산 정보 조회
  let paymentInfo = null;
  try {
    const [paymentSession] = await conn.query(
      `SELECT ps.*, s.store_name, s.bank_name, s.account_number, s.account_holder
       FROM payment_sessions ps
       JOIN store_table s ON ps.store_id = s.store_id
       WHERE ps.chat_room_id = ?
       ORDER BY ps.started_at DESC
       LIMIT 1`,
      [reservation_id]
    );

    if (paymentSession.length > 0) {
      const session = paymentSession[0];

      // 참여자별 입금 상태 조회
      const [participants] = await conn.query(
        `SELECT user_id, user_name, payment_status, paid_at
         FROM payment_records
         WHERE payment_id = ?
         ORDER BY paid_at ASC, user_name ASC`,
        [session.payment_id]
      );

      const participantsWithStatus = participants.map(p => ({
        user_id: p.user_id,
        user_name: p.user_name,
        payment_status: p.payment_status,
        completed_at: p.paid_at ? new Date(p.paid_at).toISOString() : null
      }));

      paymentInfo = {
        payment_status: session.payment_status,
        payment_id: session.payment_id,
        payment_per_person: session.payment_per_person,
        store_info: {
          store_name: session.store_name,
          bank_name: session.bank_name,
          account_number: session.account_number,
          account_holder: session.account_holder
        },
        participants: participantsWithStatus,
        payment_deadline: session.payment_deadline ? new Date(session.payment_deadline).toISOString() : null,
        started_at: session.started_at ? new Date(session.started_at).toISOString() : null,
        completed_count: session.completed_payments || 0,
        total_count: session.total_participants || 0
      };
    }
  } catch (paymentError) {
    console.log('🔍 [ENTER] 정산 정보 조회 실패 (무시):', paymentError.message);
    // 정산 정보 조회 실패해도 입장은 가능하므로 에러를 던지지 않음
  }

  return {
    reservation_id,
    message: '입장 완료',
    room_info: {                                                      // 🆕 채팅방 정보 추가
      reservation_status: reservation.reservation_status,
      status_message: statusMessages[reservation.reservation_status],
      is_recruitment_closed: reservation.reservation_status === 1,
      participant_count: reservation.reservation_participant_cnt,
      max_participant_count: reservation.reservation_max_participant_cnt,
      participant_info: `${reservation.reservation_participant_cnt}/${reservation.reservation_max_participant_cnt}`,
      match_name: reservation.reservation_match,
      reservation_title: reservation.reservation_bio,
      reservation_start_time: reservation.reservation_start_time ? new Date(reservation.reservation_start_time).toISOString() : null,
      host_id: reservation.host_id,
      is_host: reservation.host_id === user_id,
      selected_store: selectedStore,                                   // 🆕 선택된 가게 정보
      payment_info: paymentInfo                                        // 🆕 정산 정보 추가
    }
  };
};

// 👥 참여자 목록 조회
exports.getChatParticipants = async (user_id, room_id) => {
  const conn = getConnection();

  try {
    console.log('🔍 [DEBUG] 참여자 목록 조회 - user_id:', user_id, 'room_id:', room_id);

    // 1. 요청자가 해당 채팅방 참여자인지 확인
    const [authCheck] = await conn.query(
      `SELECT * FROM chat_room_users 
       WHERE reservation_id = ? AND user_id = ? AND is_kicked = 0`,
      [room_id, user_id]
    );

    if (!authCheck.length) {
      const err = new Error('채팅방에 참여하지 않았거나 접근 권한이 없습니다.');
      err.statusCode = 403;
      err.errorCode = 'FORBIDDEN';
      throw err;
    }

    // 2. 모임 정보 조회 (방장 확인용)
    const [reservationInfo] = await conn.query(
      `SELECT user_id as host_id, reservation_participant_cnt, reservation_max_participant_cnt,
              reservation_status, reservation_match, reservation_bio, reservation_start_time,
              selected_store_id, selected_store_name, selected_at, selected_by
       FROM reservation_table WHERE reservation_id = ?`,
      [room_id]
    );

    if (!reservationInfo.length) {
      const err = new Error('존재하지 않는 모임입니다.');
      err.statusCode = 404;
      err.errorCode = 'ROOM_NOT_FOUND';
      throw err;
    }

    const hostId = reservationInfo[0].host_id;
    const totalParticipants = reservationInfo[0].reservation_participant_cnt;

    // 3. 참여자 목록 조회 (강퇴되지 않은 사용자만)
    const [participants] = await conn.query(
      `SELECT 
         cru.user_id,
         u.user_name as name,
         u.user_email as email,
         u.user_thumbnail as profile_image,
         cru.joined_at,
         CASE WHEN cru.user_id = ? THEN true ELSE false END as is_host,
         CASE WHEN cru.user_id = ? THEN '방장' ELSE '참가자' END as role
       FROM chat_room_users cru
       JOIN user_table u ON cru.user_id = u.user_id
       WHERE cru.reservation_id = ? AND cru.is_kicked = 0
       ORDER BY 
         CASE WHEN cru.user_id = ? THEN 0 ELSE 1 END,
         cru.joined_at ASC`,
      [hostId, hostId, room_id, hostId]
    );

    // 4. 온라인 상태는 현재 소켓 연결 정보로 확인 (간단 구현)
    const processedParticipants = participants.map(participant => {
      return {
        user_id: participant.user_id,
        name: participant.name,
        email: participant.email || null,
        profile_image: participant.profile_image || null,
        joined_at: participant.joined_at ? participant.joined_at.toISOString() : new Date().toISOString(),
        is_host: participant.is_host,
        role: participant.role,
        is_online: false,  // 추후 소켓 연결 상태로 업데이트 가능
        last_seen: null    // 추후 구현 가능
      };
    });

    console.log(`🔍 [DEBUG] 참여자 목록 조회 완료 - 총 ${processedParticipants.length}명`);

    // 🆕 모집 상태 정보 추가
    const statusMessages = {
      0: '모집 중',
      1: '모집 마감',
      2: '진행 중',
      3: '완료'
    };

    // 🆕 선택된 가게 정보 처리
    const selectedStore = reservationInfo[0].selected_store_id ? {
      store_id: reservationInfo[0].selected_store_id,
      store_name: reservationInfo[0].selected_store_name,
      selected_at: reservationInfo[0].selected_at ? new Date(reservationInfo[0].selected_at).toISOString() : null,
      selected_by: reservationInfo[0].selected_by
    } : null;

    return {
      room_id: parseInt(room_id),
      total_participants: totalParticipants,
      participants: processedParticipants,
      room_info: {                                                       // 🆕 채팅방 정보 추가
        reservation_status: reservationInfo[0].reservation_status,
        status_message: statusMessages[reservationInfo[0].reservation_status],
        is_recruitment_closed: reservationInfo[0].reservation_status === 1,
        participant_count: reservationInfo[0].reservation_participant_cnt,
        max_participant_count: reservationInfo[0].reservation_max_participant_cnt,
        participant_info: `${reservationInfo[0].reservation_participant_cnt}/${reservationInfo[0].reservation_max_participant_cnt}`,
        match_name: reservationInfo[0].reservation_match,
        reservation_title: reservationInfo[0].reservation_bio,
        reservation_start_time: reservationInfo[0].reservation_start_time ? new Date(reservationInfo[0].reservation_start_time).toISOString() : null,
        host_id: reservationInfo[0].host_id,
        is_host: reservationInfo[0].host_id === user_id,
        selected_store: selectedStore                                     // 🆕 선택된 가게 정보
      }
    };

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '참여자 목록 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🏪 가게 선택 관련 서비스

// 방장이 채팅방의 최종 가게 선택
exports.selectStore = async (user_id, room_id, store_id) => {
  const conn = getConnection();

  try {
    // 1. 방장 권한 확인
    const [hostCheck] = await conn.query(
      'SELECT user_id FROM reservation_table WHERE reservation_id = ?',
      [room_id]
    );

    if (!hostCheck.length || hostCheck[0].user_id !== user_id) {
      const err = new Error("방장만 가게를 선택할 수 있습니다.");
      err.statusCode = 403;
      err.errorCode = "PERMISSION_DENIED";
      throw err;
    }

    let selectedStoreInfo = null;

    // 2. 가게 선택 해제인 경우 (store_id가 null)
    if (!store_id) {
      await conn.query(
        `UPDATE reservation_table 
         SET selected_store_id = NULL, selected_store_name = NULL, 
             selected_at = NULL, selected_by = NULL
         WHERE reservation_id = ?`,
        [room_id]
      );

      selectedStoreInfo = {
        store_id: null,
        store_name: null,
        selected_at: null,
        selected_by: null
      };
    } else {
      // 3. 가게 정보 조회 (선택할 가게가 존재하는지 확인)
      const [storeInfo] = await conn.query(
        'SELECT store_id, store_name, store_address, store_rating, store_thumbnail FROM store_table WHERE store_id = ?',
        [store_id]
      );

      if (!storeInfo.length) {
        const err = new Error("존재하지 않는 가게입니다.");
        err.statusCode = 404;
        err.errorCode = "STORE_NOT_FOUND";
        throw err;
      }

      const store = storeInfo[0];
      const selectedAt = new Date();

      // 4. 가게 선택 정보 업데이트
      await conn.query(
        `UPDATE reservation_table 
         SET selected_store_id = ?, selected_store_name = ?, 
             selected_at = ?, selected_by = ?
         WHERE reservation_id = ?`,
        [store_id, store.store_name, selectedAt, user_id, room_id]
      );

      selectedStoreInfo = {
        store_id: store.store_id,
        store_name: store.store_name,
        store_address: store.store_address,
        store_rating: store.store_rating,
        store_thumbnail: store.store_thumbnail,
        selected_at: selectedAt.toISOString(),
        selected_by: user_id
      };
    }

    // 5. 시스템 메시지 추가 및 실시간 알림 전송
    try {
      const { getIO } = require('../config/socket_hub');
      const io = getIO();

      // 방장 이름 조회
      const [userInfo] = await conn.query(
        'SELECT user_name FROM user_table WHERE user_id = ?',
        [user_id]
      );
      const userName = userInfo.length > 0 ? userInfo[0].user_name : '알 수 없는 사용자';

      // 6. 시스템 메시지 생성 및 저장
      let systemMessage;

      if (store_id) {
        // 가게 선택 시스템 메시지 (기존 패턴과 동일하게)
        systemMessage = `${userName}님이 ${selectedStoreInfo.store_name}을 모임 장소로 선택하셨습니다.`;
      } else {
        // 가게 선택 해제 시스템 메시지
        systemMessage = `${userName}님이 가게 선택을 해제하셨습니다.`;
      }

      console.log('💬 [STORE SELECT] 시스템 메시지 생성:', {
        room_id: room_id,
        message: systemMessage,
        sender_id: 'system'
      });

      // 시스템 메시지를 채팅방에 저장 (기존 패턴과 동일하게)
      const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages WHERE chat_room_id = ?', [room_id]);
      const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

      await conn.query(
        `INSERT INTO chat_messages 
         (message_id, chat_room_id, sender_id, message, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [nextMessageId, room_id, 'system', systemMessage]
      );

      const savedMessage = {
        message_id: nextMessageId,
        chat_room_id: room_id,
        sender_id: 'system',
        message: systemMessage,
        created_at: new Date(),
        message_type: store_id ? 'system_store_selected' : 'system_store_deselected',
        user_name: userName,
        user_id: user_id
      };

      console.log('✅ [STORE SELECT] 시스템 메시지 저장 완료:', {
        message_id: savedMessage.message_id,
        room_id: room_id
      });

      // 7. 실시간 소켓 알림 전송
      const currentSockets = await io.in(room_id.toString()).fetchSockets();
      console.log('🏪 [STORE SELECT] 소켓 이벤트 발송 준비:', {
        room_id: room_id,
        total_sockets: currentSockets.length,
        users: currentSockets.map(s => ({
          socket_id: s.id,
          user_id: s.user?.user_id,
          user_name: s.user?.user_name
        }))
      });

      // 가게 선택 이벤트 데이터
      const eventData = {
        room_id: parseInt(room_id),
        store_id: selectedStoreInfo.store_id,
        store_name: selectedStoreInfo.store_name,
        store_address: selectedStoreInfo.store_address,
        store_rating: selectedStoreInfo.store_rating,
        store_thumbnail: selectedStoreInfo.store_thumbnail,
        selected_by: user_id,
        selected_by_name: userName,
        selected_at: selectedStoreInfo.selected_at,
        action: store_id ? 'selected' : 'deselected'
      };

      console.log('🏪 [STORE SELECT] 이벤트 데이터:', eventData);

      // 채팅방의 모든 참여자에게 이벤트 발송
      io.to(room_id.toString()).emit('storeSelected', eventData);

      // 시스템 메시지도 함께 브로드캐스트 (기존 패턴과 동일하게)
      io.to(room_id.toString()).emit('newMessage', savedMessage);

      console.log('✅ [STORE SELECT] 소켓 이벤트 발송 완료:', {
        room_id: room_id,
        events: ['storeSelected', 'newMessage'],
        recipients_count: currentSockets.length
      });

    } catch (error) {
      console.error('❌ [STORE SELECT] 시스템 메시지 및 소켓 알림 실패:', error);
      console.error('에러 상세:', error.stack);
    }

    return {
      chat_room_id: parseInt(room_id),
      selected_store: selectedStoreInfo,
      message: store_id ? '가게가 선택되었습니다.' : '가게 선택이 해제되었습니다.'
    };

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '가게 선택 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 💰 정산 시스템 서비스

// 방장이 정산 시작 (자동 가격 계산)
exports.startPayment = async (user_id, room_id) => {
  const conn = getConnection();

  try {
    await conn.query('START TRANSACTION');

    // 1. 방장 권한 확인
    const [hostCheck] = await conn.query(
      'SELECT user_id FROM reservation_table WHERE reservation_id = ?',
      [room_id]
    );

    if (!hostCheck.length || hostCheck[0].user_id !== user_id) {
      const err = new Error("방장만 정산을 시작할 수 있습니다.");
      err.statusCode = 403;
      err.errorCode = "PERMISSION_DENIED";
      throw err;
    }

    // 2. 정산 시작 조건 확인
    const [reservationInfo] = await conn.query(
      `SELECT reservation_status, selected_store_id, reservation_participant_cnt,
              selected_store_name, reservation_match
       FROM reservation_table WHERE reservation_id = ?`,
      [room_id]
    );

    if (!reservationInfo.length) {
      const err = new Error("존재하지 않는 채팅방입니다.");
      err.statusCode = 404;
      err.errorCode = "CHAT_ROOM_NOT_FOUND";
      throw err;
    }

    const reservation = reservationInfo[0];

    // 🔴 조건 1: 모집 마감 상태 확인
    if (reservation.reservation_status !== 1) {
      const err = new Error("모집이 마감된 후에만 정산을 시작할 수 있습니다.");
      err.statusCode = 400;
      err.errorCode = "INVALID_CONDITIONS";
      throw err;
    }

    // 🔴 조건 2: 가게 선택 완료 확인
    if (!reservation.selected_store_id) {
      const err = new Error("가게가 선택된 후에만 정산을 시작할 수 있습니다.");
      err.statusCode = 400;
      err.errorCode = "INVALID_CONDITIONS";
      throw err;
    }

    // 3. 이미 정산 진행 중인지 확인
    const [existingPayment] = await conn.query(
      'SELECT payment_id, completed_payments, total_participants FROM payment_sessions WHERE chat_room_id = ? AND payment_status = "in_progress"',
      [room_id]
    );

    if (existingPayment.length > 0) {
      const existing = existingPayment[0];
      console.log('⚠️ [PAYMENT] 기존 정산 세션 발견:', {
        payment_id: existing.payment_id,
        completed_payments: existing.completed_payments,
        total_participants: existing.total_participants,
        room_id: room_id
      });

      // 기존 정산 세션이 있지만 아무도 입금하지 않은 경우 자동으로 초기화
      if (existing.completed_payments === 0) {
        console.log('🔄 [PAYMENT] 미사용 정산 세션 자동 초기화');
        await this.resetPaymentSession(room_id);
      } else {
        const err = new Error(`이미 정산이 진행 중입니다. (${existing.completed_payments}/${existing.total_participants}명 완료)`);
        err.statusCode = 409;
        err.errorCode = "PAYMENT_ALREADY_STARTED";
        err.existingSession = {
          payment_id: existing.payment_id,
          completed_payments: existing.completed_payments,
          total_participants: existing.total_participants
        };
        throw err;
      }
    }

    // 4. 가게 정보 및 예약금 정보 조회
    console.log('🔍 [PAYMENT] 가게 정보 조회 시작 - store_id:', reservation.selected_store_id);
    
    const [storeInfo] = await conn.query(
      `SELECT store_id, store_name, bank_name, account_number, account_holder, deposit_amount
       FROM store_table WHERE store_id = ?`,
      [reservation.selected_store_id]
    );

    console.log('🔍 [PAYMENT] 가게 정보 조회 결과:', storeInfo);

    if (!storeInfo.length) {
      const err = new Error("가게 정보를 찾을 수 없습니다.");
      err.statusCode = 404;
      err.errorCode = "STORE_NOT_FOUND";
      throw err;
    }

    const store = storeInfo[0];
    const totalParticipants = reservation.reservation_participant_cnt;
    
    // 🔴 가게에서 설정한 예약금을 참가자 수로 나누어 1인당 금액 계산 (n빵)
    const storeDepositAmount = parseInt(store.deposit_amount) || 0;
    
    console.log('💰 [PAYMENT] 예약금 계산 정보:', {
      store_id: store.store_id,
      store_name: store.store_name,
      original_deposit_amount: store.deposit_amount,
      parsed_deposit_amount: storeDepositAmount,
      total_participants: totalParticipants
    });
    
    if (storeDepositAmount <= 0) {
      const err = new Error(`가게에서 예약금이 설정되지 않았습니다. (현재: ${storeDepositAmount}원) 가게에 문의해주세요.`);
      err.statusCode = 400;
      err.errorCode = "NO_DEPOSIT_AMOUNT";
      throw err;
    }
    
    const paymentPerPerson = Math.ceil(storeDepositAmount / totalParticipants); // 올림 처리로 n빵
    const totalAmount = paymentPerPerson * totalParticipants;
    
    console.log('💰 [PAYMENT] 최종 계산 결과:', {
      store_deposit_amount: storeDepositAmount,
      payment_per_person: paymentPerPerson,
      total_amount: totalAmount,
      calculation: `${storeDepositAmount} ÷ ${totalParticipants} = ${paymentPerPerson} (올림)`
    });

    // 5. 정산 세션 생성
    const paymentId = `payment_${room_id}_${Date.now()}`;
    const paymentDeadline = new Date();
    paymentDeadline.setDate(paymentDeadline.getDate() + 3); // 3일 후 마감

    await conn.query(
      `INSERT INTO payment_sessions 
       (payment_id, chat_room_id, reservation_id, store_id, payment_per_person, 
        total_amount, total_participants, started_by, payment_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, room_id, room_id, reservation.selected_store_id,
        paymentPerPerson, totalAmount, totalParticipants, user_id, paymentDeadline]
    );

    // 6. 참여자별 정산 기록 생성
    const [participants] = await conn.query(
      `SELECT cru.user_id, u.user_name
       FROM chat_room_users cru
       JOIN user_table u ON cru.user_id = u.user_id
       WHERE cru.reservation_id = ? AND cru.is_kicked = 0`,
      [room_id]
    );

    const participantRecords = participants.map(p => [
      paymentId, p.user_id, p.user_name
    ]);

    await conn.query(
      `INSERT INTO payment_records (payment_id, user_id, user_name) VALUES ?`,
      [participantRecords]
    );

    await conn.query('COMMIT');

    // 7. 채팅방에 예약금 안내 시스템 메시지 추가
    try {
      const { getIO } = require('../config/socket_hub');
      const io = getIO();

      // 방장 이름 조회
      const [userInfo] = await conn.query(
        'SELECT user_name FROM user_table WHERE user_id = ?',
        [user_id]
      );
      const userName = userInfo.length > 0 ? userInfo[0].user_name : '방장';

      // 🆕 구조화된 예약금 안내 데이터 생성 (클라이언트 UI용)
      const paymentGuideData = {
        type: 'payment_guide',
        title: '예약금 안내',
        store: {
          name: store.store_name,
          address: null // 필요시 추가
        },
        payment: {
          per_person: finalPaymentAmount,
          total_amount: totalAmount,
          participants_count: totalParticipants
        },
        account: {
          bank_name: store.bank_name,
          account_number: store.account_number,
          account_holder: store.account_holder
        },
        deadline: {
          date: paymentDeadline.toISOString(),
          display: paymentDeadline.toLocaleDateString('ko-KR') + ' ' + paymentDeadline.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        },
        progress: {
          completed: 0,
          total: totalParticipants,
          percentage: 0
        },
        participants: participants.map(p => ({
          user_id: p.user_id,
          user_name: p.user_name,
          status: 'pending' // 'pending' | 'completed'
        })),
        payment_id: paymentId,
        started_by: user_id,
        started_at: new Date().toISOString()
      };

      // 시스템 메시지로 저장 (간단한 텍스트 + 구조화된 데이터)
      const simpleMessage = `💰 정산이 시작되었습니다 (${finalPaymentAmount.toLocaleString()}원)`;

      const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages WHERE chat_room_id = ?', [room_id]);
      const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

      await conn.query(
        `INSERT INTO chat_messages 
         (message_id, chat_room_id, sender_id, message, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [nextMessageId, room_id, 'system', simpleMessage]
      );

      console.log('💰 [PAYMENT START] 예약금 안내 시스템 메시지 저장 완료:', {
        message_id: nextMessageId,
        room_id: room_id,
        payment_id: paymentId
      });

      // 🆕 시스템 메시지 데이터 구성 (간단한 메시지 + 구조화된 데이터)
      const savedPaymentMessage = {
        message_id: nextMessageId,
        chat_room_id: room_id,
        sender_id: 'system',
        message: simpleMessage,
        created_at: new Date(),
        message_type: 'system_payment_start',
        payment_id: paymentId,
        user_name: userName,
        user_id: user_id,
        payment_guide_data: paymentGuideData // 🆕 구조화된 데이터 추가
      };

      // 8. 실시간 소켓 알림 전송
      // 🆕 정산 시작 이벤트 (클라이언트가 기대하는 형태로 전송)
      io.to(room_id.toString()).emit('paymentStarted', {
        room_id: room_id,
        payment_id: paymentId,
        started_by: user_id,
        started_by_name: userName,
        payment_per_person: finalPaymentAmount,
        total_amount: totalAmount,
        payment_deadline: paymentDeadline.toISOString(),
        store_account: {
          bank_name: store.bank_name,
          account_number: store.account_number,
          account_holder: store.account_holder
        },
        payment_guide_data: paymentGuideData // 🆕 추가적인 구조화된 데이터
      });

      // 🆕 시스템 메시지 브로드캐스트 (구조화된 데이터 포함)
      io.to(room_id.toString()).emit('newMessage', savedPaymentMessage);

      console.log('✅ [PAYMENT START] 소켓 이벤트 발송 완료:', {
        room_id: room_id,
        events: ['paymentStarted', 'newMessage'],
        payment_id: paymentId
      });

    } catch (error) {
      console.error('❌ [PAYMENT START] 시스템 메시지 및 소켓 알림 실패:', error);
      console.error('에러 상세:', error.stack);
    }

    // 8. 응답 데이터 구성
    const participantsResponse = participants.map(p => ({
      user_id: p.user_id,
      user_name: p.user_name,
      is_host: p.user_id === user_id,
      payment_status: 'pending',
      paid_at: null
    }));

    return {
      payment_id: paymentId,
      chat_room_id: parseInt(room_id),
      total_participants: totalParticipants,
      payment_per_person: paymentPerPerson,
      total_amount: totalAmount,
      store_deposit_amount: storeDepositAmount, // 🆕 가게 원래 예약금
      store_account: {
        bank_name: store.bank_name,
        account_number: store.account_number,
        account_holder: store.account_holder
      },
      payment_deadline: paymentDeadline.toISOString(),
      participants: participantsResponse
    };

  } catch (error) {
    await conn.query('ROLLBACK');
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '정산 시작 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 개별 사용자 입금 완료 처리
exports.completePayment = async (user_id, room_id, payment_method) => {
  const conn = getConnection();

  try {
    await conn.query('START TRANSACTION');

    // 1. 진행 중인 정산 세션 확인
    const [paymentSession] = await conn.query(
      'SELECT payment_id, total_participants FROM payment_sessions WHERE chat_room_id = ? AND payment_status = "in_progress"',
      [room_id]
    );

    if (!paymentSession.length) {
      const err = new Error("진행 중인 정산이 없습니다.");
      err.statusCode = 404;
      err.errorCode = "NO_PAYMENT_SESSION";
      throw err;
    }

    const paymentId = paymentSession[0].payment_id;
    const totalParticipants = paymentSession[0].total_participants;

    // 2. 사용자의 정산 기록 확인
    const [userRecord] = await conn.query(
      'SELECT payment_status, user_name FROM payment_records WHERE payment_id = ? AND user_id = ?',
      [paymentId, user_id]
    );

    if (!userRecord.length) {
      const err = new Error("정산 대상자가 아닙니다.");
      err.statusCode = 403;
      err.errorCode = "NOT_PARTICIPANT";
      throw err;
    }

    if (userRecord[0].payment_status === 'completed') {
      const err = new Error("이미 입금이 완료되었습니다.");
      err.statusCode = 409;
      err.errorCode = "ALREADY_PAID";
      throw err;
    }

    const userName = userRecord[0].user_name;
    const paidAt = new Date();

    // 3. 입금 완료 처리
    await conn.query(
      `UPDATE payment_records 
       SET payment_status = 'completed', payment_method = ?, paid_at = ?
       WHERE payment_id = ? AND user_id = ?`,
      [payment_method, paidAt, paymentId, user_id]
    );

    // 4. 완료된 입금 수 업데이트
    await conn.query(
      `UPDATE payment_sessions 
       SET completed_payments = (
         SELECT COUNT(*) FROM payment_records 
         WHERE payment_id = ? AND payment_status = 'completed'
       )
       WHERE payment_id = ?`,
      [paymentId, paymentId]
    );

    // 5. 현재 상태 조회
    const [updatedSession] = await conn.query(
      'SELECT completed_payments FROM payment_sessions WHERE payment_id = ?',
      [paymentId]
    );

    const completedPayments = updatedSession[0].completed_payments;
    const remainingPending = totalParticipants - completedPayments;
    const isFullyCompleted = remainingPending === 0;

    // 6. 전체 정산 완료 시 세션 상태 업데이트
    if (isFullyCompleted) {
      await conn.query(
        'UPDATE payment_sessions SET payment_status = "completed", completed_at = ? WHERE payment_id = ?',
        [paidAt, paymentId]
      );
    }

    await conn.query('COMMIT');

    // 7. 채팅방 예약금 안내 메시지 업데이트 및 실시간 소켓 알림
    try {
      const { getIO } = require('../config/socket_hub');
      const io = getIO();

      // 🆕 예약금 안내 데이터 업데이트 (구조화된 데이터)
      await updatePaymentGuideData(conn, room_id, paymentId, completedPayments, totalParticipants, isFullyCompleted);

      // 개별 입금 완료 알림
      io.to(room_id.toString()).emit('paymentCompleted', {
        room_id: room_id,
        payment_id: paymentId,
        user_id: user_id,
        user_name: userName,
        paid_at: paidAt.toISOString(),
        remaining_pending: remainingPending,
        completed_payments: completedPayments,
        total_participants: totalParticipants
      });

      // 전체 정산 완료 알림 및 완료 메시지 추가
      if (isFullyCompleted) {
        const [totalAmountInfo] = await conn.query(
          'SELECT total_amount FROM payment_sessions WHERE payment_id = ?',
          [paymentId]
        );

        // 정산 완료 시스템 메시지 추가
        const completionMessage = `✅ 정산이 완료되었습니다!

💰 총 ${totalAmountInfo[0].total_amount.toLocaleString()}원이 모두 입금되었습니다.
👥 모든 참여자(${totalParticipants}명)가 입금을 완료했습니다.

감사합니다! 🎉`;

        // 정산 완료 시스템 메시지 저장
        const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages WHERE chat_room_id = ?', [room_id]);
        const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

        await conn.query(
          `INSERT INTO chat_messages 
           (message_id, chat_room_id, sender_id, message, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [nextMessageId, room_id, 'system', completionMessage]
        );

        const completionSystemMessage = {
          message_id: nextMessageId,
          chat_room_id: room_id,
          sender_id: 'system',
          message: completionMessage,
          created_at: new Date(),
          message_type: 'system_payment_completed',
          payment_id: paymentId
        };

        // 정산 완료 시스템 메시지 브로드캐스트
        io.to(room_id.toString()).emit('newMessage', completionSystemMessage);

        // 전체 정산 완료 이벤트
        io.to(room_id.toString()).emit('paymentFullyCompleted', {
          room_id: room_id,
          payment_id: paymentId,
          completed_at: paidAt.toISOString(),
          total_amount: totalAmountInfo[0].total_amount,
          all_participants_paid: true
        });

        console.log('🎉 [PAYMENT COMPLETE] 전체 정산 완료 처리:', {
          room_id: room_id,
          payment_id: paymentId,
          total_amount: totalAmountInfo[0].total_amount
        });
      }

      console.log('✅ [PAYMENT UPDATE] 입금 완료 처리 및 메시지 업데이트 완료:', {
        room_id: room_id,
        user_id: user_id,
        completed_payments: completedPayments,
        total_participants: totalParticipants,
        is_fully_completed: isFullyCompleted
      });

    } catch (error) {
      console.error('❌ [PAYMENT UPDATE] 소켓 알림 및 메시지 업데이트 실패:', error);
      console.error('에러 상세:', error.stack);
    }

    return {
      user_id: user_id,
      user_name: userName,
      payment_status: 'completed',
      paid_at: paidAt.toISOString(),
      remaining_pending: remainingPending,
      is_fully_completed: isFullyCompleted
    };

  } catch (error) {
    await conn.query('ROLLBACK');
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '입금 완료 처리 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 정산 세션 초기화 (방장 전용)
exports.resetPaymentSession = async (room_id, user_id = null) => {
  const conn = getConnection();

  try {
    console.log('🔄 [PAYMENT RESET] 정산 세션 초기화 시작:', { room_id, user_id });

    // 진행 중인 정산 세션 확인
    const [existingSession] = await conn.query(
      'SELECT payment_id, started_by, completed_payments FROM payment_sessions WHERE chat_room_id = ? AND payment_status = "in_progress"',
      [room_id]
    );

    if (!existingSession.length) {
      console.log('✅ [PAYMENT RESET] 초기화할 정산 세션이 없음');
      return { message: '초기화할 정산 세션이 없습니다.' };
    }

    const session = existingSession[0];

    // 사용자 권한 확인 (user_id가 제공된 경우)
    if (user_id) {
      // 방장 권한 확인
      const [hostCheck] = await conn.query(
        'SELECT user_id FROM reservation_table WHERE reservation_id = ? AND user_id = ?',
        [room_id, user_id]
      );

      if (!hostCheck.length) {
        const err = new Error('방장만 정산을 초기화할 수 있습니다.');
        err.statusCode = 403;
        err.errorCode = 'PERMISSION_DENIED';
        throw err;
      }

      // 이미 입금된 사용자가 있는 경우 초기화 금지
      if (session.completed_payments > 0) {
        const err = new Error(`이미 ${session.completed_payments}명이 입금을 완료했습니다. 초기화할 수 없습니다.`);
        err.statusCode = 400;
        err.errorCode = 'PAYMENT_IN_PROGRESS';
        throw err;
      }
    }

    await conn.query('START TRANSACTION');

    // 1. 관련 정산 기록 삭제
    await conn.query(
      'DELETE FROM payment_records WHERE payment_id = ?',
      [session.payment_id]
    );

    // 2. 정산 세션 삭제
    await conn.query(
      'DELETE FROM payment_sessions WHERE payment_id = ?',
      [session.payment_id]
    );

    await conn.query('COMMIT');

    console.log('✅ [PAYMENT RESET] 정산 세션 초기화 완료:', {
      payment_id: session.payment_id,
      room_id: room_id
    });

    // 실시간 알림 (세션 초기화)
    try {
      const { getIO } = require('../config/socket_hub');
      const io = getIO();

      io.to(room_id.toString()).emit('paymentReset', {
        room_id: room_id,
        payment_id: session.payment_id,
        message: '정산이 초기화되었습니다.',
        reset_at: new Date().toISOString()
      });
    } catch (error) {
      console.log('소켓 정산 초기화 알림 실패:', error.message);
    }

    return {
      message: '정산 세션이 초기화되었습니다.',
      reset_payment_id: session.payment_id
    };

  } catch (error) {
    await conn.query('ROLLBACK');
    console.error('❌ [PAYMENT RESET] 정산 세션 초기화 에러:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '정산 세션 초기화 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 정산 상태 조회
exports.getPaymentStatus = async (user_id, room_id) => {
  const conn = getConnection();

  try {
    // 1. 사용자 권한 확인 (해당 채팅방 참여자인지)
    const [participantCheck] = await conn.query(
      'SELECT user_id FROM chat_room_users WHERE reservation_id = ? AND user_id = ? AND is_kicked = 0',
      [room_id, user_id]
    );

    if (!participantCheck.length) {
      const err = new Error("채팅방 참여자만 정산 상태를 조회할 수 있습니다.");
      err.statusCode = 403;
      err.errorCode = "FORBIDDEN";
      throw err;
    }

    // 2. 정산 세션 정보 조회
    const [paymentSession] = await conn.query(
      `SELECT ps.*, s.store_name, s.bank_name, s.account_number, s.account_holder
       FROM payment_sessions ps
       JOIN store_table s ON ps.store_id = s.store_id
       WHERE ps.chat_room_id = ?
       ORDER BY ps.started_at DESC
       LIMIT 1`,
      [room_id]
    );

    if (!paymentSession.length) {
      return {
        payment_status: 'not_started',
        message: '정산이 시작되지 않았습니다.'
      };
    }

    const session = paymentSession[0];

    // 3. 참여자별 입금 상태 조회
    const [participants] = await conn.query(
      `SELECT user_id, user_name, payment_status, payment_method, paid_at
       FROM payment_records
       WHERE payment_id = ?
       ORDER BY paid_at ASC, user_name ASC`,
      [session.payment_id]
    );

    const participantsWithHostFlag = participants.map(p => ({
      user_id: p.user_id,
      user_name: p.user_name,
      is_host: p.user_id === session.started_by,
      payment_status: p.payment_status,
      payment_method: p.payment_method,
      paid_at: p.paid_at ? new Date(p.paid_at).toISOString() : null
    }));

    return {
      payment_id: session.payment_id,
      payment_status: session.payment_status,
      total_participants: session.total_participants,
      completed_payments: session.completed_payments,
      pending_payments: session.total_participants - session.completed_payments,
      payment_per_person: session.payment_per_person,
      total_amount: session.total_amount,
      store_info: {
        store_name: session.store_name,
        bank_name: session.bank_name,
        account_number: session.account_number,
        account_holder: session.account_holder
      },
      payment_deadline: session.payment_deadline ? new Date(session.payment_deadline).toISOString() : null,
      started_at: session.started_at ? new Date(session.started_at).toISOString() : null,
      completed_at: session.completed_at ? new Date(session.completed_at).toISOString() : null,
      participants: participantsWithHostFlag
    };

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '정산 상태 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 💰 기존 결제 관련 서비스 (유지)

// 방장의 예약금 결제 요청
exports.requestPayment = async (roomId, userId, paymentData) => {
  const conn = getConnection();
  const { amount, message } = paymentData;

  try {
    // 방장 권한 확인 (테스트용으로 임시 비활성화)
    console.log('RoomId:', roomId, 'UserId:', userId); // 디버깅용

    // 테스트용으로 권한 확인 비활성화 - 나중에 다시 활성화할 예정
    /*
    const [roomInfo] = await conn.query(
      `SELECT rt.user_id FROM reservation_table rt
       JOIN chat_rooms cr ON rt.reservation_id = cr.reservation_id
       WHERE cr.id = ?`,
      [roomId]
    );

    if (roomInfo.length === 0 || roomInfo[0].user_id !== userId) {
      const err = new Error('방장만 결제 요청을 할 수 있습니다.');
      err.statusCode = 403;
      err.errorCode = 'FORBIDDEN';
      throw err;
    }
    */

    // 결제 요청 정보 저장
    const [result] = await conn.query(
      `INSERT INTO payment_request_table 
       (chat_room_id, requester_id, amount, message, request_time, status)
       VALUES (?, ?, ?, ?, NOW(), 'pending')`,
      [parseInt(roomId), userId, amount, message]
    );

    // 채팅방에 결제 요청 메시지 발송 (chat_messages 테이블 사용)
    // message_id 자동 생성
    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, parseInt(roomId), userId, `💰 예약금 결제 요청: ${amount}원 - ${message}`]
    );

    return {
      payment_request_id: result.insertId,
      amount,
      message
    };
  } catch (error) {
    console.log('MySQL Error:', error.message); // 구체적인 에러 메시지 출력
    console.log('Error Code:', error.code); // MySQL 에러 코드 출력
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 요청 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 결제 상태 확인
exports.getPaymentStatus = async (roomId, userId) => {
  const conn = getConnection();

  try {
    // 해당 채팅방의 결제 요청 상태 조회
    const [paymentRequests] = await conn.query(
      `SELECT 
        pr.payment_request_id,
        pr.amount,
        pr.message,
        pr.request_time,
        pr.status,
        u.user_name as requester_name
       FROM payment_request_table pr
       JOIN user_table u ON pr.requester_id = u.user_id
       WHERE pr.chat_room_id = ?
       ORDER BY pr.request_time DESC`,
      [roomId]
    );

    // 사용자의 결제 상태 조회
    const [userPayments] = await conn.query(
      `SELECT 
        payment_id,
        payment_amount,
        payment_method,
        payment_status,
        payment_time
       FROM payment_table
       WHERE chat_room_id = ? AND payer_id = ?
       ORDER BY payment_time DESC`,
      [roomId, userId]
    );

    return {
      payment_requests: paymentRequests,
      user_payments: userPayments
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 상태 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 결제 처리
exports.processPayment = async (roomId, userId, paymentData) => {
  const conn = getConnection();
  const { payment_method, payment_amount } = paymentData;

  try {
    // 결제 정보 저장
    const [result] = await conn.query(
      `INSERT INTO payment_table 
       (chat_room_id, payer_id, payment_amount, payment_method, payment_status, payment_time)
       VALUES (?, ?, ?, ?, 'completed', NOW())`,
      [parseInt(roomId), userId, payment_amount, payment_method]
    );

    // 결제 완료 메시지 발송 (chat_messages 테이블 사용)
    // message_id 자동 생성
    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, parseInt(roomId), userId, `✅ 결제 완료: ${payment_amount}원 (${payment_method})`]
    );

    return {
      payment_id: result.insertId,
      payment_amount,
      payment_method,
      payment_status: 'completed'
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 처리 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 결제 미완료 참가자 강퇴
exports.kickUnpaidParticipant = async (roomId, targetUserId, requesterId) => {
  const conn = getConnection();

  try {
    // 1. 방장 권한 확인 (테스트용으로 임시 비활성화)
    console.log('Kick request - RoomId:', roomId, 'TargetUserId:', targetUserId, 'RequesterId:', requesterId);

    // 테스트용으로 권한 확인 비활성화
    /*
    const [roomInfo] = await conn.query(
      `SELECT rt.user_id FROM reservation_table rt
       JOIN chat_rooms cr ON rt.reservation_id = cr.reservation_id
       WHERE cr.id = ?`,
      [roomId]
    );

    if (roomInfo.length === 0 || roomInfo[0].user_id !== requesterId) {
      const err = new Error('방장만 참가자를 강퇴할 수 있습니다.');
      err.statusCode = 403;
      err.errorCode = 'FORBIDDEN';
      throw err;
    }
    */

    // 2. 대상 사용자가 채팅방에 있는지 확인
    const [participantInfo] = await conn.query(
      `SELECT * FROM chat_room_users 
       WHERE reservation_id = (SELECT reservation_id FROM chat_rooms WHERE id = ?) 
       AND user_id = ? AND is_kicked = 0`,
      [roomId, targetUserId]
    );

    if (participantInfo.length === 0) {
      const err = new Error('강퇴할 참가자를 찾을 수 없습니다.');
      err.statusCode = 404;
      err.errorCode = 'PARTICIPANT_NOT_FOUND';
      throw err;
    }

    // 3. 대상 사용자의 결제 상태 확인
    const [paymentInfo] = await conn.query(
      `SELECT * FROM payment_table 
       WHERE chat_room_id = ? AND payer_id = ? AND payment_status = 'completed'`,
      [roomId, targetUserId]
    );

    if (paymentInfo.length > 0) {
      const err = new Error('결제를 완료한 참가자는 강퇴할 수 없습니다.');
      err.statusCode = 400;
      err.errorCode = 'PAYMENT_COMPLETED';
      throw err;
    }

    // 4. 참가자 강퇴 처리
    await conn.query(
      `UPDATE chat_room_users 
       SET is_kicked = 1 
       WHERE reservation_id = (SELECT reservation_id FROM chat_rooms WHERE id = ?) 
       AND user_id = ?`,
      [roomId, targetUserId]
    );

    // 5. 강퇴 메시지 발송
    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, parseInt(roomId), requesterId, `🚫 ${targetUserId}님이 결제 미완료로 강퇴되었습니다.`]
    );

    return {
      kicked_user_id: targetUserId,
      reason: 'payment_not_completed'
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '참가자 강퇴 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🏪 채팅용 가게 리스트 조회 (간단한 정보만)
exports.getStoreListForChat = async (keyword, limit = 10) => {
  const conn = getConnection();

  try {
    let query = `
      SELECT 
        store_id,
        store_name,
        store_address,
        store_rating,
        store_thumbnail
      FROM store_table
      WHERE 1=1
    `;
    const params = [];

    // 키워드 검색 (가게명, 주소)
    if (keyword) {
      query += ` AND (
        store_name LIKE ? OR 
        store_address LIKE ?
      )`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    query += ` ORDER BY store_rating DESC, store_name ASC LIMIT ?`;
    params.push(limit);

    const [rows] = await conn.query(query, params);

    // store_id를 숫자로 변환
    const convertedRows = rows.map(row => ({
      ...row,
      store_id: parseInt(row.store_id) || 0
    }));

    return convertedRows;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '가게 목록 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🏪 가게 공유 메시지에서 store_id 추출 헬퍼 함수
const extractStoreIdFromMessage = (message) => {
  // 메시지에서 store_id를 추출하는 로직
  // 현재는 메시지 내용에서 추출하는 방식이지만,
  // 실제로는 별도 테이블이나 메타데이터에서 가져와야 함
  const storeIdMatch = message.match(/store_id:\s*(\d+)/);
  return storeIdMatch ? parseInt(storeIdMatch[1]) : null;
};

// 🏪 가게 공유 메시지 전송
exports.shareStore = async (user_id, room_id, store_id) => {
  const conn = getConnection();

  try {
    // 1. 가게 정보 조회
    const [storeInfo] = await conn.query(
      `SELECT 
        store_id, store_name, store_address, store_rating, store_thumbnail
       FROM store_table 
       WHERE store_id = ?`,
      [store_id]
    );

    if (storeInfo.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }

    const store = storeInfo[0];

    // 2. 사용자 정보 조회
    const [userInfo] = await conn.query(
      `SELECT user_name FROM user_table WHERE user_id = ?`,
      [user_id]
    );

    const userName = userInfo.length > 0 ? userInfo[0].user_name : '알 수 없는 사용자';

    // 3. 공유 메시지 생성 (store_id 포함)
    const shareMessage = `🏪 ${store.store_name}\n📍 ${store.store_address}\n⭐ ${store.store_rating || 0}점\n\n가게 상세 정보를 보려면 클릭하세요!\n\nstore_id: ${store.store_id}`;

    // 4. 메시지 ID 생성
    const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
    const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

    // 5. 공유 메시지 저장
    await conn.query(
      `INSERT INTO chat_messages 
       (message_id, chat_room_id, sender_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [nextMessageId, room_id, user_id, shareMessage]
    );

    // 6. 가게 공유 메타데이터 저장 (추가 테이블이 있다면)
    // 현재는 메시지에 store_id를 포함하는 방식으로 처리
    const storeShareData = {
      message_id: nextMessageId,
      store_id: parseInt(store.store_id) || 0,
      store_name: store.store_name,
      store_address: store.store_address,
      store_rating: store.store_rating,
      store_thumbnail: store.store_thumbnail,
      shared_by: user_id,
      shared_by_name: userName
    };

    // 7. 실시간으로 공유 메시지 전송
    try {
      const { getIO } = require('../config/socket_hub');
      const io = getIO();

      const messageData = {
        message_id: nextMessageId,
        chat_room_id: room_id,
        sender_id: user_id,
        message: shareMessage,
        created_at: new Date(),
        message_type: 'store_share',
        store_share_data: storeShareData
      };

      io.to(`room_${room_id}`).emit('new_message', messageData);
    } catch (socketError) {
      console.error('소켓 전송 실패:', socketError);
    }

    return {
      message_id: nextMessageId,
      store_share_data: storeShareData
    };

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '가게 공유 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 예약금 안내 데이터 업데이트 헬퍼 함수 (구조화된 데이터 업데이트)
const updatePaymentGuideData = async (conn, room_id, payment_id, completed_payments, total_participants, is_fully_completed) => {
  try {
    console.log('🔄 [PAYMENT GUIDE UPDATE] 예약금 안내 데이터 업데이트 시작:', {
      room_id: room_id,
      payment_id: payment_id,
      completed_payments: completed_payments,
      total_participants: total_participants
    });

    // 현재 정산 세션 및 참여자 정보 조회
    const [sessionInfo] = await conn.query(
      `SELECT ps.*, s.store_name, s.bank_name, s.account_number, s.account_holder
       FROM payment_sessions ps
       JOIN store_table s ON ps.store_id = s.store_id
       WHERE ps.payment_id = ?`,
      [payment_id]
    );

    if (sessionInfo.length === 0) {
      console.log('⚠️ [PAYMENT GUIDE UPDATE] 정산 세션 정보를 찾을 수 없음');
      return;
    }

    const session = sessionInfo[0];

    // 참여자별 입금 상태 조회
    const [participants] = await conn.query(
      `SELECT user_id, user_name, payment_status, paid_at
       FROM payment_records
       WHERE payment_id = ?
       ORDER BY user_name ASC`,
      [payment_id]
    );

    // 🆕 업데이트된 구조화된 데이터 생성
    const updatedPaymentGuideData = {
      type: 'payment_guide',
      title: '예약금 안내',
      store: {
        name: session.store_name,
        address: null
      },
      payment: {
        per_person: session.payment_per_person,
        total_amount: session.total_amount,
        participants_count: session.total_participants
      },
      account: {
        bank_name: session.bank_name,
        account_number: session.account_number,
        account_holder: session.account_holder
      },
      deadline: {
        date: session.payment_deadline ? new Date(session.payment_deadline).toISOString() : null,
        display: session.payment_deadline ? new Date(session.payment_deadline).toLocaleDateString('ko-KR') + ' ' + new Date(session.payment_deadline).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : null
      },
      progress: {
        completed: completed_payments,
        total: total_participants,
        percentage: Math.round((completed_payments / total_participants) * 100)
      },
      participants: participants.map(p => ({
        user_id: p.user_id,
        user_name: p.user_name,
        status: p.payment_status, // 'pending' | 'completed'
        completed_at: p.paid_at ? new Date(p.paid_at).toISOString() : null
      })),
      payment_id: payment_id,
      started_by: session.started_by,
      started_at: session.started_at ? new Date(session.started_at).toISOString() : null,
      is_completed: is_fully_completed,
      updated_at: new Date().toISOString()
    };

    // 🆕 실시간 예약금 안내 업데이트 이벤트 발송
    const { getIO } = require('../config/socket_hub');
    const io = getIO();

    // 예약금 안내 업데이트 이벤트 (클라이언트 UI 업데이트용)
    io.to(room_id.toString()).emit('paymentGuideUpdated', {
      room_id: room_id,
      payment_id: payment_id,
      payment_guide_data: updatedPaymentGuideData,
      update_type: 'progress_update',
      completed_payments: completed_payments,
      total_participants: total_participants,
      is_fully_completed: is_fully_completed
    });

    console.log('✅ [PAYMENT GUIDE UPDATE] 예약금 안내 데이터 업데이트 완료:', {
      room_id: room_id,
      payment_id: payment_id,
      progress: `${completed_payments}/${total_participants}`,
      percentage: Math.round((completed_payments / total_participants) * 100)
    });

  } catch (error) {
    console.error('❌ [PAYMENT GUIDE UPDATE] 데이터 업데이트 실패:', error);
    console.error('에러 상세:', error.stack);
  }
};

// 🆕 채팅방 상세 정보 조회
exports.getChatRoomDetail = async (user_id, room_id) => {
  const conn = getConnection();

  try {
    console.log('🔍 [CHAT DETAIL] 채팅방 상세 정보 조회 시작:', { user_id, room_id });

    // 1. 채팅방 존재 여부 및 참여자 권한 확인
    const [authCheck] = await conn.query(
      `SELECT cru.reservation_id, cru.user_id, cru.is_kicked
       FROM chat_room_users cru
       JOIN reservation_table rt ON cru.reservation_id = rt.reservation_id
       WHERE cru.reservation_id = ? AND cru.user_id = ? AND cru.is_kicked = 0`,
      [room_id, user_id]
    );

    if (authCheck.length === 0) {
      const err = new Error('채팅방을 찾을 수 없거나 접근 권한이 없습니다.');
      err.statusCode = 404;
      throw err;
    }

    // 2. 채팅방 기본 정보 조회
    const [reservationInfo] = await conn.query(
      `SELECT 
        rt.reservation_id,
        rt.reservation_match as name,
        rt.user_id as host_id,
        rt.reservation_status,
        rt.reservation_participant_cnt,
        rt.reservation_max_participant_cnt,
        rt.reservation_match,
        rt.reservation_bio,
        rt.reservation_start_time,
        rt.selected_store_id,
        rt.selected_store_name,
        rt.selected_at,
        rt.selected_by,
        rt.reservation_created_time
       FROM reservation_table rt
       WHERE rt.reservation_id = ?`,
      [room_id]
    );

    if (reservationInfo.length === 0) {
      const err = new Error('채팅방 정보를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }

    const reservation = reservationInfo[0];

    // 3. 선택된 가게 상세 정보 조회 (가게가 선택된 경우)
    let selectedStore = null;
    if (reservation.selected_store_id) {
      const [storeInfo] = await conn.query(
        `SELECT 
          store_id, store_name, store_address, store_rating, store_thumbnail,
          payment_per_person, bank_name, account_number, account_holder
         FROM store_table 
         WHERE store_id = ?`,
        [reservation.selected_store_id]
      );

      if (storeInfo.length > 0) {
        const store = storeInfo[0];
        selectedStore = {
          store_id: store.store_id,
          store_name: store.store_name,
          store_address: store.store_address,
          store_rating: store.store_rating,
          store_thumbnail: store.store_thumbnail,
          payment_per_person: store.payment_per_person,
          selected_at: reservation.selected_at ? new Date(reservation.selected_at).toISOString() : null,
          selected_by: reservation.selected_by
        };

        // 선택한 사용자 이름 조회
        if (reservation.selected_by) {
          const [selectedByUser] = await conn.query(
            `SELECT user_name FROM user_table WHERE user_id = ?`,
            [reservation.selected_by]
          );
          if (selectedByUser.length > 0) {
            selectedStore.selected_by_name = selectedByUser[0].user_name;
          }
        }
      }
    }

    // 4. 마지막 메시지 정보 조회
    const [lastMessageInfo] = await conn.query(
      `SELECT 
        message_id, sender_id, message, created_at
       FROM chat_messages 
       WHERE chat_room_id = ?
       ORDER BY message_id DESC 
       LIMIT 1`,
      [room_id]
    );

    // 5. 현재 사용자 정보 조회
    const [currentUserInfo] = await conn.query(
      `SELECT user_name FROM user_table WHERE user_id = ?`,
      [user_id]
    );

    const currentUserName = currentUserInfo.length > 0 ? currentUserInfo[0].user_name : '알 수 없는 사용자';

    // 6. 응답 데이터 구성
    const isHost = reservation.host_id === user_id;
    const statusMessages = {
      0: '모집 중',
      1: '모집 마감',
      2: '진행 중',
      3: '완료'
    };

    const responseData = {
      chat_room_id: parseInt(room_id),
      name: reservation.name,
      host_id: reservation.host_id,
      is_host: isHost,
      user_role: isHost ? '방장' : '참가자',

      // 모집 상태 정보
      reservation_status: reservation.reservation_status,
      status_message: statusMessages[reservation.reservation_status],
      is_recruitment_closed: reservation.reservation_status === 1,
      participant_info: `${reservation.reservation_participant_cnt}/${reservation.reservation_max_participant_cnt}`,
      reservation_participant_cnt: reservation.reservation_participant_cnt,
      reservation_max_participant_cnt: reservation.reservation_max_participant_cnt,
      match_name: reservation.reservation_match,
      reservation_title: reservation.reservation_bio,
      reservation_start_time: reservation.reservation_start_time ? new Date(reservation.reservation_start_time).toISOString() : null,

      // 선택된 가게 정보
      selected_store: selectedStore,

      // 마지막 메시지 정보
      last_message: lastMessageInfo.length > 0 ? lastMessageInfo[0].message : null,
      last_message_time: lastMessageInfo.length > 0 ? new Date(lastMessageInfo[0].created_at).toISOString() : null,
      last_message_sender_id: lastMessageInfo.length > 0 ? lastMessageInfo[0].sender_id : null
    };

    console.log('✅ [CHAT DETAIL] 채팅방 상세 정보 조회 완료:', {
      chat_room_id: room_id,
      user_id: user_id,
      is_host: isHost,
      reservation_status: reservation.reservation_status,
      has_selected_store: !!selectedStore
    });

    return responseData;

  } catch (error) {
    console.error('❌ [CHAT DETAIL] 채팅방 상세 정보 조회 에러:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '채팅방 정보 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};