# 🚪 채팅방 나가기 = 모임 탈퇴 기능 업데이트 완료

## 📋 개요
클라이언트 요청에 따라 "채팅방 나가기" 기능을 "모임 완전 탈퇴" 기능으로 확장했습니다. 이제 사용자가 채팅방을 나가면 해당 모임에서도 완전히 제외되며, 방장 권한 이양, 실시간 알림, 트랜잭션 처리가 모두 포함됩니다.

---

## ✅ 서버 구현 완료 사항

### 🎯 **방장 나가기 정책 (자동 권한 이양)**
- **다른 참여자가 있는 경우**: 가장 먼저 가입한 참여자에게 자동 권한 이양
- **마지막 참여자인 경우**: 모임 자동 해산 (상태: 완료)
- **트랜잭션 보장**: 모든 작업이 원자성으로 처리

### 📊 **처리 프로세스**
1. **권한 및 참여자 확인**
2. **방장인 경우 권한 이양/모임 해산**
3. **채팅방에서 사용자 제거**
4. **모임 참여자 수 감소**
5. **모임 상태 자동 업데이트**
6. **시스템 메시지 생성**
7. **실시간 알림 전송**

---

## 🔄 **API 변경 사항**

### **기존 API**: `DELETE /api/v1/chats/:roomId/leave`

**🆕 새로운 응답 구조:**
```json
{
  "success": true,
  "message": "모임을 나갔습니다.",  // 또는 권한 이양/해산 메시지
  "data": {
    "roomId": 456,
    "left_at": "2024-01-15T10:30:00Z",
    "reservation_id": 456,
    "remaining_participants": 3,
    "is_host_left": false,
    "new_host_id": null,
    "meeting_status": 0
  }
}
```

**방장이 나간 경우 응답:**
```json
{
  "success": true,
  "message": "모임을 나가고 방장 권한이 이양되었습니다.",
  "data": {
    "roomId": 456,
    "left_at": "2024-01-15T10:30:00Z",
    "reservation_id": 456,
    "remaining_participants": 2,
    "is_host_left": true,
    "new_host_id": "user456",
    "meeting_status": 0
  }
}
```

**마지막 참여자(방장)가 나간 경우:**
```json
{
  "success": true,
  "message": "모임을 나가고 모임이 해산되었습니다.",
  "data": {
    "roomId": 456,
    "left_at": "2024-01-15T10:30:00Z",
    "reservation_id": 456,
    "remaining_participants": 0,
    "is_host_left": true,
    "new_host_id": null,
    "meeting_status": 3
  }
}
```

---

## 🔥 **새로운 실시간 소켓 이벤트**

### 1. **사용자 퇴장 이벤트**: `userLeftRoom`
```javascript
socket.on('userLeftRoom', (data) => {
  // {
  //   "room_id": 456,
  //   "user_id": "user123",
  //   "user_name": "김철수",
  //   "left_at": "2024-01-15T10:30:00Z",
  //   "remaining_participants": 3,
  //   "is_host_left": false,
  //   "new_host_id": null,
  //   "meeting_status": 0
  // }
});
```

### 2. **방장 권한 이양 이벤트**: `hostTransferred`
```javascript
socket.on('hostTransferred', (data) => {
  // {
  //   "room_id": 456,
  //   "previous_host": "user123",
  //   "new_host": "user456",
  //   "transferred_at": "2024-01-15T10:30:00Z"
  // }
});
```

### 3. **기존 시스템 메시지**: `newMessage` (system_leave)
```javascript
socket.on('newMessage', (message) => {
  if (message.message_type === 'system_leave') {
    // "김철수님이 모임을 나가셨습니다. 방장 권한이 이영희님에게 이양되었습니다."
  }
});
```

---

## 🎯 **클라이언트 개발 가이드**

### 1. **TypeScript 인터페이스 업데이트**

```typescript
// 채팅방 나가기 응답
interface LeaveChatRoomResponse {
  success: boolean;
  message: string;
  data: {
    roomId: number;
    left_at: string;
    reservation_id: number;
    remaining_participants: number;
    is_host_left: boolean;
    new_host_id: string | null;
    meeting_status: number;
  };
}

// 사용자 퇴장 소켓 이벤트
interface UserLeftRoomEvent {
  room_id: number;
  user_id: string;
  user_name: string;
  left_at: string;
  remaining_participants: number;
  is_host_left: boolean;
  new_host_id: string | null;
  meeting_status: number;
}

// 방장 권한 이양 소켓 이벤트
interface HostTransferredEvent {
  room_id: number;
  previous_host: string;
  new_host: string;
  transferred_at: string;
}
```

### 2. **API 호출 함수 업데이트**

```typescript
// 채팅방 나가기 (모임 탈퇴)
async function leaveChatRoom(roomId: number): Promise<LeaveChatRoomResponse> {
  const response = await fetch(`/api/v1/chats/${roomId}/leave`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  
  if (!result.success) {
    if (response.status === 400) {
      throw new Error('이미 나간 모임이거나 참여하지 않은 모임입니다.');
    }
    throw new Error(result.message);
  }
  
  return result;
}

// 사용 예시
async function handleLeaveChatRoom(roomId: number) {
  try {
    const result = await leaveChatRoom(roomId);
    
    // 메시지 표시
    if (result.data.is_host_left) {
      if (result.data.new_host_id) {
        showSuccessToast('방장 권한이 이양되고 모임을 나갔습니다.');
      } else {
        showSuccessToast('모임이 해산되었습니다.');
      }
    } else {
      showSuccessToast('모임을 나갔습니다.');
    }
    
    // 화면 이동
    navigation.goBack();
    
    // 채팅방 목록 갱신
    queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    
  } catch (error) {
    showErrorToast(error.message);
  }
}
```

### 3. **소켓 이벤트 리스너 추가**

```typescript
// 소켓 이벤트 리스너 설정
function setupChatSocketListeners(socket: Socket) {
  // 사용자 퇴장 이벤트
  socket.on('userLeftRoom', (data: UserLeftRoomEvent) => {
    console.log('사용자가 모임을 나갔습니다:', data);
    
    // 참여자 목록 업데이트
    updateParticipantList(data.room_id, data.remaining_participants);
    
    // 토스트 알림
    if (data.user_id !== currentUserId) {
      showInfoToast(`${data.user_name}님이 모임을 나가셨습니다.`);
    }
    
    // 방장이 나간 경우 추가 처리
    if (data.is_host_left && data.new_host_id) {
      updateHostInfo(data.room_id, data.new_host_id);
    }
    
    // 모임 상태 업데이트
    updateMeetingStatus(data.room_id, data.meeting_status);
  });
  
  // 방장 권한 이양 이벤트
  socket.on('hostTransferred', (data: HostTransferredEvent) => {
    console.log('방장 권한이 이양되었습니다:', data);
    
    // 현재 사용자가 새 방장인 경우
    if (data.new_host === currentUserId) {
      showSuccessToast('방장 권한이 이양되었습니다!');
      // 방장 UI 활성화
      enableHostFeatures();
    }
    
    // 방장 정보 업데이트
    updateHostInfo(data.room_id, data.new_host);
  });
  
  // 기존 시스템 메시지 처리
  socket.on('newMessage', (message) => {
    if (message.message_type === 'system_leave') {
      // 시스템 메시지 UI 업데이트
      addSystemMessage(message);
    }
  });
}
```

### 4. **UI 처리 권장사항**

```typescript
// 채팅방 나가기 확인 다이얼로그
function showLeaveChatRoomConfirm(chatRoom: ChatRoom, isHost: boolean) {
  const confirmMessage = isHost 
    ? '모임을 나가면 다른 참여자에게 방장 권한이 이양됩니다. 정말 나가시겠습니까?'
    : '모임을 나가시겠습니까? 나가면 다시 참여하려면 새로 신청해야 합니다.';
    
  showConfirmDialog({
    title: '모임 나가기',
    message: confirmMessage,
    confirmText: '나가기',
    cancelText: '취소',
    onConfirm: () => handleLeaveChatRoom(chatRoom.chat_room_id)
  });
}

// 참여자 목록 업데이트
function updateParticipantList(roomId: number, newCount: number) {
  // 참여자 수 업데이트
  setParticipantCount(newCount);
  
  // 참여자 목록 갱신
  queryClient.invalidateQueries({ 
    queryKey: ['chatParticipants', roomId] 
  });
}

// 방장 정보 업데이트
function updateHostInfo(roomId: number, newHostId: string) {
  // 방장 정보 캐시 업데이트
  queryClient.setQueryData(['chatRoom', roomId], (oldData: any) => ({
    ...oldData,
    host_id: newHostId,
    is_host: newHostId === currentUserId
  }));
  
  // 방장 UI 업데이트
  if (newHostId === currentUserId) {
    enableHostFeatures();
  } else {
    disableHostFeatures();
  }
}

// 모임 상태 업데이트
function updateMeetingStatus(roomId: number, newStatus: number) {
  const statusMessages = {
    0: '모집 중',
    1: '모집 마감',
    2: '진행 중',
    3: '완료/해산'
  };
  
  // 상태 표시 업데이트
  setMeetingStatus(newStatus);
  setMeetingStatusText(statusMessages[newStatus]);
  
  // 해산된 경우 추가 처리
  if (newStatus === 3) {
    showInfoToast('모임이 해산되었습니다.');
    // 필요시 화면 이동
  }
}
```

### 5. **에러 처리 강화**

```typescript
// 에러 처리 함수
function handleLeaveChatRoomError(error: Error) {
  if (error.message.includes('이미 나간 모임')) {
    showErrorToast('이미 나간 모임입니다.');
    // 채팅방 목록으로 이동
    navigation.navigate('ChatList');
    return;
  }
  
  if (error.message.includes('존재하지 않는')) {
    showErrorToast('존재하지 않는 모임입니다.');
    navigation.navigate('ChatList');
    return;
  }
  
  // 기타 에러
  showErrorToast('모임 나가기 중 오류가 발생했습니다.');
}

// API 호출 시 에러 처리
async function leaveChatRoomWithErrorHandling(roomId: number) {
  try {
    const result = await leaveChatRoom(roomId);
    // 성공 처리
    handleLeaveChatRoomSuccess(result);
  } catch (error) {
    handleLeaveChatRoomError(error as Error);
  }
}
```

---

## 🔍 **테스트 시나리오**

### 1. **일반 참여자 나가기**
```
1. 일반 참여자가 채팅방 나가기 실행
2. 서버: 채팅방 + 모임에서 제거, 참여자 수 감소
3. 실시간: userLeftRoom 이벤트 전송
4. 클라이언트: "모임을 나갔습니다" 메시지 + 화면 이동
```

### 2. **방장 나가기 (권한 이양)**
```
1. 방장이 채팅방 나가기 실행
2. 서버: 다음 참여자에게 권한 이양 + 제거 처리
3. 실시간: userLeftRoom + hostTransferred 이벤트 전송
4. 클라이언트: "방장 권한이 이양되고 모임을 나갔습니다" + 새 방장 UI 활성화
```

### 3. **마지막 참여자(방장) 나가기**
```
1. 마지막 참여자인 방장이 나가기 실행
2. 서버: 모임 해산 처리 (상태: 완료)
3. 실시간: userLeftRoom 이벤트 (meeting_status: 3)
4. 클라이언트: "모임이 해산되었습니다" + 목록으로 이동
```

### 4. **동시 나가기 상황**
```
1. 여러 참여자가 동시에 나가기 시도
2. 서버: 트랜잭션으로 순차 처리
3. 클라이언트: 각각의 결과에 따른 적절한 처리
```

---

## 🚨 **중요 변경사항**

### **1. 기능 변경**
- ❌ **기존**: 단순 채팅방 나가기
- ✅ **신규**: 채팅방 + 모임 완전 탈퇴

### **2. 방장 정책**
- ✅ **자동 권한 이양**: 가입 순서대로 다음 참여자에게
- ✅ **모임 해산**: 마지막 참여자가 나가면 자동 해산
- ✅ **트랜잭션 보장**: 모든 작업 원자성 처리

### **3. 실시간 알림**
- ✅ **userLeftRoom**: 사용자 퇴장 상세 정보
- ✅ **hostTransferred**: 방장 권한 이양 알림
- ✅ **system_leave**: 시스템 메시지

### **4. 응답 데이터**
- ✅ **상세 정보**: 남은 참여자 수, 방장 변경 여부, 모임 상태
- ✅ **조건부 메시지**: 상황에 따른 적절한 안내 메시지

---

## 📋 **클라이언트 체크리스트**

### **즉시 적용 필요**
- [ ] `LeaveChatRoomResponse` 인터페이스 업데이트
- [ ] `userLeftRoom` 소켓 이벤트 리스너 추가
- [ ] `hostTransferred` 소켓 이벤트 리스너 추가
- [ ] 응답 데이터 활용하여 UI 업데이트

### **권장 개선사항**
- [ ] 방장 나가기 시 확인 다이얼로그 강화
- [ ] 권한 이양 시 새 방장 UI 자동 활성화
- [ ] 모임 해산 시 적절한 안내 및 화면 이동
- [ ] 에러 상황별 세분화된 처리

### **테스트 확인사항**
- [ ] 일반 참여자 나가기 정상 동작
- [ ] 방장 나가기 시 권한 이양 확인
- [ ] 마지막 참여자 나가기 시 해산 확인
- [ ] 실시간 알림 정상 수신 확인

---

## 📞 **문의사항**

구현 중 문제가 발생하거나 추가 기능이 필요한 경우 언제든 연락주세요!

**업데이트 완료일**: 2024년 1월 15일  
**담당자**: 백엔드 개발팀  
**버전**: v3.0 (완전 탈퇴 시스템)
