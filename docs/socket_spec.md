# 📘 Socket Client API 명세서 (`client.js` 기반)

클라이언트에서 사용하는 소켓 이벤트 및 요청 구조를 아래와 같이 정의합니다.

---

## ✅ 공통 설정

- **서버 주소**: `http://localhost:5000`
- **경로**: `/socket.io`
- **연결 방식**: `websocket`
- **JWT 인증**:
  ```javascript
  auth: {
    token: 'Bearer <JWT 토큰 문자열>'
  }
  ```

---

## 🔌 1. 연결 이벤트 (`connect`)

- **목적**: 서버와의 연결 성공 시 초기 로직 실행
- **이벤트명**: `connect` (내장 이벤트)
- **응답 예시**:
  ```text
  ✅ Connected to server (socket id): <socket.id>
  ```

---

## 📥 2. 방 참여 (`joinRoom`)

- **emit**: `joinRoom`
- **요청 형식**:
  ```javascript
  socket.emit('joinRoom', <roomId>);
  ```

- **파라미터**:
  - `roomId`: `number` – 참여할 채팅방 ID

- **응답 (성공 시)**: 없음  
- **응답 (실패 시)**:
  ```javascript
  socket.on('errorMessage', (err) => {
    console.error(err.message);
  });
  ```

---

## 📨 3. 메시지 전송 (`sendMessage`)

- **emit**: `sendMessage`
- **요청 형식**:
  ```javascript
  socket.emit('sendMessage', {
    room: <roomId>,
    message: <messageText>
  });
  ```

- **파라미터**:
  - `room`: `number` – 메시지를 보낼 채팅방 ID
  - `message`: `string` – 메시지 본문

- **응답 (자신은 받지 않음)**:
  ```javascript
  socket.on('newMessage', (data) => {
    console.log('📨 새 메시지:', data);
  });
  ```

- **실패 시**:
  ```javascript
  socket.on('error', (errMsg) => {
    console.error('메시지를 보낼 수 없습니다.');
  });
  ```

---

## 📡 4. 새 메시지 수신 (`newMessage`)

- **on**: `newMessage`
- **설명**: 다른 사용자가 보낸 메시지를 수신
- **응답 형식**:
  ```javascript
  {
    message_id: number,
    chat_room_id: number,
    sender_id: string,
    message: string,
    created_at: datetime
  }
  ```

---

## ❌ 5. 연결 해제 (`disconnect`)

- **on**: `disconnect`
- **설명**: 서버와의 연결이 끊겼을 때 호출됨
- **예시**:
  ```javascript
  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
  });
  ```

---

## ⚠️ 6. 연결 오류 (`connect_error`)

- **on**: `connect_error`
- **설명**: 서버 연결 실패 시 에러 메시지 수신
- **예시**:
  ```javascript
  socket.on('connect_error', (err) => {
    console.error('🚫 연결 에러:', err.message);
  });
  ```
