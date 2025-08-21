const { getConnection } = require('../config/db_config');

exports.joinRoom = async (user_id, room_id) => {
    const conn = getConnection();
    const [result] = await conn.query('SELECT user_id FROM reservation_participant_table WHERE reservation_id = ?'
        , [room_id]
    );
    return result;
};

// 메시지 room 권한 확인
exports.authRoom = async (room_id) => {

    const conn = getConnection();
    const [result] = await conn.query('SELECT user_id FROM chat_room_users WHERE reservation_id = ?'
        , [room_id]
    );
    return result;
};

// 메시지 읽음 처리
exports.markAllMessagesAsRead = async (user_id, room_id) => {

    const conn = getConnection();

    const [rows] = await conn.query(
        'SELECT MAX(message_id) AS maxId FROM chat_messages WHERE chat_room_id = ?',
        [room_id]
    )
    const new_message_id = ((rows?.[0]?.maxId) ?? 0);
    
    // UPSERT 방식으로 읽음 상태 업데이트
    await conn.query(
        `INSERT INTO chat_read_status (chat_room_id, user_id, last_read_message_id, updated_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE 
         last_read_message_id = VALUES(last_read_message_id),
         updated_at = CURRENT_TIMESTAMP`,
        [room_id, user_id, new_message_id > 0 ? new_message_id : -1]
    );

    return true;
}

// 메시지 DB에 저장
exports.saveNewMessage = async (user_id, room_id, message) => {
    const conn = getConnection();
    
    try {
        // 트랜잭션 시작 (성능 및 데이터 무결성)
        await conn.beginTransaction();

        // 새 메시지 ID 생성 (AUTO_INCREMENT 대신 수동 관리)
        const [last_message_id] = await conn.query(
            'SELECT MAX(message_id) as maxId FROM chat_messages WHERE chat_room_id = ?',
            [room_id]
        );
        const new_message_id = ((last_message_id[0]?.maxId) ?? 0) + 1;

        // 메시지 삽입
        await conn.query(
            `INSERT INTO chat_messages (message_id, chat_room_id, sender_id, message, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [new_message_id, room_id, user_id, message]
        );

        // 삽입된 메시지 조회
        const [rows] = await conn.query(
            `SELECT m.*, u.user_name 
             FROM chat_messages m 
             LEFT JOIN user_table u ON m.sender_id = u.user_id 
             WHERE m.message_id = ? AND m.chat_room_id = ?`,
            [new_message_id, room_id]
        );

        await conn.commit();

        if (rows.length === 0) {
            throw new Error('메시지 저장 후 조회에 실패했습니다.');
        }

        // 메시지 데이터 처리
        const messageData = {
            ...rows[0],
            id: rows[0].message_id, // 클라이언트 호환성을 위한 별칭
        };

        // 메시지 타입 결정
        if (messageData.sender_id === 'system') {
            messageData.message_type = 'system';
        } else if (messageData.message && messageData.message.includes('🏪')) {
            messageData.message_type = 'store_share';
            
            // 가게 공유 메시지에서 추가 정보 추출
            try {
                const storeIdMatch = messageData.message.match(/store_id:\s*(\d+)/);
                if (storeIdMatch) {
                    messageData.store_id = parseInt(storeIdMatch[1]);
                }
                
                const storeNameMatch = messageData.message.match(/🏪\s*([^\n]+)/);
                if (storeNameMatch) {
                    messageData.store_name = storeNameMatch[1].trim();
                }
            } catch (parseError) {
                console.error('가게 정보 파싱 오류:', parseError);
            }
        } else {
            messageData.message_type = 'user_message';
        }

        // 타임스탬프 정규화
        if (messageData.created_at) {
            messageData.created_at = new Date(messageData.created_at).toISOString();
        }

        return messageData;

    } catch (error) {
        await conn.rollback();
        console.error('❌ 메시지 저장 오류:', error);
        throw error;
    }
};