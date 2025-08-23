# 🏪 채팅방 상세 정보 조회 API 가이드

## 📋 API 개요
채팅방의 상세 정보를 조회하는 API입니다. 정산 조건 확인, 실시간 상태 동기화 등에 사용됩니다.

## 🔗 API 엔드포인트
```
GET /api/v1/chats/{roomId}
```

## 🔐 인증
- **필수**: JWT 토큰 (`Authorization: Bearer <token>`)
- **권한**: 해당 채팅방 참여자만 조회 가능

## 📤 요청 예시
```bash
curl -X GET http://localhost:3000/api/v1/chats/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📥 응답 예시

### ✅ 성공 응답 (200)
```json
{
  "success": true,
  "message": "채팅방 정보 조회 성공",
  "data": {
    "chat_room_id": 1,
    "name": "맨유 vs 맨시티 관전 모임",
    "host_id": "test1",
    "is_host": false,
    "user_role": "참가자",
    
    // 🆕 모집 상태 정보
    "reservation_status": 1,
    "status_message": "모집 마감",
    "is_recruitment_closed": true,
    "participant_info": "5/8",
    "reservation_participant_cnt": 5,
    "reservation_max_participant_cnt": 8,
    "match_title": "맨유 vs 맨시티",
    "reservation_start_time": "2024-01-15T19:00:00.000Z",
    
    // 🆕 선택된 가게 정보
    "selected_store": {
      "store_id": "store_123",
      "store_name": "강남 스포츠바",
      "store_address": "서울시 강남구 테헤란로 123",
      "store_rating": 4.5,
      "store_thumbnail": "https://example.com/thumbnail.jpg",
      "payment_per_person": 25000,
      "selected_at": "2024-01-15T15:30:00.000Z",
      "selected_by": "test1",
      "selected_by_name": "방장"
    },
    
    // 마지막 메시지 정보
    "last_message": "안녕하세요!",
    "last_message_time": "2024-01-15T14:30:00.000Z",
    "last_message_sender_id": "test2"
  }
}
```

### ❌ 에러 응답

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "인증이 필요합니다."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "채팅방을 찾을 수 없거나 접근 권한이 없습니다."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "채팅방 정보를 찾을 수 없습니다."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "채팅방 정보 조회 중 오류가 발생했습니다."
}
```

## 📊 응답 데이터 구조

### 기본 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `chat_room_id` | number | 채팅방 ID |
| `name` | string | 채팅방 이름 |
| `host_id` | string | 방장 ID |
| `is_host` | boolean | 현재 사용자가 방장인지 여부 |
| `user_role` | string | 사용자 역할 ("방장" 또는 "참가자") |

### 모집 상태 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `reservation_status` | number | 모집 상태 (0: 모집중, 1: 모집마감, 2: 진행중, 3: 완료) |
| `status_message` | string | 모집 상태 메시지 |
| `is_recruitment_closed` | boolean | 모집 마감 여부 |
| `participant_info` | string | 참여자 정보 (예: "5/8") |
| `reservation_participant_cnt` | number | 현재 참여자 수 |
| `reservation_max_participant_cnt` | number | 최대 참여자 수 |
| `match_title` | string | 모임명 |
| `reservation_start_time` | string | 모임 시작 시간 (ISO 형식) |

### 선택된 가게 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `selected_store` | object | 선택된 가게 정보 (null인 경우 가게 미선택) |
| `selected_store.store_id` | string | 가게 ID |
| `selected_store.store_name` | string | 가게 이름 |
| `selected_store.store_address` | string | 가게 주소 |
| `selected_store.store_rating` | number | 가게 평점 |
| `selected_store.store_thumbnail` | string | 가게 썸네일 URL |
| `selected_store.payment_per_person` | number | 1인당 정산 금액 |
| `selected_store.selected_at` | string | 가게 선택 시간 (ISO 형식) |
| `selected_store.selected_by` | string | 가게 선택한 사용자 ID |
| `selected_store.selected_by_name` | string | 가게 선택한 사용자 이름 |

### 마지막 메시지 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `last_message` | string | 마지막 메시지 내용 |
| `last_message_time` | string | 마지막 메시지 시간 (ISO 형식) |
| `last_message_sender_id` | string | 마지막 메시지 발신자 ID |

## 🎯 사용 목적

### 1. 정산 조건 정확한 확인
```typescript
// 정산 시작 전 조건 확인
const checkPaymentConditions = async (roomId: number) => {
  const response = await fetch(`/api/v1/chats/${roomId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  // 서버의 최신 정보로 정확한 조건 확인
  const isRecruitmentClosed = data.data.reservation_status === 1;
  const hasSelectedStore = data.data.selected_store !== null;
  
  return isRecruitmentClosed && hasSelectedStore;
};
```

### 2. 실시간 상태 동기화
```typescript
// 가게 선택 후 즉시 정산 가능 여부 확인
const handleStoreSelected = async (roomId: number) => {
  const roomDetail = await getChatRoomDetail(roomId);
  
  if (roomDetail.is_recruitment_closed && roomDetail.selected_store) {
    // 정산 버튼 활성화
    setPaymentButtonEnabled(true);
  }
};
```

### 3. UI 상태 업데이트
```typescript
// 채팅방 헤더 정보 업데이트
const updateChatHeader = async (roomId: number) => {
  const roomDetail = await getChatRoomDetail(roomId);
  
  setChatHeader({
    title: roomDetail.name,
    status: roomDetail.status_message,
    participantCount: roomDetail.participant_info,
    selectedStore: roomDetail.selected_store
  });
};
```

## 🔄 기존 API와의 차이점

| API | 목적 | 데이터 |
|-----|------|--------|
| `GET /api/v1/chats` | 채팅방 목록 조회 | 간단한 목록 정보 |
| `GET /api/v1/chats/{roomId}` | **채팅방 상세 정보 조회** | **상세 정보 + 모집 상태 + 가게 정보** |
| `GET /api/v1/chats/{roomId}/participants` | 참여자 목록 조회 | 참여자 정보 |

## 🚀 클라이언트 구현 예시

### React Hook 예시
```typescript
import { useState, useEffect } from 'react';

const useChatRoomDetail = (roomId: number, token: string) => {
  const [roomDetail, setRoomDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoomDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/chats/${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('채팅방 정보 조회 실패');
      }
      
      const data = await response.json();
      setRoomDetail(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId && token) {
      fetchRoomDetail();
    }
  }, [roomId, token]);

  return { roomDetail, loading, error, refetch: fetchRoomDetail };
};
```

### 정산 조건 확인 예시
```typescript
const PaymentButton = ({ roomId, token }) => {
  const { roomDetail, loading } = useChatRoomDetail(roomId, token);
  
  const canStartPayment = roomDetail && 
    roomDetail.is_recruitment_closed && 
    roomDetail.selected_store;
  
  if (loading) return <div>로딩 중...</div>;
  
  return (
    <button 
      disabled={!canStartPayment}
      onClick={() => startPayment(roomId)}
    >
      정산 시작
    </button>
  );
};
```

## 📝 주의사항

1. **권한 확인**: 해당 채팅방 참여자만 조회 가능
2. **실시간성**: 서버의 최신 정보를 반영하므로 정산 조건 확인에 적합
3. **에러 처리**: 404, 403 등 적절한 에러 처리 필요
4. **캐싱**: 자주 변경되지 않는 정보이므로 클라이언트에서 적절한 캐싱 고려

## 🔧 서버 로그

API 호출 시 서버에서 다음 로그를 확인할 수 있습니다:

```bash
🔍 [API] 채팅방 상세 정보 조회 요청: { user_id: 'test1', roomId: '1', timestamp: '...' }
🔍 [CHAT DETAIL] 채팅방 상세 정보 조회 시작: { user_id: 'test1', room_id: '1' }
✅ [CHAT DETAIL] 채팅방 상세 정보 조회 완료: { chat_room_id: 1, user_id: 'test1', is_host: false, reservation_status: 1, has_selected_store: true }
```

이 API를 통해 정산 시스템의 정확한 조건 검증이 가능합니다! 🎉
