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
    );
    const lastId = rows?.[0]?.maxId ?? -1;

    // 먼저 업데이트 시도
    const [updateRes] = await conn.query(
        `UPDATE chat_read_status
   SET last_read_message_id = GREATEST(?, last_read_message_id),
       updated_at = CURRENT_TIMESTAMP
   WHERE chat_room_id = ? AND user_id = ?`,
        [lastId, room_id, user_id]
    );

    // 없으면 insert
    if (updateRes.affectedRows === 0) {
        await conn.query(
            `INSERT INTO chat_read_status (chat_room_id, user_id, last_read_message_id, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [room_id, user_id, lastId]
        );
    }

    return true;
}

// 메시지 DB에 저장
exports.saveNewMessage = async (user_id, room_id, message) => {

    const conn = getConnection();
    const [last_message_id] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages WHERE chat_room_id = ?',
        [room_id]
    )
    const new_message_id = ((last_message_id[0]?.maxId) ?? 0) + 1;
    const [result] = await conn.query(
        `INSERT INTO chat_messages (message_id, chat_room_id, sender_id, message) VALUES (?, ?, ?, ?)`,
        [new_message_id, room_id, user_id, message]
    );

    const [rows] = await conn.query(
        `SELECT * FROM chat_messages WHERE message_id = ? AND chat_room_id = ?`,
        [new_message_id, room_id]
    );

    // 일반 사용자 메시지인 경우 추가 정보 포함
    const messageData = rows[0];
    if (messageData.sender_id !== 'system') {
        messageData.message_type = 'user_message';
    }

    return messageData;
};