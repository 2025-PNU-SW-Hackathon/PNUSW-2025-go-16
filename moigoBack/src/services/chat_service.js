// 📦 chat_service.js
// DB 직접 접근하는 채팅 기능 비즈니스 로직 모음

const e = require('express');
const { getConnection } = require('../config/db_config');
const messageService = require('../services/message_service');
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
  
  // 방장 여부 판별 로그 추가
  const processedRows = rows.map(row => {
    const isHost = row.host_id === user_id;
    const role = isHost ? '방장' : '참가자';
    
    console.log('📋 [DEBUG] 채팅방 정보:', {
      chat_room_id: row.chat_room_id,
      name: row.name,
      host_id: row.host_id,
      current_user: user_id,
      role: role,
      last_message_sender: row.last_message_sender_id
    });

    return {
      ...row,
      is_host: isHost,                    // 🆕 방장 여부 플래그
      user_role: role                     // 🆕 사용자 역할
    };
  });

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

// 👋 2. 채팅방 나가기 (모임에서도 나가기)
exports.leaveChatRoom = async (user_id, room_id) => {
  const conn = getConnection();
  
  // 사용자 정보 조회
  const [userInfo] = await conn.query(
    `SELECT user_name FROM user_table WHERE user_id = ?`,
    [user_id]
  );
  
  const userName = userInfo.length > 0 ? userInfo[0].user_name : '알 수 없는 사용자';
  
  // 1. 채팅방에서 제거
  await conn.query(
    `DELETE FROM chat_room_users WHERE reservation_id = ? AND user_id = ?`,
    [room_id, user_id]
  );
  
  // 2. 모임 참여자 수 감소
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
  
  // 3. 시스템 메시지 생성 - 사용자 퇴장 알림
  const systemMessage = `${userName}님이 모임을 나가셨습니다.`;
  
  // 시스템 메시지 저장
  const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages');
  const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;
  
  await conn.query(
    `INSERT INTO chat_messages 
     (message_id, chat_room_id, sender_id, message, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [nextMessageId, room_id, 'system', systemMessage]
  );

  // 4. 실시간으로 시스템 메시지 전송
  try {
    const { getIO } = require('../config/socket_hub');
    const io = getIO();
    const systemMessageData = {
      message_id: nextMessageId,
      chat_room_id: room_id,
      sender_id: 'system',
      message: systemMessage,
      created_at: new Date(),
      message_type: 'system_leave', // 시스템 메시지 타입 추가
      user_name: userName, // 퇴장한 사용자 이름
      user_id: user_id // 퇴장한 사용자 ID
    };
    
    io.to(room_id.toString()).emit('newMessage', systemMessageData);
  } catch (error) {
    console.log('소켓 전송 실패 (서버 시작 중일 수 있음):', error.message);
  }
};

// 📌 3. 채팅방 상태 변경
exports.updateChatRoomStatus = async (user_id, room_id, status) => {
  const conn = getConnection();
  // 나갔을때는 다시 들어올 수 있게 삭제.
  await conn.query('DELETE FROM chat_room_users WHERE reservation_id = ? AND user_id = ?;',
    [room_id, user_id]
  )
  // 참여자 수 줄이기
  await conn.query(
    `UPDATE reservation_table
    SET reservation_participant_cnt = reservation_participant_cnt - 1,
    reservation_status = 0
    WHERE reservation_id = ?`,
    [room_id]
  );
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
      } catch (error) {
        console.log('소켓 전송 실패 (서버 시작 중일 수 있음):', error.message);
      }
    }
    else {
      console.log("user not found");
    }
    return { kicked_user_id: target_user_id };
  }
  else {
    const err = new Error("권한이 없습니다.");
    err.statusCode = 401;
    err.errorCode = "INVALID_APPROACH";
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
    'SELECT reservation_match, reservation_status FROM reservation_table WHERE reservation_id = ?'
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
      [reservation_id, existingReservation[0].reservation_match]
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

  return {
    reservation_id,
    message: '입장 완료',
  };
};

// 💰 결제 관련 서비스

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