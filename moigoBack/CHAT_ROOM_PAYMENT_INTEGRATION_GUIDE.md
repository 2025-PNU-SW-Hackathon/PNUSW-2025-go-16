# 🏪 채팅방 정산 정보 통합 가이드

## 📋 개요
채팅방 입장 및 목록 조회 시 정산 상태 정보를 함께 제공하여, 클라이언트에서 즉시 정산 UI를 표시할 수 있도록 개선된 API 가이드입니다.

## 🆕 업데이트된 API

### 1. 채팅방 입장 API
**엔드포인트**: `POST /api/v1/chats/enter`

**기존 요청**:
```json
{
  "group_id": 1
}
```

**🆕 새로운 응답** (정산 정보 포함):
```json
{
  "success": true,
  "data": {
    "reservation_id": 1,
    "message": "입장 완료",
    "room_info": {
      // 기존 필드들
      "reservation_status": 1,
      "status_message": "모집 마감",
      "is_recruitment_closed": true,
      "participant_count": 5,
      "max_participant_count": 8,
      "participant_info": "5/8",
      "match_title": "맨유 vs 맨시티",
      "reservation_start_time": "2024-01-15T19:00:00.000Z",
      "host_id": "test1",
      "is_host": false,
      "selected_store": {
        "store_id": "store_123",
        "store_name": "강남 스포츠바",
        "selected_at": "2024-01-15T15:30:00.000Z",
        "selected_by": "test1"
      },
      
      // 🆕 정산 정보 추가
      "payment_info": {
        "payment_status": "in_progress", // 'not_started' | 'in_progress' | 'completed'
        "payment_id": "payment_123",
        "payment_per_person": 25000,
        "store_info": {
          "store_name": "강남 스포츠바",
          "bank_name": "국민은행",
          "account_number": "123-456-789012",
          "account_holder": "강남스포츠바"
        },
        "participants": [
          {
            "user_id": "test1",
            "user_name": "김철수",
            "payment_status": "completed",
            "completed_at": "2024-01-15T15:30:00Z"
          },
          {
            "user_id": "test2",
            "user_name": "이영희",
            "payment_status": "pending",
            "completed_at": null
          }
        ],
        "payment_deadline": "2024-01-18T23:59:59Z",
        "started_at": "2024-01-15T15:00:00Z",
        "completed_count": 1,
        "total_count": 3
      }
    }
  }
}
```

**정산이 시작되지 않은 경우**:
```json
{
  "success": true,
  "data": {
    "reservation_id": 1,
    "message": "입장 완료",
    "room_info": {
      // ... 기존 필드들 ...
      "payment_info": null  // 정산이 시작되지 않은 경우
    }
  }
}
```

### 2. 채팅방 목록 API
**엔드포인트**: `GET /api/v1/chats`

**🆕 새로운 응답** (정산 상태 포함):
```json
{
  "success": true,
  "data": [
    {
      "chat_room_id": 1,
      "name": "맨유 vs 맨시티 관전 모임",
      "host_id": "test1",
      "is_host": false,
      "user_role": "참가자",
      "reservation_status": 1,
      "status_message": "모집 마감",
      "is_recruitment_closed": true,
      "participant_info": "5/8",
      "match_title": "맨유 vs 맨시티",
      "reservation_start_time": "2024-01-15T19:00:00.000Z",
      "selected_store": {
        "store_id": "store_123",
        "store_name": "강남 스포츠바"
      },
      
      // 🆕 정산 상태 간단 정보
      "payment_status": "in_progress", // 'not_started' | 'in_progress' | 'completed'
      "payment_progress": "2/5",       // 입금 완료 인원 / 전체 인원 (진행 중일 때만)
      
      // 기타 기존 필드들
      "last_message": "안녕하세요!",
      "last_message_time": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

## 🎯 클라이언트 사용 방법

### 1. 채팅방 입장 시 정산 상태 확인
```typescript
const handleChatRoomEnter = async (groupId: number) => {
  try {
    const response = await fetch('/api/v1/chats/enter', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ group_id: groupId })
    });

    const data = await response.json();
    
    if (data.success) {
      const { room_info } = data.data;
      
      // 🆕 정산 정보가 있으면 상태 업데이트
      if (room_info.payment_info) {
        const paymentInfo = room_info.payment_info;
        
        // 정산 상태에 따른 UI 표시
        switch (paymentInfo.payment_status) {
          case 'in_progress':
            // 예약금 안내 UI 표시
            showPaymentUI({
              paymentPerPerson: paymentInfo.payment_per_person,
              storeInfo: paymentInfo.store_info,
              participants: paymentInfo.participants,
              deadline: paymentInfo.payment_deadline,
              progress: `${paymentInfo.completed_count}/${paymentInfo.total_count}`
            });
            break;
            
          case 'completed':
            // 정산 완료 UI 표시
            showPaymentCompletedUI();
            break;
            
          case 'not_started':
          default:
            // 정산 미시작 - 정산 UI 숨김
            hidePaymentUI();
            break;
        }
      } else {
        // 정산 정보 없음 - 정산 UI 숨김
        hidePaymentUI();
      }
      
      // 채팅방 UI 업데이트
      updateChatRoomUI(room_info);
    }
  } catch (error) {
    console.error('채팅방 입장 실패:', error);
  }
};
```

### 2. 채팅방 목록에서 정산 상태 표시
```typescript
const ChatRoomList = ({ chatRooms }) => {
  return (
    <div className="chat-room-list">
      {chatRooms.map(room => (
        <div key={room.chat_room_id} className="chat-room-item">
          <div className="room-header">
            <h3>{room.name}</h3>
            
            {/* 🆕 정산 상태 배지 */}
            {room.payment_status === 'in_progress' && (
              <div className="payment-badge in-progress">
                💰 정산 진행중 ({room.payment_progress})
              </div>
            )}
            {room.payment_status === 'completed' && (
              <div className="payment-badge completed">
                ✅ 정산 완료
              </div>
            )}
          </div>
          
          <div className="room-info">
            <span>{room.status_message}</span>
            <span>{room.participant_info}</span>
            {room.selected_store && (
              <span>📍 {room.selected_store.store_name}</span>
            )}
          </div>
          
          <div className="last-message">
            {room.last_message}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 3. 실시간 정산 상태 업데이트
```typescript
// 소켓 이벤트 리스너 등록
useEffect(() => {
  // 정산 시작 알림
  socket.on('paymentStarted', (data) => {
    if (data.room_id === currentRoomId) {
      // 즉시 예약금 안내 UI 표시
      showPaymentUI({
        paymentPerPerson: data.payment_per_person,
        storeInfo: data.store_account,
        deadline: data.payment_deadline
      });
    }
  });

  // 정산 완료 알림
  socket.on('paymentCompleted', (data) => {
    if (data.room_id === currentRoomId) {
      // 진행률 업데이트
      updatePaymentProgress(data.completed_payments, data.total_participants);
    }
  });

  // 전체 정산 완료 알림
  socket.on('paymentFullyCompleted', (data) => {
    if (data.room_id === currentRoomId) {
      // 정산 완료 UI로 전환
      showPaymentCompletedUI();
    }
  });

  return () => {
    socket.off('paymentStarted');
    socket.off('paymentCompleted');
    socket.off('paymentFullyCompleted');
  };
}, [currentRoomId]);
```

## 📊 정산 상태별 UI 가이드

### 1. 정산 미시작 (`not_started` 또는 `null`)
- 예약금 안내 UI 숨김
- 방장인 경우: "정산하기" 버튼 표시 (조건 만족 시)

### 2. 정산 진행중 (`in_progress`)
- 예약금 안내 UI 표시
- 계좌 정보, 1인당 금액, 마감일 표시
- 참여자별 입금 상태 표시
- 본인 미입금 시: "입금하기" 버튼 표시

### 3. 정산 완료 (`completed`)
- 정산 완료 메시지 표시
- 예약금 안내 UI 읽기 전용으로 표시

## 🔄 동기화 전략

### 1. 입장 시 최신 정보 확인
- 채팅방 입장 즉시 서버 정보로 UI 상태 설정
- 캐시된 정보와 서버 정보 불일치 문제 해결

### 2. 실시간 업데이트
- 소켓 이벤트로 실시간 상태 동기화
- 다른 사용자의 입금 완료 시 즉시 UI 업데이트

### 3. 주기적 상태 확인 (옵션)
```typescript
// 정산 진행 중일 때 주기적으로 상태 확인 (옵션)
useEffect(() => {
  let interval: NodeJS.Timeout;
  
  if (paymentStatus === 'in_progress') {
    interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/chats/${roomId}/payment`);
        const data = await response.json();
        
        if (data.success) {
          updatePaymentStatus(data.data);
        }
      } catch (error) {
        console.error('정산 상태 조회 실패:', error);
      }
    }, 30000); // 30초마다
  }
  
  return () => {
    if (interval) clearInterval(interval);
  };
}, [paymentStatus, roomId]);
```

## 🎉 기대 효과

1. **즉시 정산 상태 표시**: 채팅방 입장 즉시 정산 진행 상황 확인 가능
2. **올바른 UI 렌더링**: 정산 진행 중일 때 예약금 안내 UI가 바로 표시됨
3. **사용자 경험 개선**: 정산 상태를 별도로 확인할 필요 없이 입장과 동시에 모든 정보 제공
4. **실시간 동기화**: 다른 사용자의 입금 상태 변경 시 즉시 반영

이제 정산 진행 중인 채팅방에 입장하면 즉시 예약금 안내 UI가 표시됩니다! 🚀
