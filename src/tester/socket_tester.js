// client.js
const { io } = require('socket.io-client');

// JWT 토큰 (Bearer 포함)
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdGlkMiIsImlhdCI6MTc1Mzk4MzcxMSwiZXhwIjoxNzUzOTkwOTExfQ.S0iLOSlEEzrkGQ-CrGzUKk9dNL0HEt1mdITdBDY6P2Q'


// socket.io-client 초기화
const socket = io('http://localhost:5000', {
  path: '/socket.io',
  transports: ['websocket'],
  reconnectionAttempts: 3,
  timeout: 2000,
  auth: {
    token: token
  }
});

// 연결 성공
socket.on('connect', () => {
  console.log('✅ Connected to server (socket id):', socket.id);

  // 방 입장
  const roomId = 15;
  socket.emit('joinRoom', roomId);

  // 메시지 전송
  socket.emit('sendMessage', {
    room: roomId,
    message: '안녕하세요!'
  });
});

// 서버로부터 메시지 수신
socket.on('newMessage', (data) => {
  console.log('📨 새 메시지:', data);
});

// 연결 끊김
socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

// 로직 오류
socket.on('errorMessage', (err) => {
  console.error('🚫 연결 에러:', err.message);
});

// 오류 발생
socket.on('connect_error', (err) => {
  console.error('🚫 연결 에러:', err.message);
});