# 🏪 채팅방별 가게 선택 기능 API 가이드

## 📋 개요
채팅방별로 방장이 모임의 최종 가게를 선택할 수 있는 기능이 구현되었습니다. 이는 기존의 가게 "공유" 기능과는 다른 독립적인 기능입니다.

## 🚀 구현 완료 사항

### ✅ 1. 새로운 API 엔드포인트

#### **가게 선택/해제 API**
```
PATCH /api/v1/chats/{chatRoomId}/store
```

**요청 헤더:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**요청 Body:**
```json
{
  "store_id": "123"  // 선택할 가게 ID (null 또는 생략 시 선택 해제)
}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "message": "가게가 선택되었습니다.",
  "data": {
    "chat_room_id": 456,
    "selected_store_id": "123",
    "selected_store_name": "강남 스포츠바",
    "selected_store_address": "서울시 강남구...",
    "selected_store_rating": 4.5,
    "selected_store_thumbnail": "https://...",
    "selected_at": "2024-01-15T14:30:00Z",
    "selected_by": "user123"
  }
}
```

**에러 응답:**
```json
// 403 - 권한 없음 (방장이 아닌 경우)
{
  "success": false,
  "message": "방장만 가게를 선택할 수 있습니다."
}

// 404 - 가게 없음
{
  "success": false,
  "message": "존재하지 않는 가게입니다."
}

// 404 - 채팅방 없음
{
  "success": false,
  "message": "존재하지 않는 채팅방입니다."
}
```

### ✅ 2. 실시간 소켓 알림

**이벤트명:** `storeSelected`

**이벤트 데이터:**
```json
{
  "room_id": 456,
  "store_id": "123",
  "store_name": "강남 스포츠바",
  "store_address": "서울시 강남구...",
  "store_rating": 4.5,
  "store_thumbnail": "https://...",
  "selected_by": "user123",
  "selected_by_name": "방장님",
  "selected_at": "2024-01-15T14:30:00Z",
  "action": "selected"  // "selected" 또는 "deselected"
}
```

### ✅ 3. 기존 채팅방 API에 선택된 가게 정보 추가

#### **채팅방 목록 조회 (`GET /api/v1/chats`)**
```json
{
  "success": true,
  "data": [
    {
      "chat_room_id": 1,
      "name": "맨유 vs 맨시티 관전 모임",
      "host_id": "test1",
      "is_host": true,
      "user_role": "방장",
      "reservation_status": 0,
      "status_message": "모집 중",
      "is_recruitment_closed": false,
      "participant_info": "3/8",
      "match_title": "맨유 vs 맨시티",
      
      // 🆕 새로 추가된 선택된 가게 정보
      "selected_store": {
        "store_id": "123",
        "store_name": "강남 스포츠바",
        "selected_at": "2024-01-15T14:30:00Z",
        "selected_by": "test1"
      },
      
      // 기존 필드들...
      "last_message": "안녕하세요!",
      "last_message_time": "2024-01-15T14:30:00Z"
    }
  ]
}
```

#### **채팅방 입장 (`POST /api/v1/chats/enter`)**
```json
{
  "success": true,
  "data": {
    "reservation_id": 1,
    "message": "입장 완료",
    "room_info": {
      "reservation_status": 0,
      "status_message": "모집 중",
      "is_recruitment_closed": false,
      "participant_count": 3,
      "max_participant_count": 8,
      "participant_info": "3/8",
      "match_title": "맨유 vs 맨시티",
      "host_id": "test1",
      "is_host": false,
      
      // 🆕 새로 추가된 선택된 가게 정보
      "selected_store": {
        "store_id": "123",
        "store_name": "강남 스포츠바",
        "selected_at": "2024-01-15T14:30:00Z",
        "selected_by": "test1"
      }
    }
  }
}
```

#### **참여자 목록 조회 (`GET /api/v1/chats/{roomId}/participants`)**
```json
{
  "success": true,
  "data": {
    "room_id": 1,
    "total_participants": 3,
    "participants": [...],
    
    // 🆕 새로 추가된 선택된 가게 정보
    "room_info": {
      "reservation_status": 0,
      "status_message": "모집 중",
      "selected_store": {
        "store_id": "123",
        "store_name": "강남 스포츠바",
        "selected_at": "2024-01-15T14:30:00Z",
        "selected_by": "test1"
      }
    }
  }
}
```

## 🛠️ 클라이언트 구현 가이드

### 1. 가게 선택 요청
```javascript
// 가게 선택
async function selectStore(chatRoomId, storeId) {
  try {
    const response = await fetch(`/api/v1/chats/${chatRoomId}/store`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ store_id: storeId })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('가게 선택 완료:', result.data);
      showSuccess(result.message);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('가게 선택 실패:', error);
    showError(error.message);
  }
}

// 가게 선택 해제
async function deselectStore(chatRoomId) {
  return selectStore(chatRoomId, null);
}
```

### 2. 실시간 소켓 이벤트 처리
```javascript
// 가게 선택 이벤트 리스너
socket.on('storeSelected', (data) => {
  console.log('🏪 가게 선택 알림:', data);
  
  if (data.action === 'selected') {
    // 가게가 선택됨
    updateSelectedStoreUI(data);
    showToast(`${data.selected_by_name}님이 "${data.store_name}"을 선택했습니다.`);
  } else {
    // 가게 선택 해제됨
    clearSelectedStoreUI();
    showToast(`${data.selected_by_name}님이 가게 선택을 해제했습니다.`);
  }
});

// UI 업데이트 함수들
function updateSelectedStoreUI(storeData) {
  const storeInfoElement = document.getElementById('selected-store-info');
  storeInfoElement.innerHTML = `
    <div class="selected-store">
      <img src="${storeData.store_thumbnail}" alt="${storeData.store_name}">
      <div class="store-details">
        <h3>${storeData.store_name}</h3>
        <p>${storeData.store_address}</p>
        <div class="rating">⭐ ${storeData.store_rating}</div>
        <small>선택일: ${new Date(storeData.selected_at).toLocaleString()}</small>
      </div>
    </div>
  `;
  storeInfoElement.style.display = 'block';
}

function clearSelectedStoreUI() {
  const storeInfoElement = document.getElementById('selected-store-info');
  storeInfoElement.style.display = 'none';
}
```

### 3. 방장 권한에 따른 UI 처리
```javascript
// 채팅방 정보를 받았을 때 권한에 따른 UI 설정
function setupChatRoomUI(roomInfo) {
  const isHost = roomInfo.is_host;
  const selectedStore = roomInfo.selected_store;
  
  // 선택된 가게 정보 표시
  if (selectedStore) {
    updateSelectedStoreUI(selectedStore);
    
    // 방장인 경우 변경/해제 버튼 표시
    if (isHost) {
      showStoreManagementButtons(selectedStore);
    }
  } else {
    // 방장인 경우 가게 선택 버튼 표시
    if (isHost) {
      showStoreSelectionButton();
    }
  }
}

function showStoreManagementButtons(selectedStore) {
  const buttonContainer = document.getElementById('store-action-buttons');
  buttonContainer.innerHTML = `
    <button onclick="changeStore()" class="btn-change-store">
      🔄 가게 변경
    </button>
    <button onclick="deselectStore(currentRoomId)" class="btn-deselect-store">
      ❌ 선택 해제
    </button>
  `;
}

function showStoreSelectionButton() {
  const buttonContainer = document.getElementById('store-action-buttons');
  buttonContainer.innerHTML = `
    <button onclick="openStoreSelectionModal()" class="btn-select-store">
      🏪 가게 선택하기
    </button>
  `;
}
```

## 🗃️ 데이터베이스 스키마 변경

**실행 필요한 SQL:**
```sql
-- 선택된 가게 관련 필드 추가
ALTER TABLE reservation_table ADD COLUMN selected_store_id VARCHAR(50) NULL;
ALTER TABLE reservation_table ADD COLUMN selected_store_name VARCHAR(255) NULL;
ALTER TABLE reservation_table ADD COLUMN selected_at TIMESTAMP NULL;
ALTER TABLE reservation_table ADD COLUMN selected_by VARCHAR(255) NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_reservation_selected_store ON reservation_table(selected_store_id);
CREATE INDEX idx_reservation_selected_at ON reservation_table(selected_at);
```

## 🧪 테스트 케이스

### 1. 성공 케이스
- ✅ 방장이 가게 선택 → 200 응답
- ✅ 방장이 가게 변경 → 200 응답
- ✅ 방장이 가게 선택 해제 → 200 응답
- ✅ 실시간 알림이 모든 참여자에게 전달

### 2. 실패 케이스
- ❌ 일반 참여자가 가게 선택 시도 → 403 에러
- ❌ 존재하지 않는 가게 선택 → 404 에러
- ❌ 존재하지 않는 채팅방 → 404 에러

## 📞 추가 지원

이 기능이 구현되면 클라이언트에서 즉시 연동하여 완전한 가게 선택 시스템을 구축할 수 있습니다. 

구현 중 문의사항이나 추가 기능이 필요한 경우 언제든 연락주세요! 🚀
