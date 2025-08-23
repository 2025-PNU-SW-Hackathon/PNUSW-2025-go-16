# 🚀 정산 연동 API 명세서

## 📋 개요
클라이언트-서버 간 정산 시스템 소켓 이벤트 및 데이터 구조 명세서입니다.

## 🔌 소켓 이벤트 명세

### 1. 정산 시작 이벤트 (`paymentStarted`)

#### 서버에서 전송하는 데이터 구조:
```typescript
interface PaymentStartedEventDTO {
  room_id: number;
  payment_id: string;          // 예: "payment_2_1692820255000"
  started_by: string;          // 정산 시작한 사용자 ID
  started_by_name: string;     // 정산 시작한 사용자 이름
  payment_per_person: number;  // 1인당 정산 금액
  total_amount: number;        // 총 정산 금액
  payment_deadline: string;    // ISO 형식 마감일 (예: "2024-01-18T14:59:59.000Z")
  store_account: StoreAccountDTO;
  payment_guide_data: PaymentGuideData; // 🆕 구조화된 UI 데이터
}

interface StoreAccountDTO {
  bank_name: string;           // 은행명 (예: "국민은행")
  account_number: string;      // 계좌번호 (예: "123-456-789012")
  account_holder: string;      // 예금주 (예: "펍사장")
}
```

#### 🔍 **중요한 답변:**
**Q1: PaymentStartedEventDTO.payment_id와 payment_guide_data.payment_id가 같은 값인가요?**
- **A: 네, 같은 값입니다.** 두 곳 모두 동일한 `paymentId` 변수를 사용합니다.

**Q2: payment_guide_data 필드가 서버에서 제공되나요?**
- **A: 네, 서버에서 완전한 PaymentGuideData 구조를 제공합니다.**

### 2. PaymentGuideData 완전한 구조

```typescript
interface PaymentGuideData {
  type: 'payment_guide';
  title: string;                        // "예약금 안내"
  store: {
    name: string;                       // 가게명
    address?: string | null;            // 가게 주소 (현재는 null)
  };
  payment: {
    per_person: number;                 // 1인당 금액
    total_amount: number;               // 총 금액
    participants_count: number;         // 총 참여자 수
  };
  account: {
    bank_name: string;                  // 은행명
    account_number: string;             // 계좌번호
    account_holder: string;             // 예금주
  };
  deadline: {
    date: string;                       // ISO 형식 날짜
    display: string;                    // 한국어 표시용 (예: "2024. 1. 18. 14:59")
  };
  progress: {
    completed: number;                  // 입금 완료자 수 (시작 시 0)
    total: number;                      // 총 참여자 수
    percentage: number;                 // 완료 퍼센티지 (시작 시 0)
  };
  participants: Array<{
    user_id: string;
    user_name: string;
    status: 'pending' | 'completed';   // 시작 시 모두 'pending'
    completed_at?: string | null;       // 입금 완료 시간 (시작 시 null)
  }>;
  payment_id: string;                   // ⭐ PaymentStartedEventDTO.payment_id와 동일
  started_by: string;                   // 정산 시작자 ID
  started_at: string;                   // 정산 시작 시간 (ISO)
  is_completed?: boolean;               // 전체 완료 여부 (선택적)
  updated_at?: string;                  // 업데이트 시간 (선택적)
}
```

### 3. 실제 예시 데이터

#### 정산 시작 시 서버에서 전송되는 실제 데이터:
```json
{
  "room_id": 2,
  "payment_id": "payment_2_1692820255000",
  "started_by": "test1",
  "started_by_name": "김철수",
  "payment_per_person": 5000,
  "total_amount": 20000,
  "payment_deadline": "2024-01-18T14:59:59.000Z",
  "store_account": {
    "bank_name": "국민은행",
    "account_number": "123-456-789012",
    "account_holder": "펍사장"
  },
  "payment_guide_data": {
    "type": "payment_guide",
    "title": "예약금 안내",
    "store": {
      "name": "챔피언 스포츠 펍",
      "address": null
    },
    "payment": {
      "per_person": 5000,
      "total_amount": 20000,
      "participants_count": 4
    },
    "account": {
      "bank_name": "국민은행",
      "account_number": "123-456-789012",
      "account_holder": "펍사장"
    },
    "deadline": {
      "date": "2024-01-18T14:59:59.000Z",
      "display": "2024. 1. 18. 14:59"
    },
    "progress": {
      "completed": 0,
      "total": 4,
      "percentage": 0
    },
    "participants": [
      {
        "user_id": "test1",
        "user_name": "김철수",
        "status": "pending"
      },
      {
        "user_id": "test2", 
        "user_name": "이영희",
        "status": "pending"
      },
      {
        "user_id": "test3",
        "user_name": "박민수", 
        "status": "pending"
      },
      {
        "user_id": "test4",
        "user_name": "최정윤",
        "status": "pending"
      }
    ],
    "payment_id": "payment_2_1692820255000",
    "started_by": "test1",
    "started_at": "2024-01-15T15:00:00.000Z"
  }
}
```

### 4. 시스템 메시지 이벤트 (`newMessage`)

#### 정산 시작 시 동시에 전송되는 시스템 메시지:
```typescript
interface PaymentSystemMessage {
  message_id: number;
  chat_room_id: number;
  sender_id: 'system';
  message: string;                      // "💰 정산이 시작되었습니다 (5,000원)"
  created_at: string;                   // ISO 날짜
  message_type: 'system_payment_start'; // 🔍 메시지 타입 식별자
  payment_id: string;                   // ⭐ PaymentStartedEventDTO.payment_id와 동일
  user_name: string;                    // 정산 시작자 이름
  user_id: string;                      // 정산 시작자 ID
  payment_guide_data: PaymentGuideData; // 동일한 구조화된 데이터
}
```

## 🔄 실시간 업데이트 이벤트

### 5. 예약금 안내 업데이트 이벤트 (`paymentGuideUpdated`)

#### 입금 완료 시마다 전송되는 업데이트 이벤트:
```typescript
interface PaymentGuideUpdatedEvent {
  room_id: number;
  payment_id: string;                   // 동일한 payment_id
  update_type: 'progress_update';
  completed_payments: number;           // 업데이트된 완료자 수
  total_participants: number;
  is_fully_completed: boolean;
  payment_guide_data: PaymentGuideData; // 업데이트된 전체 데이터
}
```

### 6. 개별 입금 완료 이벤트 (`paymentCompleted`)

```typescript
interface PaymentCompletedEvent {
  room_id: number;
  payment_id: string;                   // 동일한 payment_id
  user_id: string;                      // 입금 완료한 사용자
  user_name: string;                    // 입금 완료한 사용자 이름
  paid_at: string;                      // 입금 완료 시간 (ISO)
  remaining_pending: number;            // 남은 미입금자 수
  completed_payments: number;           // 현재 완료자 수
  total_participants: number;           // 총 참여자 수
}
```

## 📊 클라이언트 구현 가이드

### 1. 소켓 이벤트 리스너 등록

```typescript
// 정산 시작 이벤트
socket.on('paymentStarted', (data: PaymentStartedEventDTO) => {
  console.log('🔍 정산 시작 데이터:', {
    payment_id: data.payment_id,
    guide_data_payment_id: data.payment_guide_data.payment_id,
    isMatching: data.payment_id === data.payment_guide_data.payment_id // true여야 함
  });
  
  // 예약금 안내 UI 표시
  showPaymentGuideUI(data.payment_guide_data);
});

// 시스템 메시지 이벤트
socket.on('newMessage', (data: PaymentSystemMessage) => {
  if (data.message_type === 'system_payment_start') {
    console.log('🔍 시스템 메시지 정산 관련:', {
      messageType: data.message_type,
      paymentId: data.payment_id,
      hasGuideData: !!data.payment_guide_data
    });
    
    // 채팅에 시스템 메시지 추가
    addSystemMessageToChat(data);
    
    // 예약금 안내 UI 표시 (중복 방지 로직 필요)
    if (!isPaymentGuideVisible) {
      showPaymentGuideUI(data.payment_guide_data);
    }
  }
});

// 실시간 업데이트 이벤트
socket.on('paymentGuideUpdated', (data: PaymentGuideUpdatedEvent) => {
  console.log('🔄 예약금 안내 업데이트:', {
    payment_id: data.payment_id,
    progress: `${data.completed_payments}/${data.total_participants}`,
    percentage: data.payment_guide_data.progress.percentage
  });
  
  // UI 실시간 업데이트
  updatePaymentGuideUI(data.payment_guide_data);
});
```

### 2. Payment ID 매칭 검증

```typescript
const validatePaymentId = (eventData: PaymentStartedEventDTO): boolean => {
  const mainPaymentId = eventData.payment_id;
  const guidePaymentId = eventData.payment_guide_data.payment_id;
  
  if (mainPaymentId !== guidePaymentId) {
    console.error('❌ Payment ID 불일치:', {
      main: mainPaymentId,
      guide: guidePaymentId
    });
    return false;
  }
  
  console.log('✅ Payment ID 일치 확인:', mainPaymentId);
  return true;
};
```

## 🔍 디버깅 로그 확인

### 서버 콘솔에서 확인할 수 있는 로그들:

```bash
# 정산 시작 시
💰 [PAYMENT START] 예약금 안내 시스템 메시지 저장 완료: {
  message_id: 123,
  room_id: 2,
  payment_id: "payment_2_1692820255000"
}

✅ [PAYMENT START] 소켓 이벤트 발송 완료: {
  room_id: 2,
  events: ["paymentStarted", "newMessage"],
  payment_id: "payment_2_1692820255000"
}

# 입금 완료 시
🔄 [PAYMENT GUIDE UPDATE] 예약금 안내 데이터 업데이트 시작: {
  room_id: 2,
  payment_id: "payment_2_1692820255000",
  completed_payments: 1,
  total_participants: 4
}

✅ [PAYMENT GUIDE UPDATE] 예약금 안내 데이터 업데이트 완료: {
  room_id: 2,
  payment_id: "payment_2_1692820255000",
  progress: "1/4",
  percentage: 25
}
```

## ✅ 최종 답변 요약

### Q1: PaymentStartedEventDTO.payment_id와 payment_guide_data.payment_id가 같은 값인가요?
**A: 네, 완전히 같은 값입니다.** 두 곳 모두 동일한 `paymentId` 변수를 사용합니다.

### Q2: payment_guide_data 필드가 서버에서 제공되나요?
**A: 네, 서버에서 완전한 PaymentGuideData 구조를 제공합니다.** 클라이언트에서 별도 변환 작업이 필요하지 않습니다.

### Q3: 서버에서 PaymentGuideData 전체 구조를 제공하나요?
**A: 네, 완전한 구조를 제공합니다.** 위의 PaymentGuideData 인터페이스 참고.

### Q4: 현재 시스템 메시지의 paymentId는?
**A: message_type이 'system_payment_start'인 경우, payment_id 필드에 정산 ID가 포함됩니다.**

이제 클라이언트에서 payment_id 매칭을 활성화하고 완전한 정산 UI를 구현할 수 있습니다! 🚀
