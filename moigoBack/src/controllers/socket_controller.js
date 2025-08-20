// controllers/socket_controller.js
const jwt = require('jsonwebtoken');
const messageService = require('../services/message_service');

// socket 통신의 controller
module.exports = async function handleSocket(io) {
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token.split(' ')[1] ||
                socket.handshake.headers?.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('인증 토큰이 필요합니다.'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // 이후 이벤트에서 socket.user.user_id 등으로 사용 가능
            console.log(decoded);
            next();
        } catch (err) {
            return next(new Error('유효하지 않은 토큰입니다.'));
        }
    });

    io.on('connection', async (socket) => {
        // 클라이언트가 연결되면 socket이 필수
        // 채팅방에 참여
        socket.on('joinRoom', async (room_id) => {
            const result = await messageService.authRoom(room_id);
            if (result.length > 0) {
                console.log('joined', room_id);
                socket.join(room_id); // 여기 반드시 socket 사용

                // api 요청 시 읽음 처리를 구현함.
                await messageService.markAllMessagesAsRead(socket.user.user_id, room_id);
            }
            else {
                socket.emit('errorMessage', {
                    code: 'INVALID_AUTH',
                    message: '참여하지 않은 채팅방입니다.'
                });
            }
        });

        // 클라이언트가 메시지 전송 시
        socket.on('sendMessage', async ({ room, message }) => {
            try {
                console.log('📨 메시지 전송 요청:', {
                    user_id: socket.user.user_id,
                    room: room,
                    message: message
                });
                
                // 메시지를 db에 저장
                const new_message_result = await messageService.saveNewMessage(socket.user.user_id, room, message);

                console.log('💾 저장된 메시지:', new_message_result);

                // 메시지를 해당 방에 브로드캐스트
                // 전송자 포함하지 않음.
                socket.to(room).emit('newMessage', new_message_result);

                // 현재 채팅창 읽음 갱신.
                const socketsInRoom = await io.in(room).fetchSockets();
                for (const socket of socketsInRoom) {
                    await messageService.markAllMessagesAsRead(socket.user.user_id, room);
                }

            } catch (err) {
                console.error('메시지 저장 오류:', err);
                socket.emit('error', '메시지를 보낼 수 없습니다.');
            }
        });

        // 클라이언트가 연결 종료 시
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user.user_id}`);
        });
    });

};