# 💰 채팅방 정산 시스템 API 가이드

## 📋 개요
모집 마감 + 가게 선택이 완료된 채팅방에서 방장이 정산을 시작하고, 참여자들이 개별적으로 입금을 완료할 수 있는 시스템이 구현되었습니다.

## 🚀 구현 완료 사항

### ✅ 1. 정산 시작 API

#### **정산 시작 API**
```
POST /api/v1/chats/{chatRoomId}/payment/start
```

**요청 조건:**
- ✅ **방장 권한 필수**: JWT 토큰의 사용자가 방장이어야 함
- ✅ **모집 마감 상태**: `reservation_status === 1`
- ✅ **가게 선택 완료**: `selected_store_id`가 존재해야 함
- ✅ **중복 방지**: 이미 진행 중인 정산이 없어야 함

**요청 헤더:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**요청 Body:**
```json
{
  "payment_per_person": 25000  // 1인당 정산 금액 (선택사항, 가게 기본값 사용)
}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "정산이 시작되었습니다.",
  "data": {
    "payment_id": "payment_1_1640995200000",
    "chat_room_id": 1,
    "total_participants": 5,
    "payment_per_person": 25000,
    "total_amount": 125000,
    "store_account": {
      "bank_name": "국민은행",
      "account_number": "123-456-789012",
      "account_holder": "강남스포츠바 대표"
    },
    "payment_deadline": "2024-01-20T18:00:00Z",
    "participants": [
      {
        "user_id": "test1",
        "user_name": "방장",
        "is_host": true,
        "payment_status": "pending",
        "paid_at": null
      },
      {
        "user_id": "test2",
        "user_name": "참여자1",
        "is_host": false,
        "payment_status": "pending",
        "paid_at": null
      }
    ]
  }
}
```

### ✅ 2. 개별 입금 완료 API

#### **입금 완료 처리 API**
```
POST /api/v1/chats/{chatRoomId}/payment/complete
```

**요청 Body:**
```json
{
  "payment_method": "bank_transfer"  // "bank_transfer" | "card" | "cash"
}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "입금이 완료되었습니다.",
  "data": {
    "user_id": "test2",
    "user_name": "참여자1",
    "payment_status": "completed",
    "paid_at": "2024-01-15T14:30:00Z",
    "remaining_pending": 3,
    "is_fully_completed": false
  }
}
```

### ✅ 3. 정산 상태 조회 API

#### **정산 상태 조회 API**
```
GET /api/v1/chats/{chatRoomId}/payment
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": {
    "payment_id": "payment_1_1640995200000",
    "payment_status": "in_progress",  // "not_started" | "in_progress" | "completed"
    "total_participants": 5,
    "completed_payments": 2,
    "pending_payments": 3,
    "payment_per_person": 25000,
    "total_amount": 125000,
    "store_info": {
      "store_name": "강남 스포츠바",
      "bank_name": "국민은행",
      "account_number": "123-456-789012",
      "account_holder": "강남스포츠바 대표"
    },
    "payment_deadline": "2024-01-20T18:00:00Z",
    "started_at": "2024-01-17T10:00:00Z",
    "completed_at": null,
    "participants": [
      {
        "user_id": "test1",
        "user_name": "방장",
        "is_host": true,
        "payment_status": "completed",
        "payment_method": "bank_transfer",
        "paid_at": "2024-01-17T10:30:00Z"
      },
      {
        "user_id": "test2",
        "user_name": "참여자1",
        "is_host": false,
        "payment_status": "pending",
        "payment_method": null,
        "paid_at": null
      }
    ]
  }
}
```

**정산이 시작되지 않은 경우:**
```json
{
  "success": true,
  "data": {
    "payment_status": "not_started",
    "message": "정산이 시작되지 않았습니다."
  }
}
```

### ✅ 4. 실시간 소켓 이벤트

#### **정산 시작 알림 (`paymentStarted`)**
```javascript
socket.on('paymentStarted', (data) => {
  console.log('💰 정산 시작:', data);
  /*
  {
    "room_id": 1,
    "payment_id": "payment_1_1640995200000",
    "started_by": "test1",
    "started_by_name": "방장",
    "payment_per_person": 25000,
    "total_amount": 125000,
    "payment_deadline": "2024-01-20T18:00:00Z",
    "store_account": {
      "bank_name": "국민은행",
      "account_number": "123-456-789012",
      "account_holder": "강남스포츠바 대표"
    }
  }
  */
});
```

#### **개별 입금 완료 알림 (`paymentCompleted`)**
```javascript
socket.on('paymentCompleted', (data) => {
  console.log('💰 입금 완료:', data);
  /*
  {
    "room_id": 1,
    "payment_id": "payment_1_1640995200000",
    "user_id": "test2",
    "user_name": "참여자1",
    "paid_at": "2024-01-15T15:00:00Z",
    "remaining_pending": 2,
    "completed_payments": 3,
    "total_participants": 5
  }
  */
});
```

#### **전체 정산 완료 알림 (`paymentFullyCompleted`)**
```javascript
socket.on('paymentFullyCompleted', (data) => {
  console.log('🎉 정산 완료:', data);
  /*
  {
    "room_id": 1,
    "payment_id": "payment_1_1640995200000",
    "completed_at": "2024-01-15T16:00:00Z",
    "total_amount": 125000,
    "all_participants_paid": true
  }
  */
});
```

### ✅ 5. 에러 응답

#### **403 - 권한 없음**
```json
{
  "success": false,
  "message": "방장만 정산을 시작할 수 있습니다."
}
```

#### **400 - 조건 미충족**
```json
{
  "success": false,
  "message": "모집이 마감된 후에만 정산을 시작할 수 있습니다."
}

{
  "success": false,
  "message": "가게가 선택된 후에만 정산을 시작할 수 있습니다."
}
```

#### **409 - 이미 정산 진행 중**
```json
{
  "success": false,
  "message": "이미 정산이 진행 중입니다."
}

{
  "success": false,
  "message": "이미 입금이 완료되었습니다."
}
```

#### **404 - 세션 없음**
```json
{
  "success": false,
  "message": "진행 중인 정산이 없습니다."
}
```

## 🛠️ 클라이언트 구현 가이드

### 1. 정산 시작 (방장만)
```javascript
// 정산 시작 함수
async function startPayment(chatRoomId, paymentPerPerson = null) {
  try {
    const response = await fetch(`/api/v1/chats/${chatRoomId}/payment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        payment_per_person: paymentPerPerson 
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('정산 시작 완료:', result.data);
      showPaymentUI(result.data);
      showSuccess(result.message);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('정산 시작 실패:', error);
    showError(error.message);
  }
}

// 정산 UI 표시
function showPaymentUI(paymentData) {
  const paymentContainer = document.getElementById('payment-container');
  paymentContainer.innerHTML = `
    <div class="payment-info">
      <h3>💰 정산 정보</h3>
      <div class="store-account">
        <p><strong>입금 계좌:</strong> ${paymentData.store_account.bank_name}</p>
        <p><strong>계좌번호:</strong> ${paymentData.store_account.account_number}</p>
        <p><strong>예금주:</strong> ${paymentData.store_account.account_holder}</p>
      </div>
      <div class="payment-details">
        <p><strong>1인당 금액:</strong> ${paymentData.payment_per_person.toLocaleString()}원</p>
        <p><strong>총 금액:</strong> ${paymentData.total_amount.toLocaleString()}원</p>
        <p><strong>마감일:</strong> ${new Date(paymentData.payment_deadline).toLocaleDateString()}</p>
      </div>
      <div class="participants-status">
        <h4>참여자 입금 현황</h4>
        <ul id="participants-list">
          ${paymentData.participants.map(p => `
            <li class="participant ${p.payment_status}">
              <span class="name">${p.user_name}${p.is_host ? ' (방장)' : ''}</span>
              <span class="status">${p.payment_status === 'pending' ? '⏳ 대기중' : '✅ 완료'}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  
  paymentContainer.style.display = 'block';
}
```

### 2. 개별 입금 완료
```javascript
// 입금 완료 함수
async function completePayment(chatRoomId, paymentMethod = 'bank_transfer') {
  try {
    const confirmed = confirm('입금을 완료하셨습니까?');
    if (!confirmed) return;

    const response = await fetch(`/api/v1/chats/${chatRoomId}/payment/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        payment_method: paymentMethod 
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('입금 완료:', result.data);
      updatePaymentStatus(result.data);
      showSuccess(result.message);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('입금 완료 실패:', error);
    showError(error.message);
  }
}

// 입금 상태 업데이트
function updatePaymentStatus(userData) {
  const userElement = document.querySelector(`[data-user-id="${userData.user_id}"]`);
  if (userElement) {
    userElement.classList.remove('pending');
    userElement.classList.add('completed');
    userElement.querySelector('.status').innerHTML = '✅ 완료';
  }
  
  // 남은 대기자 수 업데이트
  const remainingElement = document.getElementById('remaining-count');
  if (remainingElement) {
    remainingElement.textContent = userData.remaining_pending;
  }
}
```

### 3. 정산 상태 조회 및 UI 업데이트
```javascript
// 정산 상태 조회
async function loadPaymentStatus(chatRoomId) {
  try {
    const response = await fetch(`/api/v1/chats/${chatRoomId}/payment`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      if (result.data.payment_status === 'not_started') {
        hidePaymentUI();
      } else {
        showPaymentStatusUI(result.data);
      }
    }
  } catch (error) {
    console.error('정산 상태 조회 실패:', error);
  }
}

// 정산 상태 UI 표시
function showPaymentStatusUI(paymentData) {
  const progressPercent = (paymentData.completed_payments / paymentData.total_participants) * 100;
  
  const paymentContainer = document.getElementById('payment-container');
  paymentContainer.innerHTML = `
    <div class="payment-status">
      <div class="progress-bar">
        <div class="progress" style="width: ${progressPercent}%"></div>
      </div>
      <p>${paymentData.completed_payments} / ${paymentData.total_participants} 명 입금 완료</p>
      
      ${paymentData.payment_status === 'completed' ? 
        '<div class="completed-badge">🎉 정산 완료!</div>' : 
        '<button onclick="completePayment(' + chatRoomId + ')" class="btn-pay">💰 입금 완료</button>'
      }
    </div>
  `;
}
```

### 4. 실시간 소켓 이벤트 처리
```javascript
// 정산 관련 소켓 이벤트 리스너들
socket.on('paymentStarted', (data) => {
  showToast(`💰 ${data.started_by_name}님이 정산을 시작했습니다.`);
  loadPaymentStatus(currentRoomId);
});

socket.on('paymentCompleted', (data) => {
  if (data.user_id !== currentUserId) {
    showToast(`✅ ${data.user_name}님이 입금을 완료했습니다.`);
  }
  
  updateParticipantStatus(data.user_id, 'completed');
  updateProgressBar(data.completed_payments, data.total_participants);
});

socket.on('paymentFullyCompleted', (data) => {
  showToast('🎉 모든 참여자의 정산이 완료되었습니다!');
  showCompletedState(data);
});

// 도우미 함수들
function updateParticipantStatus(userId, status) {
  const element = document.querySelector(`[data-user-id="${userId}"]`);
  if (element) {
    element.className = `participant ${status}`;
    element.querySelector('.status').innerHTML = status === 'completed' ? '✅ 완료' : '⏳ 대기중';
  }
}

function updateProgressBar(completed, total) {
  const progressBar = document.querySelector('.progress');
  if (progressBar) {
    const percent = (completed / total) * 100;
    progressBar.style.width = `${percent}%`;
  }
  
  const countElement = document.querySelector('.count-text');
  if (countElement) {
    countElement.textContent = `${completed} / ${total} 명 입금 완료`;
  }
}
```

## 🗃️ 데이터베이스 스키마

**실행 필요한 SQL:**
```sql
-- 1. 정산 세션 테이블
CREATE TABLE payment_sessions (
  payment_id VARCHAR(50) PRIMARY KEY,
  chat_room_id INT NOT NULL,
  reservation_id INT NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  payment_status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
  payment_per_person DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  total_participants INT NOT NULL,
  completed_payments INT DEFAULT 0,
  started_by VARCHAR(255) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  payment_deadline TIMESTAMP NOT NULL
);

-- 2. 개별 정산 기록 테이블
CREATE TABLE payment_records (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  payment_status ENUM('pending', 'completed') DEFAULT 'pending',
  payment_method ENUM('bank_transfer', 'card', 'cash') NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payment_sessions(payment_id),
  UNIQUE KEY unique_user_payment (payment_id, user_id)
);

-- 3. store_table에 계좌 정보 추가
ALTER TABLE store_table 
ADD COLUMN payment_per_person DECIMAL(10,2) DEFAULT 25000,
ADD COLUMN bank_name VARCHAR(100) DEFAULT '국민은행',
ADD COLUMN account_number VARCHAR(50) DEFAULT '123-456-789012',
ADD COLUMN account_holder VARCHAR(100) DEFAULT '강남스포츠바';
```

## 🧪 테스트 케이스

### 성공 케이스
- ✅ 방장이 정산 시작 (모집 마감 + 가게 선택 완료 상태)
- ✅ 참여자들이 개별 입금 완료
- ✅ 전체 정산 완료 시 상태 변경
- ✅ 실시간 알림 전송

### 실패 케이스
- ❌ 일반 참여자가 정산 시작 시도 → 403 에러
- ❌ 모집 중 상태에서 정산 시작 → 400 에러
- ❌ 가게 선택 전 정산 시작 → 400 에러
- ❌ 중복 입금 완료 시도 → 409 에러

## 🎯 주요 특징

- **조건부 시작**: 모집 마감 + 가게 선택 후에만 정산 시작 가능
- **실시간 동기화**: 모든 입금 상태 변경이 즉시 반영
- **자동 완료 처리**: 모든 참여자 입금 시 자동으로 정산 완료 상태 변경
- **유연한 금액 설정**: 가게별 기본 금액 또는 커스텀 금액 지원
- **트랜잭션 보장**: 모든 DB 작업이 트랜잭션으로 보호

이제 완전한 채팅방 정산 시스템을 사용할 수 있습니다! 🚀
