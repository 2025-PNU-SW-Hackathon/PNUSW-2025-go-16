# 👥 채팅방 참여자 관리 API 구현 완료

## 📋 개요
클라이언트의 "참여자 관리" 기능 요청에 따라 채팅방 참여자 목록 조회 및 강퇴 API를 구현했습니다. 방장 권한 체크, 실시간 알림, 상세한 응답 데이터를 모두 포함합니다.

---

## ✅ 구현 완료된 API

### 1️⃣ **참여자 목록 조회 API**
**엔드포인트**: `GET /api/v1/chats/{roomId}/participants`
**권한**: 채팅방 참여자만 조회 가능
**인증**: JWT 토큰 필요

#### **성공 응답**
```json
{
  "success": true,
  "message": "참여자 목록 조회 성공",
  "data": {
    "room_id": 123,
    "total_participants": 4,
    "participants": [
      {
        "user_id": "host123",
        "name": "김철수",
        "email": "kim@example.com",
        "profile_image": "https://example.com/profile1.jpg",
        "joined_at": "2024-01-15T10:30:00.000Z",
        "is_host": true,
        "role": "방장",
        "is_online": false,
        "last_seen": null
      },
      {
        "user_id": "user456",
        "name": "이영희",
        "email": "lee@example.com",
        "profile_image": null,
        "joined_at": "2024-01-15T11:00:00.000Z",
        "is_host": false,
        "role": "참가자",
        "is_online": false,
        "last_seen": null
      }
    ]
  }
}
```

#### **에러 응답**
```json
// 403 - 권한 없음
{
  "success": false,
  "message": "채팅방에 참여하지 않았거나 접근 권한이 없습니다."
}

// 404 - 채팅방 없음
{
  "success": false,
  "message": "존재하지 않는 모임입니다."
}
```

### 2️⃣ **참여자 강퇴 API (새로운 엔드포인트)**
**엔드포인트**: `DELETE /api/v1/chats/{roomId}/participants/{userId}`
**권한**: 방장만 사용 가능
**인증**: JWT 토큰 필요

#### **요청 본문 (선택사항)**
```json
{
  "reason": "부적절한 행동"
}
```

#### **성공 응답**
```json
{
  "success": true,
  "message": "참여자가 강퇴되었습니다",
  "data": {
    "kicked_user_id": "user456",
    "kicked_user_name": "이영희",
    "remaining_participants": 3,
    "kicked_at": "2024-01-15T16:00:00.000Z",
    "reason": "부적절한 행동"
  }
}
```

#### **에러 응답**
```json
// 403 - 방장 권한 없음
{
  "success": false,
  "message": "권한이 없습니다. 방장만 참여자를 강퇴할 수 있습니다."
}

// 404 - 강퇴할 사용자 없음
{
  "success": false,
  "message": "강퇴할 사용자를 찾을 수 없습니다."
}
```

### 3️⃣ **기존 강퇴 API (호환성 유지)**
**엔드포인트**: `DELETE /api/v1/chats/{roomId}/kick/{userId}`
기존 클라이언트 코드와의 호환성을 위해 유지됩니다.

---

## 🔥 **새로운 실시간 소켓 이벤트**

### **참여자 강퇴 이벤트**: `participantKicked`
```javascript
socket.on('participantKicked', (data) => {
  console.log('참여자가 강퇴되었습니다:', data);
  // {
  //   "room_id": 123,
  //   "kicked_user_id": "user456",
  //   "kicked_user_name": "이영희",
  //   "kicked_by": "host123",
  //   "remaining_participants": 3,
  //   "timestamp": "2024-01-15T16:00:00.000Z"
  // }
});
```

### **기존 시스템 메시지**: `newMessage` (system_kick)
강퇴 시 채팅방에 시스템 메시지도 함께 전송됩니다.

---

## 🎯 **클라이언트 개발 가이드**

### **1. TypeScript 인터페이스**

```typescript
// 참여자 목록 조회 응답
interface ChatParticipantsResponseDTO {
  success: boolean;
  message: string;
  data: {
    room_id: number;
    total_participants: number;
    participants: ParticipantDTO[];
  };
}

interface ParticipantDTO {
  user_id: string;
  name: string;
  email?: string;
  profile_image?: string;
  joined_at: string;
  is_host: boolean;
  role: string;
  is_online: boolean;
  last_seen?: string;
}

// 참여자 강퇴 응답
interface KickParticipantResponseDTO {
  success: boolean;
  message: string;
  data: {
    kicked_user_id: string;
    kicked_user_name: string;
    remaining_participants: number;
    kicked_at: string;
    reason?: string;
  };
}

// 강퇴 소켓 이벤트
interface ParticipantKickedEvent {
  room_id: number;
  kicked_user_id: string;
  kicked_user_name: string;
  kicked_by: string;
  remaining_participants: number;
  timestamp: string;
}
```

### **2. API 호출 함수**

```typescript
// 참여자 목록 조회
async function getChatParticipants(roomId: number): Promise<ChatParticipantsResponseDTO> {
  const response = await apiClient.get<ChatParticipantsResponseDTO>(
    `/api/v1/chats/${roomId}/participants`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

// 참여자 강퇴 (방장 전용)
async function kickParticipant(
  roomId: number, 
  userId: string, 
  reason?: string
): Promise<KickParticipantResponseDTO> {
  const response = await apiClient.delete<KickParticipantResponseDTO>(
    `/api/v1/chats/${roomId}/participants/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: reason ? { reason } : {}
    }
  );
  
  return response.data;
}
```

### **3. 실제 사용 예시**

```typescript
// 참여자 관리 컴포넌트
function ParticipantManagementScreen({ roomId }: { roomId: number }) {
  const [participants, setParticipants] = useState<ParticipantDTO[]>([]);
  const [isHost, setIsHost] = useState(false);
  
  // 참여자 목록 불러오기
  useEffect(() => {
    async function loadParticipants() {
      try {
        const response = await getChatParticipants(roomId);
        setParticipants(response.data.participants);
        
        // 현재 사용자가 방장인지 확인
        const currentUser = response.data.participants.find(
          p => p.user_id === currentUserId
        );
        setIsHost(currentUser?.is_host || false);
        
      } catch (error) {
        showErrorToast('참여자 목록을 불러올 수 없습니다.');
      }
    }
    
    loadParticipants();
  }, [roomId]);
  
  // 참여자 강퇴
  const handleKickParticipant = async (userId: string, userName: string) => {
    try {
      // 확인 다이얼로그
      const confirmed = await showConfirmDialog({
        title: '참여자 강퇴',
        message: `${userName}님을 정말 강퇴하시겠습니까?`,
        confirmText: '강퇴',
        cancelText: '취소'
      });
      
      if (!confirmed) return;
      
      // 강퇴 API 호출
      await kickParticipant(roomId, userId, '관리자 권한으로 강퇴');
      
      // 성공 메시지
      showSuccessToast(`${userName}님이 강퇴되었습니다.`);
      
      // 참여자 목록 갱신
      const response = await getChatParticipants(roomId);
      setParticipants(response.data.participants);
      
    } catch (error) {
      if (error.message.includes('권한이 없습니다')) {
        showErrorToast('방장만 참여자를 강퇴할 수 있습니다.');
      } else {
        showErrorToast('강퇴 처리 중 오류가 발생했습니다.');
      }
    }
  };
  
  return (
    <View>
      <Text>참여자 목록 ({participants.length}명)</Text>
      
      {participants.map((participant) => (
        <View key={participant.user_id} style={styles.participantItem}>
          {/* 프로필 이미지 */}
          <Image 
            source={{ uri: participant.profile_image || defaultAvatar }} 
            style={styles.avatar}
          />
          
          {/* 사용자 정보 */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {participant.name}
              {participant.is_host && <Text style={styles.hostBadge}> 👑 방장</Text>}
            </Text>
            <Text style={styles.joinedAt}>
              참여: {formatDate(participant.joined_at)}
            </Text>
          </View>
          
          {/* 강퇴 버튼 (방장만, 자신은 제외) */}
          {isHost && !participant.is_host && participant.user_id !== currentUserId && (
            <TouchableOpacity
              style={styles.kickButton}
              onPress={() => handleKickParticipant(participant.user_id, participant.name)}
            >
              <Text style={styles.kickButtonText}>강퇴</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}
```

### **4. 소켓 이벤트 처리**

```typescript
// 소켓 이벤트 리스너 설정
function setupParticipantSocketListeners(socket: Socket) {
  // 참여자 강퇴 이벤트
  socket.on('participantKicked', (data: ParticipantKickedEvent) => {
    console.log('참여자 강퇴 이벤트 수신:', data);
    
    // 강퇴된 사용자가 본인인 경우
    if (data.kicked_user_id === currentUserId) {
      showErrorToast('방장에 의해 모임에서 강퇴되었습니다.');
      // 채팅방 목록으로 이동
      navigation.navigate('ChatList');
      return;
    }
    
    // 다른 참여자가 강퇴된 경우
    showInfoToast(`${data.kicked_user_name}님이 강퇴되었습니다.`);
    
    // 참여자 목록 갱신
    queryClient.invalidateQueries(['chatParticipants', data.room_id]);
    
    // 참여자 수 업데이트
    updateParticipantCount(data.remaining_participants);
  });
  
  // 기존 시스템 메시지 처리
  socket.on('newMessage', (message) => {
    if (message.message_type === 'system_kick') {
      // 강퇴 시스템 메시지 처리
      addSystemMessage(message);
    }
  });
}
```

### **5. 에러 처리**

```typescript
// 에러 처리 함수
function handleParticipantApiError(error: any) {
  if (error.response?.status === 403) {
    if (error.response.data.message.includes('참여하지 않았거나')) {
      showErrorToast('채팅방에 접근할 권한이 없습니다.');
      navigation.goBack();
    } else if (error.response.data.message.includes('방장만')) {
      showErrorToast('방장만 이 기능을 사용할 수 있습니다.');
    }
    return;
  }
  
  if (error.response?.status === 404) {
    if (error.response.data.message.includes('존재하지 않는')) {
      showErrorToast('존재하지 않는 모임입니다.');
      navigation.goBack();
    } else if (error.response.data.message.includes('찾을 수 없습니다')) {
      showErrorToast('강퇴할 사용자를 찾을 수 없습니다.');
    }
    return;
  }
  
  // 기타 에러
  showErrorToast('요청 처리 중 오류가 발생했습니다.');
}

// API 호출 시 에러 처리 적용
async function getChatParticipantsWithErrorHandling(roomId: number) {
  try {
    return await getChatParticipants(roomId);
  } catch (error) {
    handleParticipantApiError(error);
    throw error;
  }
}
```

---

## 🔍 **데이터베이스 정보**

### **참여자 정보 구조**
- **chat_room_users**: 채팅방 참여자 (is_kicked으로 강퇴 여부 관리)
- **user_table**: 사용자 기본 정보 (이름, 이메일, 프로필 이미지)
- **reservation_table**: 모임 정보 (방장 정보, 참여자 수)

### **조회 순서**
1. **방장 먼저**: 방장이 목록 맨 위에 표시
2. **가입 순서**: 일반 참여자는 가입 순서대로 정렬

### **프로필 이미지**
- `user_table.user_thumbnail` 필드에서 조회
- 없는 경우 `null` 반환 (클라이언트에서 기본 이미지 처리)

### **온라인 상태**
- 현재는 `false`로 고정
- 추후 소켓 연결 상태를 활용하여 실시간 업데이트 가능

---

## 📋 **클라이언트 체크리스트**

### **즉시 구현 필요**
- [ ] `getChatParticipants` API 호출 함수 구현
- [ ] `kickParticipant` API 호출 함수 구현
- [ ] 참여자 목록 UI 컴포넌트 구현
- [ ] `participantKicked` 소켓 이벤트 리스너 추가

### **권한 체크 구현**
- [ ] 방장만 강퇴 버튼 표시
- [ ] 방장 본인은 강퇴 불가
- [ ] 참여자 목록 조회 권한 확인

### **사용자 경험 개선**
- [ ] 강퇴 확인 다이얼로그 구현
- [ ] 강퇴 시 적절한 안내 메시지
- [ ] 강퇴된 본인에게 화면 이동 처리
- [ ] 참여자 수 실시간 업데이트

### **에러 처리**
- [ ] 권한 없음 에러 처리
- [ ] 네트워크 에러 처리
- [ ] 사용자 친화적 에러 메시지

---

## 🚨 **중요 사항**

### **보안**
- ✅ JWT 인증 필수
- ✅ 방장 권한 서버에서 체크
- ✅ 강퇴된 사용자는 목록에서 제외

### **실시간 업데이트**
- ✅ 강퇴 시 즉시 소켓 이벤트 전송
- ✅ 시스템 메시지와 별도 이벤트 제공
- ✅ 참여자 수 실시간 반영

### **호환성**
- ✅ 기존 강퇴 API 유지 (`/kick/` 엔드포인트)
- ✅ 새로운 참여자 전용 API 추가 (`/participants/` 엔드포인트)

---

## 📞 **문의사항**

추가 기능이나 수정이 필요한 경우 언제든 연락주세요!

**구현 완료일**: 2024년 1월 15일  
**담당자**: 백엔드 개발팀  
**버전**: v4.0 (참여자 관리 시스템)

---

## 🎉 **구현 완료 요약**

1. ✅ **참여자 목록 조회 API**: 상세한 참여자 정보 제공
2. ✅ **참여자 강퇴 API**: 방장 전용, 자세한 응답 데이터
3. ✅ **실시간 소켓 이벤트**: `participantKicked` 이벤트 추가
4. ✅ **권한 체크**: 서버에서 완벽한 권한 검증
5. ✅ **에러 처리**: 상황별 세분화된 에러 메시지
6. ✅ **호환성**: 기존 API 유지하며 새 기능 추가

**이제 완전한 참여자 관리 시스템을 사용하실 수 있습니다!** 🚀
