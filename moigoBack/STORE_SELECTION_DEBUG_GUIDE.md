# 🏪 가게 선택 소켓 이벤트 문제 해결 가이드

## 🔍 문제 상황
클라이언트에서 가게 선택 시 **서버에서 직접 채팅방에 시스템 메시지를 추가**해야 하는데, 현재는 소켓 이벤트만 발송하고 있어서 시스템 메시지가 채팅방에 나타나지 않는 문제가 발생하고 있습니다.

## ✅ 서버 측 구현 상태 확인

### 1. API 구현 ✅
- `PATCH /api/v1/chats/{roomId}/store` API 구현 완료
- 방장 권한 검증 ✅
- 가게 정보 업데이트 ✅
- 소켓 이벤트 발송 코드 ✅

### 2. 시스템 메시지 추가 및 소켓 이벤트 발송 코드 ✅
```javascript
// src/services/chat_service.js - selectStore 함수

// 1. 시스템 메시지 생성 및 저장 (기존 패턴과 동일)
const systemMessage = `${userName}님이 ${selectedStoreInfo.store_name}을 모임 장소로 선택하셨습니다.`;

// 2. 시스템 메시지 DB 저장
const [maxIdResult] = await conn.query('SELECT MAX(message_id) as maxId FROM chat_messages WHERE chat_room_id = ?', [room_id]);
const nextMessageId = (maxIdResult[0]?.maxId || 0) + 1;

await conn.query(
  `INSERT INTO chat_messages (message_id, chat_room_id, sender_id, message, created_at)
   VALUES (?, ?, ?, ?, NOW())`,
  [nextMessageId, room_id, 'system', systemMessage]
);

// 3. 가게 선택 이벤트 발송
io.to(room_id.toString()).emit('storeSelected', {
  room_id: parseInt(room_id),
  store_id: selectedStoreInfo.store_id,
  store_name: selectedStoreInfo.store_name,
  // ... 기타 필드들
  action: store_id ? 'selected' : 'deselected'
});

// 4. 시스템 메시지 브로드캐스트
io.to(room_id.toString()).emit('newMessage', {
  message_id: nextMessageId,
  chat_room_id: room_id,
  sender_id: 'system',
  message: systemMessage,
  created_at: new Date(),
  message_type: 'system_store_selected',
  user_name: userName,
  user_id: user_id
});
```

## 🔧 디버깅 개선사항

### 1. 상세 로그 추가 ✅
서버에 다음 로그들이 추가되었습니다:

```javascript
// API 호출 시
console.log('🏪 [API] 가게 선택 요청 시작:', { user_id, roomId, store_id, timestamp });

// 시스템 메시지 생성 시
console.log('💬 [STORE SELECT] 시스템 메시지 생성:', { room_id, message, sender_id: 'system' });
console.log('✅ [STORE SELECT] 시스템 메시지 저장 완료:', { message_id, room_id });

// 소켓 이벤트 발송 시
console.log('🏪 [STORE SELECT] 소켓 이벤트 발송 준비:', { room_id, total_sockets, users });
console.log('🏪 [STORE SELECT] 이벤트 데이터:', eventData);
console.log('✅ [STORE SELECT] 소켓 이벤트 발송 완료:', { room_id, events: ['storeSelected', 'newMessage'], recipients_count });
```

### 2. 소켓 디버깅 리스너 추가 ✅
```javascript
// src/controllers/socket_controller.js
socket.on('storeSelected', (data) => {
  console.log('🏪 [SOCKET DEBUG] 클라이언트에서 storeSelected 이벤트 수신:', {
    socket_id: socket.id,
    user_id: socket.user?.user_id,
    received_data: data,
    timestamp: new Date().toISOString()
  });
});
```

## 🧪 테스트 방법

### 1. 서버 로그 확인
가게 선택 API 호출 시 다음 로그들이 나타나는지 확인:

```bash
# 1. API 호출 로그
🏪 [API] 가게 선택 요청 시작: { user_id: 'test1', roomId: '1', store_id: 'store_123', timestamp: '...' }

# 2. 시스템 메시지 생성 및 저장 로그
💬 [STORE SELECT] 시스템 메시지 생성: { room_id: 1, message: '박태원님이 강남 스포츠바을 모임 장소로 선택하셨습니다.', sender_id: 'system' }
✅ [STORE SELECT] 시스템 메시지 저장 완료: { message_id: 123, room_id: 1 }

# 3. 소켓 이벤트 발송 로그
🏪 [STORE SELECT] 소켓 이벤트 발송 준비: { room_id: 1, total_sockets: 3, users: [...] }
🏪 [STORE SELECT] 이벤트 데이터: { room_id: 1, store_id: 'store_123', ... }
✅ [STORE SELECT] 소켓 이벤트 발송 완료: { room_id: 1, events: ['storeSelected', 'newMessage'], recipients_count: 3 }
```

### 2. 테스트 스크립트 실행
```bash
# test_store_selection.js 파일 실행
node test_store_selection.js
```

### 3. 클라이언트 소켓 연결 확인
클라이언트에서 다음을 확인:

```javascript
// 1. 소켓 연결 상태 확인
console.log('소켓 연결 상태:', socket.connected);

// 2. 채팅방 입장 상태 확인
console.log('현재 입장한 방:', socket.rooms);

// 3. 이벤트 리스너 등록 확인
socket.on('storeSelected', (data) => {
  console.log('🏪 [CLIENT] storeSelected 이벤트 수신:', data);
});

socket.on('newMessage', (data) => {
  console.log('💬 [CLIENT] newMessage 이벤트 수신:', data);
  if (data.sender_id === 'system') {
    console.log('🔔 [CLIENT] 시스템 메시지 수신:', data.message);
  }
});
```

## 🚨 가능한 문제점들

### 1. 소켓 연결 문제
- **증상**: 클라이언트가 소켓에 연결되지 않음
- **확인**: `socket.connected` 상태 확인
- **해결**: 소켓 연결 재시도

### 2. 채팅방 입장 문제
- **증상**: 소켓은 연결되었지만 채팅방에 입장하지 않음
- **확인**: `socket.rooms` 확인
- **해결**: `joinRoom` 이벤트 재발송

### 3. 이벤트 리스너 미등록
- **증상**: 소켓 연결은 되었지만 이벤트를 받지 못함
- **확인**: `storeSelected` 리스너 등록 확인
- **해결**: 이벤트 리스너 재등록

### 4. 서버 소켓 이벤트 발송 실패
- **증상**: API는 성공하지만 소켓 이벤트가 발송되지 않음
- **확인**: 서버 로그에서 "🏪 [STORE SELECT]" 메시지 확인
- **해결**: 소켓 인스턴스 초기화 확인

## 🔍 단계별 디버깅

### Step 1: API 호출 확인
```bash
curl -X PATCH http://localhost:3000/api/v1/chats/1/store \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"store_id": "store_123"}'
```

### Step 2: 서버 로그 확인
```bash
# 서버 콘솔에서 다음 로그 확인
🏪 [API] 가게 선택 요청 시작
🏪 [STORE SELECT] 소켓 이벤트 발송 준비
✅ [STORE SELECT] 소켓 이벤트 발송 완료
```

### Step 3: 클라이언트 소켓 확인
```javascript
// 브라우저 콘솔에서 확인
console.log('소켓 연결:', socket.connected);
console.log('입장한 방:', Array.from(socket.rooms));
```

### Step 4: 이벤트 수신 확인
```javascript
// 클라이언트에서 이벤트 수신 로그 확인
🏪 [CLIENT] storeSelected 이벤트 수신: { room_id: 1, store_name: "강남 스포츠바", ... }
💬 [CLIENT] newMessage 이벤트 수신: { sender_id: "system", message: "박태원님이 강남 스포츠바을 모임 장소로 선택하셨습니다.", ... }
🔔 [CLIENT] 시스템 메시지 수신: 박태원님이 강남 스포츠바을 모임 장소로 선택하셨습니다.
```

## 🛠️ 문제 해결 체크리스트

- [ ] 서버가 실행 중인지 확인
- [ ] 클라이언트가 소켓에 연결되었는지 확인
- [ ] 클라이언트가 해당 채팅방에 입장했는지 확인
- [ ] `storeSelected` 이벤트 리스너가 등록되었는지 확인
- [ ] `newMessage` 이벤트 리스너가 등록되었는지 확인
- [ ] API 호출 시 서버 로그에서 시스템 메시지 저장 로그 확인
- [ ] API 호출 시 서버 로그에서 소켓 이벤트 발송 로그 확인
- [ ] 클라이언트에서 `storeSelected` 이벤트 수신 로그 확인
- [ ] 클라이언트에서 `newMessage` 이벤트 수신 로그 확인
- [ ] 채팅방에 시스템 메시지가 실제로 표시되는지 확인

## 📞 추가 지원

문제가 지속되는 경우 다음 정보를 제공해주세요:

1. **서버 로그**: 가게 선택 API 호출 시의 전체 로그
2. **클라이언트 로그**: 소켓 연결 및 이벤트 수신 관련 로그
3. **네트워크 탭**: API 호출 및 소켓 연결 상태
4. **브라우저 콘솔**: JavaScript 오류 메시지

이 정보를 바탕으로 더 정확한 문제 진단이 가능합니다! 🔧
