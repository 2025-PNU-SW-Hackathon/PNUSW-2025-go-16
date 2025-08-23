# 🎨 클라이언트 예약금 안내 UI 시스템 가이드

## 📋 개요
서버에서 구조화된 데이터를 전송하여 클라이언트가 예약금 안내 UI를 동적으로 구성할 수 있도록 개선된 시스템입니다.

## 🔄 변경사항

### 기존 방식 (문제점)
- 긴 텍스트 메시지로 모든 정보 전송
- 클라이언트에서 파싱하기 어려움
- UI 업데이트 복잡함

### 🆕 새로운 방식 (해결책)
- **구조화된 JSON 데이터** 전송
- 클라이언트에서 UI 컴포넌트로 쉽게 변환
- 실시간 업데이트 간소화

## 📊 구조화된 데이터 형식

### 1. 정산 시작 시 전송되는 데이터

**`paymentStarted` 소켓 이벤트:**
```javascript
{
  room_id: 1,
  payment_id: "payment_1_123",
  started_by: "user123",
  started_by_name: "김철수",
  payment_guide_data: {
    type: "payment_guide",
    title: "예약금 안내",
    store: {
      name: "챔피언 스포츠 펍",
      address: null
    },
    payment: {
      per_person: 5000,
      total_amount: 20000,
      participants_count: 4
    },
    account: {
      bank_name: "국민은행",
      account_number: "123-456-789012",
      account_holder: "펍사장"
    },
    deadline: {
      date: "2024-01-18T14:59:59.000Z",
      display: "2024. 1. 18. 14:59"
    },
    progress: {
      completed: 0,
      total: 4,
      percentage: 0
    },
    participants: [
      {
        user_id: "user123",
        user_name: "김철수",
        status: "pending"
      },
      {
        user_id: "user456", 
        user_name: "이영희",
        status: "pending"
      }
    ],
    payment_id: "payment_1_123",
    started_by: "user123",
    started_at: "2024-01-15T15:00:00.000Z"
  }
}
```

**`newMessage` 소켓 이벤트:**
```javascript
{
  message_id: 123,
  chat_room_id: 1,
  sender_id: "system",
  message: "💰 정산이 시작되었습니다 (5,000원)",
  created_at: "2024-01-15T15:00:00Z",
  message_type: "system_payment_start",
  payment_id: "payment_1_123",
  user_name: "김철수",
  user_id: "user123",
  payment_guide_data: { /* 위와 동일한 구조화된 데이터 */ }
}
```

### 2. 입금 완료 시 업데이트 데이터

**🆕 `paymentGuideUpdated` 소켓 이벤트:**
```javascript
{
  room_id: 1,
  payment_id: "payment_1_123",
  update_type: "progress_update",
  completed_payments: 2,
  total_participants: 4,
  is_fully_completed: false,
  payment_guide_data: {
    type: "payment_guide",
    title: "예약금 안내",
    // ... 기본 정보는 동일 ...
    progress: {
      completed: 2,      // 🔄 업데이트됨
      total: 4,
      percentage: 50     // 🔄 업데이트됨
    },
    participants: [
      {
        user_id: "user123",
        user_name: "김철수",
        status: "completed",                        // 🔄 업데이트됨
        completed_at: "2024-01-15T15:30:00.000Z"   // 🔄 업데이트됨
      },
      {
        user_id: "user456",
        user_name: "이영희",
        status: "completed",                        // 🔄 업데이트됨
        completed_at: "2024-01-15T15:35:00.000Z"   // 🔄 업데이트됨
      },
      {
        user_id: "user789",
        user_name: "박민수",
        status: "pending"
      }
    ],
    is_completed: false,
    updated_at: "2024-01-15T15:35:00.000Z"    // 🔄 업데이트됨
  }
}
```

## 💻 클라이언트 구현 가이드

### 1. 소켓 이벤트 리스너 등록

```typescript
// 🆕 새로운 이벤트 리스너
socket.on('paymentStarted', handlePaymentStarted);
socket.on('paymentGuideUpdated', handlePaymentGuideUpdate);
socket.on('paymentCompleted', handlePaymentCompleted);
socket.on('newMessage', handleNewMessage);
```

### 2. 예약금 안내 UI 컴포넌트

```typescript
interface PaymentGuideData {
  type: 'payment_guide';
  title: string;
  store: {
    name: string;
    address?: string;
  };
  payment: {
    per_person: number;
    total_amount: number;
    participants_count: number;
  };
  account: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  };
  deadline: {
    date: string;
    display: string;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  participants: Array<{
    user_id: string;
    user_name: string;
    status: 'pending' | 'completed';
    completed_at?: string;
  }>;
  payment_id: string;
  started_by: string;
  started_at: string;
  is_completed?: boolean;
  updated_at?: string;
}

const PaymentGuideUI: React.FC<{ data: PaymentGuideData }> = ({ data }) => {
  return (
    <div className="payment-guide">
      {/* 헤더 */}
      <div className="payment-header">
        <h3>{data.title}</h3>
        <span className="deadline">
          30분 내 입금 필수 {/* 또는 실제 마감 시간 표시 */}
        </span>
      </div>

      {/* 가게 정보 */}
      <div className="store-info">
        <span className="store-name">{data.store.name}</span>
      </div>

      {/* 금액 정보 */}
      <div className="amount-info">
        <div>인당 예약금 {data.payment.per_person.toLocaleString()}원이 필요합니다</div>
      </div>

      {/* 참여자 목록 */}
      <div className="participants-list">
        {data.participants.map(participant => (
          <div key={participant.user_id} className="participant-item">
            <div className="participant-info">
              <span className="role-badge">
                {participant.user_id === data.started_by ? '방' : '참'}
              </span>
              <span className="name">{participant.user_name}</span>
            </div>
            <div className="status">
              {participant.status === 'completed' ? (
                <span className="completed">입금완료</span>
              ) : (
                <button className="payment-button">입금하기</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 총액 표시 */}
      <div className="total-amount">
        <span>들어온 예약금</span>
        <span className="amount">
          {data.progress.completed}/{data.progress.total}명 입금완료
        </span>
        <span className="total">
          {(data.payment.per_person * data.progress.completed).toLocaleString()}원
        </span>
      </div>
    </div>
  );
};
```

### 3. 이벤트 핸들러 구현

```typescript
// 정산 시작 핸들러
const handlePaymentStarted = (data: any) => {
  console.log('💰 정산 시작:', data);
  
  // 예약금 안내 UI 표시
  setPaymentGuideData(data.payment_guide_data);
  setShowPaymentGuide(true);
  
  // 토스트 알림
  showToast(`${data.started_by_name}님이 정산을 시작했습니다`);
};

// 🆕 예약금 안내 업데이트 핸들러
const handlePaymentGuideUpdate = (data: any) => {
  console.log('🔄 예약금 안내 업데이트:', data);
  
  // 기존 UI 데이터 업데이트
  setPaymentGuideData(data.payment_guide_data);
  
  // 진행률 업데이트 애니메이션
  if (data.update_type === 'progress_update') {
    showProgress(`${data.completed_payments}/${data.total_participants}명 입금 완료`);
  }
  
  // 전체 완료 시 특별 처리
  if (data.is_fully_completed) {
    setTimeout(() => {
      setShowPaymentGuide(false);
      showSuccessMessage('모든 입금이 완료되었습니다! 🎉');
    }, 2000);
  }
};

// 시스템 메시지 핸들러
const handleNewMessage = (data: any) => {
  if (data.message_type === 'system_payment_start' && data.payment_guide_data) {
    // 시스템 메시지와 함께 예약금 안내 표시
    addMessageToChat(data);
    
    if (!showPaymentGuide) {
      setPaymentGuideData(data.payment_guide_data);
      setShowPaymentGuide(true);
    }
  } else {
    // 일반 메시지 처리
    addMessageToChat(data);
  }
};

// 입금 완료 핸들러
const handlePaymentCompleted = (data: any) => {
  console.log('✅ 입금 완료:', data);
  
  // 입금 완료 알림
  if (data.user_id === currentUserId) {
    showSuccessMessage('입금이 완료되었습니다!');
  } else {
    showInfo(`${data.user_name}님이 입금을 완료했습니다`);
  }
};
```

### 4. 입금하기 버튼 처리

```typescript
const handlePaymentButtonClick = async (participantId: string) => {
  try {
    // 입금 완료 API 호출
    const response = await fetch(`/api/v1/chats/${roomId}/payment/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_method: 'bank_transfer'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // 성공 시 UI는 소켓 이벤트로 자동 업데이트됨
      showSuccessMessage('입금이 완료되었습니다!');
    } else {
      showErrorMessage(result.message || '입금 처리 실패');
    }
  } catch (error) {
    console.error('입금 처리 에러:', error);
    showErrorMessage('입금 처리 중 오류가 발생했습니다');
  }
};
```

### 5. CSS 스타일 예시

```css
.payment-guide {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  color: white;
  position: relative;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.payment-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.deadline {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.store-info {
  margin-bottom: 12px;
}

.store-name {
  font-size: 16px;
  font-weight: 600;
}

.amount-info {
  margin-bottom: 16px;
  font-size: 14px;
}

.participants-list {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.participant-item:last-child {
  border-bottom: none;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  min-width: 20px;
  text-align: center;
}

.completed {
  color: #4CAF50;
  font-weight: bold;
  font-size: 12px;
}

.payment-button {
  background: #FF9800;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.amount {
  font-size: 14px;
}

.total {
  font-weight: bold;
  font-size: 16px;
}
```

## 🎯 주요 장점

1. **완전한 데이터 구조화**: 클라이언트에서 파싱 불필요
2. **실시간 UI 업데이트**: 구조화된 데이터로 정확한 상태 동기화
3. **재사용 가능한 컴포넌트**: 동일한 데이터 구조로 일관된 UI
4. **확장성**: 새로운 필드 추가 시 구조 유지

이제 클라이언트에서 사진과 같은 예약금 안내 UI를 쉽게 구현하고 실시간으로 업데이트할 수 있습니다! 🚀
