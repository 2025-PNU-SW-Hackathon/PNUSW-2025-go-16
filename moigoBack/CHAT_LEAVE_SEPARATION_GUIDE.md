# 🚪 채팅방 나가기 기능 구분 가이드

## 📋 개요
채팅방에서 "나가기"는 두 가지 다른 의미를 가집니다:
1. **임시 나가기**: 채팅방 화면에서 홈으로 이동 (모임 참여 상태 유지)
2. **영구 나가기**: 모임에서 완전 탈퇴 (다시 참여하려면 새로 신청)

---

## 🔄 **기능 구분**

### 1️⃣ **임시 나가기 (화면 이동)**
**사용 목적**: 채팅방 화면에서 다른 화면으로 이동
**구현 방법**: 소켓 이벤트 `leaveRoom`
**서버 처리**: 소켓 연결만 해제, 데이터베이스 변경 없음
**사용자 상태**: 모임 참여 상태 유지

```javascript
// 클라이언트
socket.emit('leaveRoom', roomId);

// 서버 (socket_controller.js)
socket.on('leaveRoom', (room_id) => {
  socket.leave(room_id);  // 소켓 룸에서만 제거
  socket.emit('leaveRoomSuccess', { success: true });
});
```

### 2️⃣ **영구 나가기 (모임 탈퇴)**
**사용 목적**: 모임에서 완전히 탈퇴
**구현 방법**: HTTP API `DELETE /chats/:roomId/leave`
**서버 처리**: 데이터베이스에서 완전 제거, 방장 권한 이양 등
**사용자 상태**: 모임에서 완전 제외

```javascript
// 클라이언트
await fetch(`/api/v1/chats/${roomId}/leave`, { method: 'DELETE' });

// 서버 (chat_controller.js)
exports.leaveChatRoom = async (req, res, next) => {
  // 데이터베이스에서 완전 제거
  // 방장 권한 이양 처리
  // 실시간 알림 전송
};
```

---

## 🎨 **클라이언트 UI 구분**

### **임시 나가기 UI**
```typescript
// 뒤로가기 버튼 (헤더)
<TouchableOpacity onPress={() => handleTemporaryLeave()}>
  <Icon name="arrow-left" />
</TouchableOpacity>

// 홈 버튼
<TouchableOpacity onPress={() => navigation.navigate('Home')}>
  <Icon name="home" />
</TouchableOpacity>

function handleTemporaryLeave() {
  // 소켓 룸에서 나가기 (임시)
  socketManager.leaveRoom(roomId);
  
  // 화면 이동
  navigation.goBack();
  // 또는 navigation.navigate('Home');
}
```

### **영구 나가기 UI**
```typescript
// 메뉴 또는 설정에서 "모임 나가기" 버튼
<TouchableOpacity onPress={() => showLeaveConfirmDialog()}>
  <Text style={{ color: 'red' }}>모임 나가기</Text>
</TouchableOpacity>

function showLeaveConfirmDialog() {
  Alert.alert(
    '모임 나가기',
    '정말로 이 모임을 나가시겠습니까?\n나가면 다시 참여하려면 새로 신청해야 합니다.',
    [
      { text: '취소', style: 'cancel' },
      { 
        text: '나가기', 
        style: 'destructive',
        onPress: () => handlePermanentLeave()
      }
    ]
  );
}

async function handlePermanentLeave() {
  try {
    // HTTP API로 영구 나가기
    await leaveChatRoomPermanently(roomId);
    
    // 성공 메시지
    showSuccessToast('모임을 나갔습니다.');
    
    // 채팅방 목록으로 이동
    navigation.navigate('ChatList');
    
    // 목록 갱신
    queryClient.invalidateQueries(['chatRooms']);
    
  } catch (error) {
    showErrorToast('모임 나가기에 실패했습니다.');
  }
}
```

---

## 🔧 **서버 구현 현황**

### ✅ **임시 나가기 (이미 구현됨)**
**위치**: `src/controllers/socket_controller.js`
**소켓 이벤트**: `leaveRoom`
**처리**: 소켓 룸에서만 제거, 데이터베이스 변경 없음

```javascript
socket.on('leaveRoom', async (room_id) => {
  // 소켓 룸에서 나가기
  socket.leave(room_id);
  
  // 성공 응답
  socket.emit('leaveRoomSuccess', {
    success: true,
    room_id: room_id,
    message: '채팅방에서 나갔습니다.'
  });
  
  // 다른 사용자들에게 일시적 퇴장 알림
  socket.to(room_id).emit('userLeft', {
    user_id: socket.user.user_id,
    user_name: socket.user.user_name,
    timestamp: new Date().toISOString()
  });
});
```

### ✅ **영구 나가기 (이미 구현됨)**
**위치**: `src/controllers/chat_controller.js`, `src/services/chat_service.js`
**HTTP API**: `DELETE /chats/:roomId/leave`
**처리**: 완전한 모임 탈퇴, 방장 권한 이양, 실시간 알림

---

## 🎯 **클라이언트 권장 구현**

### **1. 소켓 이벤트 분리**

```typescript
class SocketManager {
  // 임시 나가기 (화면 이동 시)
  temporaryLeaveRoom(roomId: number) {
    this.socket.emit('leaveRoom', roomId);
  }
  
  // 영구 나가기는 HTTP API 사용
  // (소켓 이벤트 아님)
}
```

### **2. API 함수 분리**

```typescript
// 임시 나가기 (소켓)
function temporaryLeaveChatRoom(roomId: number) {
  socketManager.temporaryLeaveRoom(roomId);
}

// 영구 나가기 (HTTP API)
async function permanentLeaveChatRoom(roomId: number) {
  const response = await fetch(`/api/v1/chats/${roomId}/leave`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
}
```

### **3. 화면별 사용법**

```typescript
// 채팅방 화면에서 뒤로가기 버튼
function ChatRoomScreen() {
  const handleBackPress = () => {
    // 임시 나가기 (소켓)
    temporaryLeaveChatRoom(roomId);
    navigation.goBack();
  };
  
  const handleMenuLeave = () => {
    // 영구 나가기 확인 다이얼로그
    showLeaveConfirmDialog();
  };
  
  return (
    <View>
      {/* 헤더의 뒤로가기 버튼 */}
      <TouchableOpacity onPress={handleBackPress}>
        <Icon name="arrow-left" />
      </TouchableOpacity>
      
      {/* 메뉴의 모임 나가기 버튼 */}
      <TouchableOpacity onPress={handleMenuLeave}>
        <Text style={{ color: 'red' }}>모임 나가기</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### **4. 소켓 이벤트 리스너**

```typescript
function setupSocketListeners() {
  // 임시 퇴장 알림 (다른 사용자가 화면에서 나갔을 때)
  socket.on('userLeft', (data) => {
    // 단순히 "화면에서 나갔습니다" 정도의 가벼운 표시
    // 또는 아무 표시 안 함 (너무 빈번할 수 있음)
  });
  
  // 영구 퇴장 알림 (다른 사용자가 모임을 나갔을 때)
  socket.on('userLeftRoom', (data) => {
    // "김철수님이 모임을 나가셨습니다" 중요한 알림
    showImportantNotification(`${data.user_name}님이 모임을 나가셨습니다.`);
    updateParticipantList(data.remaining_participants);
  });
}
```

---

## 🚨 **중요 구분 사항**

### **임시 나가기 (소켓 `leaveRoom`)**
- 🔹 **목적**: 화면 전환, 앱 백그라운드 이동
- 🔹 **데이터**: 변경 없음
- 🔹 **복귀**: 언제든 다시 입장 가능
- 🔹 **알림**: 가벼운 알림 (선택적)
- 🔹 **UI**: 뒤로가기, 홈 버튼

### **영구 나가기 (HTTP API `DELETE`)**
- 🔸 **목적**: 모임 완전 탈퇴
- 🔸 **데이터**: 데이터베이스에서 제거
- 🔸 **복귀**: 새로 신청해야 함
- 🔸 **알림**: 중요한 알림 (필수)
- 🔸 **UI**: 명확한 "모임 나가기" 버튼

---

## 📱 **사용자 경험 시나리오**

### **시나리오 1: 일반적인 화면 이동**
1. 사용자가 채팅방에서 뒤로가기 버튼 클릭
2. 소켓 `leaveRoom` 이벤트 전송
3. 홈 화면으로 이동
4. 나중에 채팅방 목록에서 다시 입장 가능

### **시나리오 2: 모임 완전 탈퇴**
1. 사용자가 메뉴에서 "모임 나가기" 클릭
2. 확인 다이얼로그 표시
3. 확인 후 HTTP API `DELETE` 요청
4. 서버에서 완전 제거 처리
5. 채팅방 목록에서 해당 모임 사라짐

---

## 📋 **체크리스트**

### **클라이언트 구현 확인사항**
- [ ] 임시 나가기와 영구 나가기 UI 분리
- [ ] 뒤로가기는 소켓 `leaveRoom` 사용
- [ ] 모임 나가기는 HTTP API 사용
- [ ] 영구 나가기 시 확인 다이얼로그 표시
- [ ] 소켓 이벤트 리스너 적절히 구분

### **서버 확인사항**
- [ ] 소켓 `leaveRoom`: 단순 룸 해제 (✅ 구현됨)
- [ ] HTTP `DELETE`: 완전 탈퇴 처리 (✅ 구현됨)
- [ ] 두 기능의 응답 메시지 명확히 구분

---

## 🎉 **결론**

**현재 서버는 이미 두 기능이 모두 구현되어 있습니다!**
- ✅ 임시 나가기: 소켓 `leaveRoom`
- ✅ 영구 나가기: HTTP API `DELETE /chats/:roomId/leave`

클라이언트에서는 이 두 기능을 UI와 사용 시나리오에 맞게 적절히 구분해서 사용하시면 됩니다.

