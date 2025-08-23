# 💰 채팅방 정산 시스템 메시지 가이드

## 📋 개요
정산 시작부터 완료까지 채팅방에 실시간으로 업데이트되는 시스템 메시지 기능이 구현되었습니다. 사용자들은 채팅방에서 바로 정산 현황을 확인할 수 있습니다.

## 🎯 주요 기능

### 1. 정산 시작 시 예약금 안내 메시지 추가
- **시점**: 방장이 `POST /api/v1/chats/{roomId}/payment/start` 호출 시
- **메시지 타입**: `system_payment_start`
- **위치**: 채팅방 메시지 목록에 시스템 메시지로 추가

### 2. 입금 상태 변경 시 실시간 메시지 업데이트
- **시점**: 사용자가 `POST /api/v1/chats/{roomId}/payment/complete` 호출 시
- **메시지 타입**: `system_payment_update`
- **동작**: 기존 예약금 안내 메시지의 "입금 현황" 부분만 업데이트

### 3. 전체 정산 완료 시 완료 메시지 추가
- **시점**: 모든 참여자 입금 완료 시
- **메시지 타입**: `system_payment_completed`
- **위치**: 새로운 시스템 메시지로 추가

## 📱 시스템 메시지 예시

### 1. 정산 시작 메시지
```
💰 정산이 시작되었습니다!

📍 강남 스포츠바
💳 1인당 예약금: 25,000원
💰 총 금액: 125,000원
👥 참여자: 5명

🏦 입금 계좌
은행: 국민은행
계좌번호: 123-456-789012
예금주: 강남스포츠바

⏰ 마감일: 2024. 1. 18. 23:59
📊 입금 현황: 0/5명 완료
```

### 2. 입금 상태 업데이트 (실시간)
```
💰 정산이 시작되었습니다!

📍 강남 스포츠바
💳 1인당 예약금: 25,000원
💰 총 금액: 125,000원
👥 참여자: 5명

🏦 입금 계좌
은행: 국민은행
계좌번호: 123-456-789012
예금주: 강남스포츠바

⏰ 마감일: 2024. 1. 18. 23:59
📊 입금 현황: 3/5명 완료  ← 실시간 업데이트
```

### 3. 정산 완료 메시지
```
✅ 정산이 완료되었습니다!

💰 총 125,000원이 모두 입금되었습니다.
👥 모든 참여자(5명)가 입금을 완료했습니다.

감사합니다! 🎉
```

## 🔄 소켓 이벤트

### 1. 정산 시작 시 발송되는 이벤트들

**`paymentStarted` 이벤트:**
```javascript
{
  room_id: 1,
  payment_id: "payment_1_1692820255000",
  started_by: "user123",
  started_by_name: "김철수",
  payment_per_person: 25000,
  total_amount: 125000,
  payment_deadline: "2024-01-18T23:59:59Z",
  store_account: {
    bank_name: "국민은행",
    account_number: "123-456-789012",
    account_holder: "강남스포츠바"
  }
}
```

**`newMessage` 이벤트 (시스템 메시지):**
```javascript
{
  message_id: 123,
  chat_room_id: 1,
  sender_id: "system",
  message: "💰 정산이 시작되었습니다!\n\n📍 강남 스포츠바\n...",
  created_at: "2024-01-15T15:00:00Z",
  message_type: "system_payment_start",
  payment_id: "payment_1_1692820255000",
  user_name: "김철수",
  user_id: "user123"
}
```

### 2. 입금 완료 시 발송되는 이벤트들

**`paymentCompleted` 이벤트:**
```javascript
{
  room_id: 1,
  payment_id: "payment_1_1692820255000",
  user_id: "user456",
  user_name: "이영희",
  paid_at: "2024-01-15T15:30:00Z",
  remaining_pending: 2,
  completed_payments: 3,
  total_participants: 5
}
```

**🆕 `messageUpdated` 이벤트 (메시지 업데이트):**
```javascript
{
  message_id: 123,
  chat_room_id: 1,
  sender_id: "system",
  message: "💰 정산이 시작되었습니다!\n\n...\n📊 입금 현황: 3/5명 완료",
  created_at: "2024-01-15T15:30:00Z",
  message_type: "system_payment_update",
  payment_id: "payment_1_1692820255000",
  updated: true,
  payment_progress: {
    completed: 3,
    total: 5,
    is_fully_completed: false
  }
}
```

### 3. 전체 정산 완료 시 발송되는 이벤트들

**`paymentFullyCompleted` 이벤트:**
```javascript
{
  room_id: 1,
  payment_id: "payment_1_1692820255000",
  completed_at: "2024-01-15T16:00:00Z",
  total_amount: 125000,
  all_participants_paid: true
}
```

**`newMessage` 이벤트 (완료 메시지):**
```javascript
{
  message_id: 124,
  chat_room_id: 1,
  sender_id: "system",
  message: "✅ 정산이 완료되었습니다!\n\n💰 총 125,000원이 모두 입금되었습니다.\n...",
  created_at: "2024-01-15T16:00:00Z",
  message_type: "system_payment_completed",
  payment_id: "payment_1_1692820255000"
}
```

## 💻 클라이언트 구현 가이드

### 1. 소켓 이벤트 리스너 등록

```typescript
// 기존 이벤트들
socket.on('paymentStarted', handlePaymentStarted);
socket.on('paymentCompleted', handlePaymentCompleted);
socket.on('paymentFullyCompleted', handlePaymentFullyCompleted);

// 🆕 새로운 이벤트 (메시지 업데이트)
socket.on('messageUpdated', handleMessageUpdated);
socket.on('newMessage', handleNewMessage);
```

### 2. 이벤트 핸들러 구현

```typescript
// 새로운 시스템 메시지 처리
const handleNewMessage = (data) => {
  if (data.message_type === 'system_payment_start') {
    // 정산 시작 시스템 메시지 처리
    addMessageToChat(data);
    showPaymentStartNotification(data);
  } else if (data.message_type === 'system_payment_completed') {
    // 정산 완료 시스템 메시지 처리
    addMessageToChat(data);
    showPaymentCompletedNotification(data);
  } else {
    // 일반 메시지 처리
    addMessageToChat(data);
  }
};

// 🆕 메시지 업데이트 처리
const handleMessageUpdated = (data) => {
  if (data.message_type === 'system_payment_update') {
    // 기존 메시지를 찾아서 업데이트
    updateExistingMessage(data.message_id, data.message);
    
    // 진행률 UI 업데이트
    updatePaymentProgress(data.payment_progress);
    
    // 입금 완료 알림 (선택사항)
    if (data.payment_progress.completed > previousCompletedCount) {
      showProgress(`${data.payment_progress.completed}/${data.payment_progress.total}명 입금 완료`);
    }
  }
};
```

### 3. 메시지 UI 처리

```typescript
// 시스템 메시지 스타일링
const renderSystemMessage = (message) => {
  const messageType = message.message_type;
  
  let className = 'system-message';
  let icon = '🔔';
  
  switch (messageType) {
    case 'system_payment_start':
      className += ' payment-start';
      icon = '💰';
      break;
    case 'system_payment_update':
      className += ' payment-update';
      icon = '📊';
      break;
    case 'system_payment_completed':
      className += ' payment-completed';
      icon = '✅';
      break;
    default:
      className += ' general';
      break;
  }
  
  return (
    <div className={className}>
      <span className="system-icon">{icon}</span>
      <div className="system-content">
        {message.message.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <span className="system-time">
        {formatTime(message.created_at)}
      </span>
    </div>
  );
};

// 메시지 업데이트 함수
const updateExistingMessage = (messageId, newContent) => {
  setMessages(prevMessages =>
    prevMessages.map(msg =>
      msg.message_id === messageId
        ? { ...msg, message: newContent, updated_at: new Date() }
        : msg
    )
  );
};
```

### 4. 진행률 표시

```typescript
const PaymentProgressBar = ({ completed, total, isCompleted }) => {
  const percentage = (completed / total) * 100;
  
  return (
    <div className="payment-progress">
      <div className="progress-header">
        <span>입금 진행률</span>
        <span className={isCompleted ? 'completed' : 'pending'}>
          {completed}/{total}명 {isCompleted ? '완료' : '대기중'}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

## 🎨 CSS 스타일 예시

```css
/* 시스템 메시지 공통 스타일 */
.system-message {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 12px;
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
}

/* 정산 시작 메시지 */
.system-message.payment-start {
  background-color: #e3f2fd;
  border-left-color: #1976d2;
}

/* 정산 업데이트 메시지 */
.system-message.payment-update {
  background-color: #fff3e0;
  border-left-color: #f57c00;
}

/* 정산 완료 메시지 */
.system-message.payment-completed {
  background-color: #e8f5e8;
  border-left-color: #388e3c;
}

.system-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.system-content {
  flex: 1;
  white-space: pre-line;
  line-height: 1.4;
  font-size: 14px;
}

.system-time {
  font-size: 11px;
  color: #6c757d;
  margin-left: 8px;
  flex-shrink: 0;
}

/* 진행률 바 */
.payment-progress {
  margin: 8px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6c757d;
}

.progress-header .completed {
  color: #28a745;
  font-weight: bold;
}

.progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}
```

## 🧪 테스트 시나리오

### 1. 정산 시작 테스트
1. 방장이 정산 시작
2. 채팅방에 예약금 안내 메시지 나타나는지 확인
3. 소켓 이벤트 수신 확인

### 2. 입금 완료 테스트
1. 참여자가 입금 완료 처리
2. 예약금 안내 메시지의 "입금 현황" 실시간 업데이트 확인
3. `messageUpdated` 이벤트 수신 확인

### 3. 전체 정산 완료 테스트
1. 모든 참여자 입금 완료
2. 정산 완료 메시지 추가 확인
3. 완료 관련 이벤트들 수신 확인

## 🎉 주요 장점

1. **실시간 진행률 확인**: 채팅방에서 바로 정산 현황 확인
2. **사용자 경험 개선**: 별도 화면 전환 없이 채팅 중에 정산 상태 파악
3. **투명한 정산 과정**: 모든 참여자가 실시간으로 입금 현황 공유
4. **자동 알림**: 입금 완료 시 자동으로 모든 참여자에게 알림

이제 정산 과정이 채팅방에서 실시간으로 표시됩니다! 🚀
