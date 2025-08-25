// 📦 reservationService.js
// DB 직접 접근하는 비즈니스 로직 모음

const { getConnection } = require('../config/db_config');
const chatService = require('../services/chat_service');
const pushService = require('./push_service');
// 🧾 1. 모임 생성 서비스
exports.createReservation = async (user_id, data) => {
  const conn = getConnection();
  
  console.log(`🔍 [DEBUG] 모임 생성 요청 - user_id: ${user_id}`);
  console.log(`🔍 [DEBUG] 전송된 데이터:`, data);
  
  const {
    store_id,
    match_id,  // 🆕 경기 ID 기반
    reservation_bio,
    reservation_max_participant_cnt,
    // 기존 수동 입력 방식도 지원
    reservation_start_time,
    reservation_end_time,
    reservation_match,
    reservation_match_category,
    reservation_title,  // 🆕 추가
    reservation_description,  // 🆕 추가
    reservation_date,  // 🆕 추가
  } = data;
  
  let finalStartTime, finalEndTime, finalMatchName, finalReservationTitle, finalCategory, finalEx2;
  
  // 경기 ID가 있으면 경기 정보에서 가져오기
  if (match_id) {
    console.log(`🔍 [DEBUG] match_id 기반 모임 생성: ${match_id}`);
    
    const [matchRows] = await conn.query(
      'SELECT match_date, home_team, away_team, competition_code FROM matches WHERE id = ?',
      [match_id]
    );
    
    if (matchRows.length === 0) {
      const err = new Error('존재하지 않는 경기입니다.');
      err.statusCode = 400;
      throw err;
    }
    
    const match = matchRows[0];
    finalStartTime = match.match_date;  // 경기 시작 시간
    finalEndTime = new Date(new Date(match.match_date).getTime() + 2 * 60 * 60 * 1000); // 2시간 후
    finalMatchName = `${match.home_team} vs ${match.away_team}`;  // 🆕 경기명 (match_name)
    finalReservationTitle = reservation_title || '함께 시청해요';  // 🆕 방 제목 (reservation_title)
    finalEx2 = match.competition_code; // competition_code를 ex2에 저장
    // competition_code를 정수로 매핑
    const categoryMap = {
      'PD': 1,     // 프리미어리그
      'FL1': 2,    // 리그 1
      'PL': 3,     // 기타 리그
      'Unknown': 0
    };
    finalCategory = categoryMap[match.competition_code] || 0;  // 정수값으로 변환
    
    console.log(`🔍 [DEBUG] 경기 기반 - 경기명: ${finalMatchName}, 방제목: ${finalReservationTitle}`);
  } else {
    // 기존 수동 입력 방식
    console.log(`🔍 [DEBUG] 수동 입력 방식`);
    
    // 수동 입력 시에는 ex2를 null로 설정
    finalEx2 = null;
    
    // 새로운 프론트엔드 필드들 처리
    if (reservation_title && reservation_date) {
      // 새로운 방식: reservation_title, reservation_date, reservation_start_time 사용
      const dateStr = reservation_date; // YYYY-MM-DD
      finalStartTime = `${dateStr} ${reservation_start_time}`;
      finalEndTime = `${dateStr} ${reservation_end_time}`;
      finalMatchName = null;  // 🆕 수동 모임은 경기명 없음
      finalReservationTitle = reservation_title || '모임';  // 🆕 방 제목
      finalCategory = parseInt(reservation_match_category) || 0;  // 정수형으로 변환, NULL 방지
      console.log(`🔍 [DEBUG] 수동 모임 - 방제목: ${finalReservationTitle}, 시간: ${finalStartTime} - ${finalEndTime}`);
    } else if (reservation_start_time && /^\d{2}:\d{2}:\d{2}$/.test(reservation_start_time)) {
      // 기존 방식: 시간만 들어온 경우 오늘 날짜와 합치기
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      finalStartTime = `${today} ${reservation_start_time}`;
      finalEndTime = `${today} ${reservation_end_time}`;
      finalMatchName = reservation_match || null;  // 🆕 경기명 (있으면)
      finalReservationTitle = reservation_title || '모임';  // 🆕 방 제목
      finalCategory = parseInt(reservation_match_category) || 0;  // 정수형으로 변환, NULL 방지
      console.log(`🔍 [DEBUG] 기존 방식 - 경기명: ${finalMatchName}, 방제목: ${finalReservationTitle}`);
    } else {
      // 완전한 datetime이 들어온 경우
      finalStartTime = reservation_start_time;
      finalEndTime = reservation_end_time;
      finalMatchName = reservation_match || null;  // 🆕 경기명 (있으면)
      finalReservationTitle = reservation_title || '모임';  // 🆕 방 제목
      finalCategory = parseInt(reservation_match_category) || 0;  // 정수형으로 변환, NULL 방지
    }
  }

  const createdAt = new Date(); // MySQL DATETIME 타입과 호환
  const [rows] = await conn.query('SELECT MAX(reservation_id) as maxId FROM reservation_table');
  const reservation_current_id = (rows[0].maxId || 0) + 1;

  const [result] = await conn.query(
    `INSERT INTO reservation_table
     (reservation_id, user_id, store_id, reservation_start_time, reservation_end_time,
      reservation_match, reservation_bio, reservation_max_participant_cnt,
      reservation_match_category, reservation_status, reservation_created_time,
      reservation_participant_cnt, reservation_participant_id, reservation_user_name,
      reservation_ex2)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?, ?)`,
    [
      reservation_current_id,
      user_id,
      store_id,
      finalStartTime,  // 🆕 경기 날짜 또는 수동 입력 날짜
      finalEndTime,    // 🆕 경기 날짜 + 2시간 또는 수동 입력 날짜
      finalMatchName,      // 🆕 경기명 (match_name) - 경기 기반만
      finalReservationTitle,  // 🆕 방 제목 (reservation_title)
      reservation_max_participant_cnt,
      finalCategory,   // 🆕 경기 카테고리 또는 수동 입력 카테고리
      createdAt,
      user_id,         // participant_id 초기값 = user_id
      '알수없음',
      finalEx2,  // 🆕 competition_code를 reservation_ex2에 저장
    ]
  );

  const create_chatRoom = await chatService.enterChatRoom(user_id, reservation_current_id);
  return {
    reservation_id: reservation_current_id,
    created_at: createdAt.toISOString(),
  };
};

// 🙋 2. 모임 참여 서비스
exports.joinReservation = async (user_id, reservation_id, user_name) => {
  const conn = getConnection();

  // 1) 이미 참여했는지 확인
  const [exists] = await conn.query(
    `SELECT user_id, is_kicked
       FROM chat_room_users
      WHERE user_id = ? AND reservation_id = ?`,
    [user_id, reservation_id]
  );
  if (exists.length > 0) {
    if (exists[0].is_kicked === 1) {
      const err = new Error("강제 퇴장 당하였습니다.");
      err.statusCode = 401;
      err.errorCode = "KICKED";
      throw err;
    } else {
      const err = new Error("이미 참여 중입니다.");
      err.statusCode = 409;
      err.errorCode = "ALREADY_JOINED";
      throw err;
    }
  }

  // 2) 모임 유효성 검사(모집중인지)
  const [reservation] = await conn.query(
    `SELECT reservation_status,
            reservation_participant_cnt,
            reservation_max_participant_cnt
       FROM reservation_table
      WHERE reservation_id = ?`,
    [reservation_id]
  );
  if (reservation.length === 0 || reservation[0].reservation_status !== 0) {
    const err = new Error("참여할 수 없는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_ACTION";
    throw err;
  }

  // 3) 채팅방 입장(참가자 등록)
  try {
    await chatService.enterChatRoom(user_id, reservation_id);
  } catch (err) {
    console.log("[JOIN] enterChatRoom error:", err);
    // 계속 진행은 가능(알림/카운트 업데이트는 독립)
  }

  // 4) 인원 수 증가 + 상태 업데이트 (원자적 업데이트)
  const updateSql = `
    UPDATE reservation_table
       SET reservation_participant_cnt = reservation_participant_cnt + 1,
           reservation_status = CASE
             WHEN reservation_participant_cnt + 1 >= reservation_max_participant_cnt THEN 1
             ELSE 0
           END
     WHERE reservation_id = ?
       AND reservation_status = 0
       AND reservation_participant_cnt < reservation_max_participant_cnt
  `;
  const [upd] = await conn.query(updateSql, [reservation_id]);
  if (upd.affectedRows === 0) {
    const err = new Error("참여할 수 없는 모임입니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_ACTION";
    throw err;
  }

  // 5) 현재 인원 수 조회
  const [cntRows] = await conn.query(
    `SELECT reservation_participant_cnt
       FROM reservation_table
      WHERE reservation_id = ?`,
    [reservation_id]
  );
  const participantCnt = cntRows?.[0]?.reservation_participant_cnt ?? null;

  // 6) 푸시 알림 (본인 제외하여 참가자들에게)
  try {
    await pushService.sendUserJoinedPush({
      reservationId: reservation_id,
      joinedUserId: user_id,
      joinedUserName: user_name
    });
    console.log("[JOIN] push sent");
  } catch (err) {
    console.log("[JOIN] push error:", err);
  }

  // 7) 응답
  return {
    message: "모임에 참여하였습니다.",
    participant_cnt: participantCnt,
  };
};

// 🔍 3. 모임 리스트 조회 서비스
exports.getReservationList = async (filters) => {
  const conn = getConnection();
  const { region, date, category, keyword } = filters;

  let query = `
    SELECT r.reservation_id, r.store_id, r.reservation_store_name,
           r.reservation_start_time, r.reservation_end_time,
           r.reservation_bio as reservation_title, r.reservation_match as match_name, r.reservation_status,
           r.reservation_participant_cnt,
           r.reservation_max_participant_cnt,
           r.reservation_ex2
    FROM reservation_table r
    LEFT JOIN store_table s ON r.store_id = s.store_id
    WHERE 1=1
  `;
  const params = [];

  if (region) {
    query += ` AND s.store_address LIKE ?`;
    params.push(`%${region}%`);
  }

  if (date) {
    query += ` AND DATE(r.reservation_start_time) = ?`;
    params.push(date);
  }

  if (category) {
    query += ` AND r.reservation_match_category = ?`;
    params.push(category);
  }

  if (keyword) {
    query += ` AND (r.reservation_match LIKE ? OR r.reservation_bio LIKE ?)`;
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  query += ` ORDER BY r.reservation_start_time ASC`;

  const [rows] = await conn.query(query, params);
  return rows;
};

// 2차 명세서 추가 부분
// 모임 취소 
exports.cancelReservation = async (reservation_id, user_id) => {
  const conn = getConnection();
  const [rows] = await conn.query(
    'SELECT user_id FROM reservation_table WHERE reservation_id = ?',
    [reservation_id]
  );

  if (rows.length === 0) {
    const error = new Error('예약을 찾을 수 없습니다.');
    error.status = 404;
    error.errorCode = 'RESERVATION_NOT_FOUND';
    throw error;
  }

  if (rows[0].user_id !== user_id) {
    const error = new Error('권한이 없습니다.');
    console.log(error);
    error.status = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  // ? 취소 후 로직 정의 필요
  await conn.query(
    'DELETE FROM reservation_table WHERE reservation_id = ?',
    [reservation_id]
  );
  // 모임 취소 알림.
  
  // 참여자에게 kicked 설정

  return '모임이 정상적으로 취소되었습니다.';
};

// 모임 세부 정보 전송
exports.getReservationDetail = async (reservation_id) => {
  const conn = getConnection();
  const [reservationRows] = await conn.query(
    'SELECT * FROM reservation_table WHERE reservation_id = ?',
    [reservation_id]
  );

  if (reservationRows.length === 0) {
    const error = new Error('예약을 찾을 수 없습니다.');
    error.status = 404;
    error.errorCode = 'RESERVATION_NOT_FOUND';
    throw error;
  }

  const reservation = reservationRows[0];

  const [participants] = await conn.query(
    `SELECT u.user_id, u.user_name
    FROM chat_room_users cru
    JOIN user_table u 
      ON cru.user_id = u.user_id
    WHERE cru.reservation_id = ?`,
    [reservation_id]
  );

  return {
    reservation_id: reservation.reservation_id,
    store_id: reservation.store_id,
    store_name: reservation.reservation_store_name,
    reservation_start_time: reservation.reservation_start_time,
    reservation_end_time: reservation.reservation_end_time,
    reservation_match: reservation.reservation_match,
    reservation_bio: reservation.reservation_bio,
    reservation_status: reservation.reservation_status,
    reservation_participant_cnt: reservation.reservation_participant_cnt,
    reservation_max_participant_cnt: reservation.reservation_max_participant_cnt,
    reservation_ex2: reservation.reservation_ex2,  // 🆕 ex2 정보 추가
    participants: participants
  };
};

// 🆕 예약 승인/거절 (사장님 전용)
exports.approveReservation = async (reservationId, store_id, action) => {
  const conn = getConnection();
  try {
    console.log('🔍 [DEBUG] approveReservation 파라미터:', { reservationId, store_id, action });
    
    // 먼저 예약이 존재하는지 확인
    const [reservationCheck] = await conn.query(
      'SELECT reservation_id, store_id, selected_store_id, reservation_status FROM reservation_table WHERE reservation_id = ?',
      [reservationId]
    );
    
    console.log('🔍 [DEBUG] 예약 조회 결과:', reservationCheck);
    
    if (reservationCheck.length === 0) {
      const err = new Error('예약을 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    // 예약이 해당 매장의 것인지 확인 (selected_store_id로 체크)
    const reservationData = reservationCheck[0];
    
    if (reservationData.selected_store_id !== store_id) {
      const err = new Error(`해당 예약에 대한 권한이 없습니다. 예약의 store_id: ${reservationData.selected_store_id}, 요청한 store_id: ${store_id}`);
      err.statusCode = 403;
      throw err;
    }
    
    console.log('✅ [DEBUG] 매장 권한 확인 통과');
    
    const newStatus = action === 'APPROVE' ? 1 : 2; // 1: 승인, 2: 거절
    
    // 🐛 디버그 로그 추가
    console.log('🔍 [DEBUG] action:', action);
    console.log('🔍 [DEBUG] action === "APPROVE":', action === 'APPROVE');
    console.log('🔍 [DEBUG] newStatus:', newStatus);
    console.log('🔍 [DEBUG] reservationId:', reservationId);
    
    await conn.query(
      'UPDATE reservation_table SET reservation_status = ? WHERE reservation_id = ?',
      [newStatus, reservationId]
    );
    
    const message = action === 'APPROVE' 
      ? '예약이 성공적으로 승인되었습니다.' 
      : '예약이 거절되었습니다.';
    
    // 🔔 채팅방에 시스템 메시지 전송
    try {
      const messageService = require('./message_service');
      const io = require('../config/socket_hub').getIO();
      
      const systemMessage = action === 'APPROVE' 
        ? '🎉 사장님이 예약을 승인했습니다!' 
        : '❌ 사장님이 예약을 거절했습니다.';
      
      // 채팅방에 시스템 메시지 저장
      const savedMessage = await messageService.saveNewMessage(
        'system', 
        reservationId, 
        systemMessage, 
        action === 'APPROVE' ? 'system_reservation_approved' : 'system_reservation_rejected'
      );
      
      // 해당 채팅방에 실시간 알림 전송
      io.to(reservationId.toString()).emit('newMessage', savedMessage);
      
      // 🏪 사장님에게도 예약 상태 변경 알림 전송
      const storeRoom = `store_${store_id}`;
      io.to(storeRoom).emit('reservationStatusChanged', {
        type: 'RESERVATION_STATUS_CHANGED',
        reservationId,
        newStatus: newStatus === 1 ? 'APPROVED' : 'REJECTED',
        action: action,
        message: `예약 ${reservationId}번이 ${action === 'APPROVE' ? '승인' : '거절'}되었습니다.`
      });
      
      // 🗓️ 승인된 경우 사장님 달력 업데이트 알림 추가 전송
      if (action === 'APPROVE') {
        const reservationData = reservationCheck[0];
        io.to(storeRoom).emit('calendarUpdated', {
          type: 'CALENDAR_UPDATED',
          reservationId,
          eventData: {
            reservation_id: reservationId,
            reservation_match: reservationData.reservation_match || '경기 정보',
            reservation_title: reservationData.reservation_bio || '예약',
            match_start_time: reservationData.reservation_start_time,
            match_end_time: reservationData.reservation_end_time,
            current_participants: reservationData.reservation_participant_cnt,
            status: 'APPROVED'
          },
          message: `달력에 새로운 일정이 추가되었습니다.`
        });
        
        console.log(`📅 [CALENDAR UPDATE] 사장님 달력 업데이트 알림 전송 완료`);
      }
      
      console.log(`📢 [RESERVATION ${action}] 채팅방 ${reservationId}에 시스템 메시지 전송 완료`);
      console.log(`📡 [STORE NOTIFICATION] 사장님 room ${storeRoom}에 상태 변경 알림 전송 완료`);
    } catch (notificationError) {
      console.error('❌ [RESERVATION NOTIFICATION] 채팅방 알림 전송 실패:', notificationError);
      // 알림 실패해도 예약 처리는 성공으로 간주
    }
    
    return {
      message,
      data: {
        reservationId,
        newStatus: newStatus === 1 ? 'RESERVATION_CONFIRMED' : 'RESERVATION_REJECTED'
      }
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '예약 승인/거절 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 사장님 주간 일정 현황 조회
exports.getMyStoreSchedules = async (store_id) => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT 
        r.reservation_id,
        r.reservation_match,
        r.reservation_bio as reservation_title,
        r.reservation_start_time as match_start_time,
        r.reservation_end_time as match_end_time,
        r.reservation_participant_cnt as current_participants,
        r.reservation_max_participant_cnt as max_participants,
        r.reservation_status as status,
        r.reservation_user_name as participants
       FROM reservation_table r
       WHERE r.selected_store_id = ? 
       AND r.reservation_status = 1
       AND r.reservation_start_time >= NOW()
       AND r.reservation_start_time <= DATE_ADD(NOW(), INTERVAL 7 DAY)
       ORDER BY r.reservation_start_time ASC`,
      [store_id]
    );
    
    return rows.map(row => ({
      reservation_id: row.reservation_id,
      reservation_match: row.reservation_match,
      reservation_title: row.reservation_title,
      match_start_time: row.match_start_time,
      match_end_time: row.match_end_time,
      current_participants: row.current_participants,
      max_participants: row.max_participants,
      participants: row.participants,
      status: row.status === 1 ? 'APPROVED' : 'PENDING'
    }));
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '주간 일정 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};
