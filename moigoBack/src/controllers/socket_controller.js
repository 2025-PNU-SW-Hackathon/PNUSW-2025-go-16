// controllers/socket_controller.js
const jwt = require('jsonwebtoken');
const messageService = require('../services/message_service');
const push_service = require('../services/push_service');
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
        console.log('🔌 [CONNECT] 새 소켓 연결:', {
            socket_id: socket.id,
            user_id: socket.user?.user_id,
            user_name: socket.user?.user_name,
            timestamp: new Date().toISOString()
        });
        
        // 클라이언트가 연결되면 socket이 필수
        // 채팅방에 참여
        socket.on('joinRoom', async (data) => {
            try {
                // 🐛 데이터 형태 확인 및 파싱
                let room_id;
                if (typeof data === 'object' && data !== null) {
                    room_id = data.room_id || data.roomId || data.reservation_id;
                } else {
                    room_id = data;
                }

                console.log('🚪 채팅방 입장 요청:', {
                    user_id: socket.user.user_id,
                    received_data: data,
                    parsed_room_id: room_id
                });

                // 입력 검증
                if (!room_id) {
                    socket.emit('joinRoomError', {
                        error: '채팅방 ID가 필요합니다.',
                        code: 'MISSING_ROOM_ID'
                    });
                    return;
                }

                // 권한 확인
                const result = await messageService.authRoom(room_id);
                const isAuthorized = result.some(user => user.user_id === socket.user.user_id);

                if (isAuthorized) {
                    // 채팅방 입장
                    socket.join(room_id);
                    console.log('✅ 채팅방 입장 성공:', {
                        user_id: socket.user.user_id,
                        user_name: socket.user.user_name,
                        room_id: room_id
                    });

                    // 현재 방에 있는 소켓들 확인
                    const currentSockets = await io.in(room_id).fetchSockets();
                    console.log('📊 [JOIN DEBUG] 현재 방 접속자:', {
                        room_id: room_id,
                        total_sockets: currentSockets.length,
                        users: currentSockets.map(s => ({
                            socket_id: s.id,
                            user_id: s.user?.user_id,
                            user_name: s.user?.user_name
                        }))
                    });

                    // 성공 응답
                    socket.emit('joinRoomSuccess', {
                        success: true,
                        room_id: room_id,
                        message: '채팅방에 입장했습니다.'
                    });

                    // 읽음 처리 (비동기)
                    messageService.markAllMessagesAsRead(socket.user.user_id, room_id)
                        .catch(err => console.error('읽음 처리 오류:', err));

                    // 다른 사용자들에게 입장 알림 (선택적)
                    socket.to(room_id).emit('userJoined', {
                        user_id: socket.user.user_id,
                        user_name: socket.user.user_name,
                        timestamp: new Date().toISOString()
                    });

                } else {
                    socket.emit('joinRoomError', {
                        error: '채팅방에 참여 권한이 없습니다.',
                        code: 'UNAUTHORIZED_ROOM'
                    });
                }

            } catch (err) {
                console.error('❌ 채팅방 입장 오류:', err);
                socket.emit('joinRoomError', {
                    error: '채팅방 입장 중 오류가 발생했습니다.',
                    code: 'JOIN_ROOM_ERROR'
                });
            }
        });

        // 클라이언트가 메시지 전송 시
        socket.on('sendMessage', async (data) => {
            try {
                // 데이터 검증 및 정규화
                const { room, message, sender_id } = data;
                const tokenUserId = socket.user.user_id;
                const userName = socket.user.user_name;

                // 🔧 클라이언트가 보낸 sender_id 사용 (보안 검증 추가)
                const actualSenderId = sender_id || tokenUserId;

                console.log('📨 메시지 전송 요청:', {
                    token_user_id: tokenUserId,
                    client_sender_id: sender_id,
                    actual_sender_id: actualSenderId,
                    room: room,
                    message: message
                });

                // 🚨 보안 경고: sender_id와 토큰 사용자가 다른 경우
                if (sender_id && sender_id !== tokenUserId) {
                    console.warn('⚠️ [SECURITY] sender_id 불일치:', {
                        token_user: tokenUserId,
                        client_sender: sender_id,
                        using: actualSenderId
                    });
                }

                // 1. 입력 데이터 검증
                if (!room || !message || typeof message !== 'string') {
                    socket.emit('messageError', {
                        error: '잘못된 메시지 형식입니다.',
                        code: 'INVALID_FORMAT'
                    });
                    return;
                }

                if (message.trim().length === 0) {
                    socket.emit('messageError', {
                        error: '빈 메시지는 전송할 수 없습니다.',
                        code: 'EMPTY_MESSAGE'
                    });
                    return;
                }

                if (message.length > 1000) {
                    socket.emit('messageError', {
                        error: '메시지가 너무 깁니다. (최대 1000자)',
                        code: 'MESSAGE_TOO_LONG'
                    });
                    return;
                }

                // 2. 채팅방 권한 검증 (토큰 사용자로 검증)
                const roomAuth = await messageService.authRoom(room);
                const isAuthorized = roomAuth.some(user => user.user_id === tokenUserId);
                
                if (!isAuthorized) {
                    socket.emit('messageError', {
                        error: '채팅방에 참여 권한이 없습니다.',
                        code: 'UNAUTHORIZED_ROOM'
                    });
                    return;
                }

                // 3. 메시지 저장 (클라이언트가 보낸 sender_id 사용)
                const messagePromise = messageService.saveNewMessage(actualSenderId, room, message);
                
                // 4. 현재 방 상태 조회 (병렬 처리)
                const [new_message_result, socketsInRoom] = await Promise.all([
                    messagePromise,
                    io.in(room).fetchSockets()
                ]);

                const messageId = new_message_result?.message_id || new_message_result?.id;
                const activeUserIds = socketsInRoom.map(s => s.user.user_id);

                console.log('💾 저장된 메시지:', new_message_result);
                console.log('👥 현재 방 접속자 수:', activeUserIds.length, 'users:', activeUserIds);

                // 5. 전송자에게 성공 응답 (즉시)
                console.log('📤 [DEBUG] messageAck 전송 시작 to:', socket.user.user_id);
                socket.emit('messageAck', {
                    success: true,
                    messageId: messageId,
                    timestamp: new Date().toISOString()
                });
                console.log('✅ [DEBUG] messageAck 전송 완료');

                // 6. 메시지 브로드캐스트 (방 전체에게 - 전송자 포함)
                const broadcastMessage = {
                    ...new_message_result,
                    user_name: userName,
                    created_at: new Date().toISOString()
                };
                
                console.log('📢 [DEBUG] newMessage 브로드캐스트 시작');
                console.log('📢 [DEBUG] 브로드캐스트 대상 방:', room);
                console.log('📢 [DEBUG] 브로드캐스트 메시지:', broadcastMessage);
                
                // 전송자 제외하고 다른 사용자들에게 전송
                console.log('📢 [DEBUG] 다른 사용자들에게 전송 (전송자 제외)');
                socket.to(room).emit('newMessage', broadcastMessage);
                
                // 전송자에게도 확인용 메시지 전송 (Optimistic UI 확정용)
                console.log('📢 [DEBUG] 전송자에게도 확정 메시지 전송');
                socket.emit('newMessage', broadcastMessage);
                
                console.log('✅ [DEBUG] newMessage 브로드캐스트 완료');
                
                // 소켓 방 상태 재확인
                const finalSockets = await io.in(room).fetchSockets();
                console.log('📊 [FINAL DEBUG] 메시지 전송 후 방 상태:', {
                    room_id: room,
                    total_sockets: finalSockets.length,
                    users: finalSockets.map(s => s.user?.user_id)
                });

                // 7. 읽음 상태 업데이트 (비동기)
                Promise.all(
                    socketsInRoom.map(s => {
                        console.log(s.user.user_id, " is in socket");
                        messageService.markAllMessagesAsRead(s.user.user_id, room);
                        }
                    )
                ).catch(err => console.error('읽음 상태 업데이트 오류:', err));

                // 8. 푸시 알림 전송 (비동기)
                push_service.getUserIdsByReservation(room)
                    .then(allUserIds => {
                        const offlineUserIds = allUserIds.filter(uid => !activeUserIds.includes(uid));
                        if (offlineUserIds.length > 0) {
                            return push_service.sendChatMessagePushToUserIds({
                                reservationId: room,
                                targetUserIds: offlineUserIds,
                                messageId,
                                senderId: actualSenderId,
                                senderName: userName,
                                text: message
                            });
                        }
                    })
                    .catch(err => console.error('푸시 알림 전송 오류:', err));

            } catch (err) {
                console.error('❌ 메시지 전송 오류:', err);
                
                // 구체적인 에러 메시지 제공
                let errorMessage = '메시지를 보낼 수 없습니다.';
                let errorCode = 'UNKNOWN_ERROR';

                if (err.code === 'ER_NO_SUCH_TABLE') {
                    errorMessage = '채팅 시스템이 준비되지 않았습니다.';
                    errorCode = 'SYSTEM_NOT_READY';
                } else if (err.code === 'ECONNREFUSED') {
                    errorMessage = '데이터베이스 연결에 실패했습니다.';
                    errorCode = 'DB_CONNECTION_FAILED';
                } else if (err.message) {
                    errorMessage = err.message;
                }

                socket.emit('messageError', {
                    error: errorMessage,
                    code: errorCode,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // 채팅방 나가기
        socket.on('leaveRoom', async (room_id) => {
            try {
                console.log('🚪 채팅방 나가기 요청:', {
                    user_id: socket.user.user_id,
                    room_id: room_id
                });

                if (!room_id) {
                    socket.emit('leaveRoomError', {
                        error: '채팅방 ID가 필요합니다.',
                        code: 'MISSING_ROOM_ID'
                    });
                    return;
                }

                // 채팅방에서 나가기
                socket.leave(room_id);

                // 성공 응답
                socket.emit('leaveRoomSuccess', {
                    success: true,
                    room_id: room_id,
                    message: '채팅방에서 나갔습니다.'
                });

                // 다른 사용자들에게 퇴장 알림 (선택적)
                socket.to(room_id).emit('userLeft', {
                    user_id: socket.user.user_id,
                    user_name: socket.user.user_name,
                    timestamp: new Date().toISOString()
                });

                console.log('✅ 채팅방 나가기 성공:', {
                    user_id: socket.user.user_id,
                    room_id: room_id
                });

            } catch (err) {
                console.error('❌ 채팅방 나가기 오류:', err);
                socket.emit('leaveRoomError', {
                    error: '채팅방 나가기 중 오류가 발생했습니다.',
                    code: 'LEAVE_ROOM_ERROR'
                });
            }
        });

        // 연결 상태 확인 (heartbeat)
        socket.on('ping', () => {
            socket.emit('pong', {
                timestamp: new Date().toISOString(),
                user_id: socket.user.user_id
            });
        });

        // 🏪 가게 선택 이벤트 디버깅 (클라이언트에서 받은 이벤트 확인용)
        socket.on('storeSelected', (data) => {
            console.log('🏪 [SOCKET DEBUG] 클라이언트에서 storeSelected 이벤트 수신:', {
                socket_id: socket.id,
                user_id: socket.user?.user_id,
                received_data: data,
                timestamp: new Date().toISOString()
            });
        });

        // 클라이언트가 연결 종료 시
        socket.on('disconnect', (reason) => {
            console.log('🔌 [DISCONNECT] 소켓 연결 해제:', {
                socket_id: socket.id,
                user_id: socket.user?.user_id,
                user_name: socket.user?.user_name,
                reason: reason,
                timestamp: new Date().toISOString()
            });
            
            // 연결 종료 이벤트를 다른 사용자들에게 브로드캐스트 (선택적)
            socket.broadcast.emit('userDisconnected', {
                user_id: socket.user.user_id,
                user_name: socket.user.user_name,
                timestamp: new Date().toISOString(),
                reason: reason
            });
        });
    });

};