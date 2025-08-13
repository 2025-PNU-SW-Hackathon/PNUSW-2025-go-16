# 🏪 모이GO API 명세서

## 📋 목차
1. [사용자 인증](#사용자-인증)
2. [매장 관리](#매장-관리)
3. [예약 시스템](#예약-시스템)
4. [결제 시스템](#결제-시스템)
5. [채팅 시스템](#채팅-시스템)

---

## 🔐 사용자 인증

### 1.1 일반 사용자 회원가입
- **URL**: `POST /api/v1/users/register`
- **설명**: 새로운 사용자를 등록합니다.
- **Request Body**:
```json
{
  "user_id": "testuser123",
  "user_pwd": "password123",
  "user_email": "test@example.com",
  "user_name": "홍길동",
  "user_phone_number": "010-1234-5678",
  "user_region": "서울",
  "user_gender": 1
}
```
- **Response**:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user_id": "testuser123",
    "user_name": "홍길동"
  }
}
```

### 1.2 일반 사용자 로그인
- **URL**: `POST /api/v1/users/login`
- **설명**: 사용자 로그인을 수행합니다.
- **Request Body**:
```json
{
  "user_id": "testuser123",
  "user_pwd": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "testuser123",
      "user_name": "홍길동"
    }
  }
}
```

### 1.3 사장님 회원가입
- **URL**: `POST /api/v1/users/store/register`
- **설명**: 새로운 매장을 등록합니다.
- **Request Body**:
```json
{
  "store_id": "store_123",
  "store_pwd": "storepass123",
  "store_name": "챔피언 스포츠 펍",
  "business_number": "123-45-67890",
  "store_address": "서울시 강남구 역삼동 123-45",
  "store_phonenumber": "02-1234-5678",
  "store_bio": "강남역 근처에 위치한 스포츠 전문 바입니다.",
  "store_open_hour": 18,
  "store_close_hour": 24
}
```
- **Response**:
```json
{
  "success": true,
  "message": "사장님 회원가입이 완료되었습니다.",
  "data": {
    "store_id": "store_123",
    "store_name": "챔피언 스포츠 펍",
    "business_number": "123-45-67890"
  }
}
```

### 1.4 사장님 로그인
- **URL**: `POST /api/v1/users/store/login`
- **설명**: 매장 로그인을 수행합니다.
- **Request Body**:
```json
{
  "store_id": "store_123",
  "store_pwd": "storepass123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "사장님 로그인 성공",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "store": {
      "store_id": "store_123",
      "store_name": "챔피언 스포츠 펍",
      "business_number": "123-45-67890",
      "store_address": "서울시 강남구 역삼동 123-45"
    }
  }
}
```

---

## 🏪 매장 관리

### 2.1 매장 목록 조회
- **URL**: `GET /api/v1/stores`
- **설명**: 필터링 조건에 따라 매장 목록을 조회합니다.
- **Query Parameters**:
  - `region`: 지역 검색 (예: "부산")
  - `date`: 날짜 필터 (예: "2025-07-28")
  - `category`: 스포츠 카테고리 필터 (예: 3)
  - `keyword`: 키워드 검색 (예: "영화, 치킨")
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "store_id": "store_123",
      "store_name": "챔피언 스포츠 펍",
      "store_address": "서울특별시 강남구 역삼동",
      "store_phonenumber": "02-1234-5678",
      "store_rating": 4.5,
      "store_thumbnail": "https://example.com/images/store1.jpg"
    }
  ]
}
```

### 2.2 매장 상세 정보 조회
- **URL**: `GET /api/v1/stores/{storeId}/detail`
- **설명**: 특정 매장의 상세 정보를 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": {
    "store_id": "store_123",
    "store_name": "챔피언 스포츠 펍",
    "store_address": "서울시 강남구 역삼동 123-45",
    "store_bio": "강남역 근처에 위치한 스포츠 전문 바입니다.",
    "store_phonenumber": "02-1234-5678",
    "store_rating": 4.5,
    "store_thumbnail": "https://example.com/images/store1.jpg"
  }
}
```

### 2.3 🆕 매장 정보 조회 (사장님 전용)
- **URL**: `GET /api/v1/stores/me`
- **설명**: 사장님의 가게에 대한 모든 설정 정보를 한 번에 불러옵니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "store_info": {
      "store_name": "챔피언 스포츠 펍",
      "address_main": "강남역 2번 출구 도보 3분",
      "address_detail": "상세 주소",
      "phone_number": "02-1234-5678",
      "business_reg_no": "123-45-67890",
      "owner_name": "김철수",
      "email": "sportsclub@example.com",
      "bio": "강남역 근처에 위치한 스포츠 전문 바입니다.",
      "menu": [
        { "name": "치킨 세트", "price": 28000, "description": "바삭한 치킨..." },
        { "name": "수제 맥주 세트", "price": 25000, "description": "프리미엄 수제 맥주..." }
      ],
      "facilities": {
        "wifi": true, "parking": true, "restroom": true, "no_smoking": true,
        "sound_system": true, "private_room": false, "tv_screen": true, "booth_seating": true
      },
      "photos": [
        "https://cdn.example.com/photos/store1.jpg",
        "https://cdn.example.com/photos/store2.jpg"
      ],
      "sports_categories": ["축구", "야구", "농구"]
    },
    "reservation_settings": {
      "cancellation_policy": "취소/환불 규정",
      "deposit_amount": 5000,
      "available_times": [
        { "day": "MON", "start": "18:00", "end": "24:00" },
        { "day": "TUE", "start": "18:00", "end": "24:00" }
      ]
    },
    "notification_settings": {
      "reservation_alerts": true,
      "payment_alerts": true,
      "system_alerts": true,
      "marketing_alerts": false
    },
    "payment_info": {
      "bank_account_number": "123-456-7890",
      "bank_name": "국민은행"
    }
  }
}
```

### 2.4 🆕 매장 기본 정보 수정 (사장님 전용)
- **URL**: `PUT /api/v1/stores/me/basic-info`
- **설명**: 매장의 기본 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "store_name": "챔피언 스포츠 펍",
  "address_main": "강남역 2번 출구 도보 3분",
  "address_detail": "상세 주소",
  "phone_number": "02-1234-5678",
  "business_reg_no": "123-45-67890",
  "owner_name": "김철수",
  "email": "sportsclub@example.com",
  "bio": "강남역 근처에 위치한 스포츠 전문 바입니다."
}
```
- **Response**:
```json
{
  "success": true,
  "message": "매장 기본 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "store_name": "챔피언 스포츠 펍",
    "address_main": "강남역 2번 출구 도보 3분",
    "phone_number": "02-1234-5678"
  }
}
```

### 2.5 🆕 매장 상세 정보 수정 (사장님 전용)
- **URL**: `PUT /api/v1/stores/me/details`
- **설명**: 매장의 상세 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "menu": [
    { "name": "치킨 세트", "price": 28000, "description": "바삭한 치킨..." }
  ],
  "facilities": {
    "wifi": true, "parking": true, "restroom": true, "no_smoking": true
  },
  "photos": [
    "https://cdn.example.com/photos/store1.jpg",
    "https://cdn.example.com/photos/store2.jpg"
  ],
  "sports_categories": ["축구", "농구"]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "매장 상세 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "menu": [...],
    "facilities": {...},
    "photos": [...],
    "sports_categories": [...]
  }
}
```

### 2.6 🆕 예약 설정 수정 (사장님 전용)
- **URL**: `PUT /api/v1/stores/me/settings/reservation`
- **설명**: 매장의 예약 설정을 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "cancellation_policy": "새로운 취소/환불 규정",
  "deposit_amount": 10000,
  "available_times": [
    { "day": "MON", "start": "17:00", "end": "23:00" }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "예약 설정이 수정되었습니다.",
  "data": {
    "cancellation_policy": "새로운 취소/환불 규정",
    "deposit_amount": 10000,
    "available_times": [...]
  }
}
```

### 2.7 매장 결제 정보 조회
- **URL**: `GET /api/v1/stores/{storeId}/payment-info`
- **설명**: 특정 매장의 결제 정보를 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": {
    "store_id": "store_123",
    "bank_code": "004",
    "account_number": "123-456-7890",
    "account_holder_name": "김철수",
    "business_number": "123-45-67890"
  }
}
```

### 2.8 매장 결제 정보 수정
- **URL**: `PUT /api/v1/stores/{storeId}/payment-info`
- **설명**: 특정 매장의 결제 정보를 수정합니다.
- **Request Body**:
```json
{
  "bank_code": "004",
  "account_number": "123-456-7890",
  "account_holder_name": "김철수",
  "business_number": "123-45-67890"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "결제 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "bank_code": "004",
    "account_number": "123-456-7890",
    "account_holder_name": "김철수",
    "business_number": "123-45-67890"
  }
}
```

### 2.9 은행 코드 목록 조회
- **URL**: `GET /api/v1/stores/banks`
- **설명**: 사용 가능한 은행 코드 목록을 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": [
    { "bank_code": "001", "bank_name": "한국은행" },
    { "bank_code": "004", "bank_name": "국민은행" },
    { "bank_code": "005", "bank_name": "하나은행" }
  ]
}
```

---

## 📅 예약 시스템

### 3.1 모임 생성
- **URL**: `POST /reservations`
- **설명**: 새로운 모임을 생성합니다.
- **Request Body**:
```json
{
  "reservation_match_category": 1,
  "reservation_match_name": "축구 모임",
  "reservation_start_time": "2025-01-20 19:00:00",
  "reservation_end_time": "2025-01-20 22:00:00",
  "reservation_max_people": 10,
  "reservation_deposit": 5000,
  "reservation_description": "축구 보면서 치킨 먹는 모임입니다."
}
```
- **Response**:
```json
{
  "success": true,
  "message": "모임이 생성되었습니다.",
  "data": {
    "reservation_id": 1,
    "reservation_match_name": "축구 모임"
  }
}
```

### 3.2 모임 참여
- **URL**: `POST /reservations/{id}/join`
- **설명**: 기존 모임에 참여합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "모임에 참여했습니다.",
  "data": {
    "reservation_id": 1,
    "user_id": "testuser123"
  }
}
```

### 3.3 모임 조회
- **URL**: `GET /reservations`
- **설명**: 모든 모임 목록을 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 1,
      "reservation_match_name": "축구 모임",
      "reservation_start_time": "2025-01-20 19:00:00",
      "reservation_max_people": 10,
      "reservation_current_people": 5
    }
  ]
}
```

### 3.4 모임 상세 조회
- **URL**: `GET /reservations/{id}`
- **설명**: 특정 모임의 상세 정보를 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": {
    "reservation_id": 1,
    "reservation_match_name": "축구 모임",
    "reservation_start_time": "2025-01-20 19:00:00",
    "reservation_end_time": "2025-01-20 22:00:00",
    "reservation_max_people": 10,
    "reservation_current_people": 5,
    "reservation_deposit": 5000,
    "reservation_description": "축구 보면서 치킨 먹는 모임입니다."
  }
}
```

### 3.5 내 예약 조회
- **URL**: `GET /api/v1/users/me/reservations`
- **설명**: 현재 사용자가 참여 중인 예약을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 1,
      "reservation_match_name": "축구 모임",
      "reservation_start_time": "2025-01-20 19:00:00",
      "reservation_status": 0
    }
  ]
}
```

### 3.6 내 매칭 조회
- **URL**: `GET /api/v1/users/me/matchings`
- **설명**: 현재 사용자가 참여 완료한 매칭을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 2,
      "reservation_match_name": "야구 모임",
      "reservation_start_time": "2025-01-15 19:00:00",
      "reservation_status": 1
    }
  ]
}
```
---

## 💬 채팅 시스템

### 5.1 채팅방 목록 조회
- **URL**: `GET /api/v1/chats/rooms`
- **설명**: 사용자가 참여 중인 채팅방 목록을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "room_id": 1,
      "room_name": "축구 모임",
      "last_message": "안녕하세요!",
      "last_message_time": "2025-01-18 20:30:00",
      "unread_count": 3
    }
  ]
}
```

### (안써도 됨)
### 5.2 채팅방 입장
- **URL**: `POST /api/v1/chats/rooms/{roomId}/enter`
- **설명**: 채팅방에 입장합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "채팅방에 입장했습니다.",
  "data": {
    "room_id": 1,
    "room_name": "축구 모임"
  }
}
```

### 5.3 채팅방 나가기
- **URL**: `DELETE /api/v1/chats/rooms/{roomId}/leave`
- **설명**: 채팅방에서 나갑니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "채팅방에서 나갔습니다."
}
```

### (상태는 자동변경 사용)
### 5.4 채팅방 상태 변경
- **URL**: `PUT /api/v1/chats/rooms/{roomId}/status`
- **설명**: 채팅방의 상태를 변경합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "status": "active"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "채팅방 상태가 변경되었습니다.",
  "data": {
    "room_id": 1,
    "status": "active"
  }
}
```

### 5.5 채팅방 강퇴
- **URL**: `DELETE /api/v1/chats/rooms/:roomId/kick/:userId`
- **설명**: 채팅방에서 특정 참가자를 강퇴시킵니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "참가자가 강퇴되었습니다."
}
```

### 5.6 모든 메시지 조회
- **URL**: `GET /api/v1/chats/rooms/{roomId}/messages`
- **설명**: 채팅방의 모든 메시지를 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "message_id": 1,
      "user_id": "user1",
      "user_name": "김철수",
      "message": "안녕하세요!",
      "message_type": "text",
      "created_at": "2025-01-18 20:30:00"
    }
  ]
}
```

---

## 📝 사용자 관리

### 6.1 내 프로필 조회
- **URL**: `GET /api/v1/users/me`
- **설명**: 현재 사용자의 프로필 정보를 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "user_id": "testuser123",
    "user_name": "홍길동",
    "user_email": "test@example.com",
    "user_phone_number": "010-1234-5678",
    "user_region": "서울",
    "user_gender": 1
  }
}
```

### 6.2 프로필 수정
- **URL**: `PUT /api/v1/users/me`
- **설명**: 현재 사용자의 프로필 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "user_name": "홍길동",
  "user_email": "newemail@example.com",
  "user_phone_number": "010-9876-5432",
  "user_region": "부산"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "프로필이 수정되었습니다.",
  "data": {
    "user_id": "testuser123",
    "user_name": "홍길동"
  }
}
```

### 6.3 비밀번호 변경
- **URL**: `PUT /api/v1/users/me/password`
- **설명**: 현재 사용자의 비밀번호를 변경합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

### 6.4 사용자 프로필 조회
- **URL**: `GET /api/v1/users/{userId}/profile`
- **설명**: 특정 사용자의 프로필 정보를 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "user_name": "김철수",
    "user_region": "서울",
    "user_gender": 1
  }
}
```

### 7.1 전체 매치 조회

# 🏟️ 경기 목록 조회 API 명세서

**Base URL**: `/api/v1`  
**인증**: 공개 조회(기본 불필요) ※ 필요 시 `Authorization: Bearer <JWT>`

> `matches` 테이블 기반의 **전체 경기 목록 조회** API입니다.

---

## GET `/api/v1/matches`

조건에 맞는 경기 리스트를 조회합니다.

### Query Parameters

| 이름 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `competition_code` | string | `EPL` | 대회 코드(정확히 일치) |
| `status` | string | `SCHEDULED`,`LIVE`,`FINISHED`,`POSTPONED` | 경기 상태 필터 |
| `date_from` | datetime | `2025-09-01T00:00:00Z` | 경기일 시작(이상) |
| `date_to` | datetime | `2025-09-30T23:59:59Z` | 경기일 종료(이하) |
| `home` | string | `Manchester` | 홈팀 **부분 검색** |
| `away` | string | `Chelsea` | 원정팀 **부분 검색** |
| `venue` | string | `Etihad` | 경기장 **부분 검색** |
| `category` | int | `1` | 카테고리 일치 |
| `sort` | string | `match_date:asc` | 정렬(필드: `match_date`,`id` / 방향: `asc \| desc`) |
| `page` | int | `1` | 페이지 번호(기본 1) |
| `page_size` | int | `20` | 페이지 크기(기본 20, 최대 100 권장) |

> 날짜 형식은 **ISO 8601** 권장(`YYYY-MM-DDTHH:mm:ssZ`). 서비스 정책에 따라 `YYYY-MM-DD HH:mm:ss`도 허용 가능(응답은 ISO 권장).

---

### Response (200)

```json
{
  "success": true,
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 235,
    "total_pages": 12,
    "sort": "match_date:asc",
    "filters": {
      "competition_code": "EPL",
      "date_from": "2025-09-01T00:00:00Z",
      "date_to": "2025-09-30T23:59:59Z",
      "status": "SCHEDULED"
    }
  },
  "data": [
    {
      "id": 12345,
      "competition_code": "EPL",
      "match_date": "2025-09-01T19:00:00Z",
      "status": "SCHEDULED",
      "home_team": "Manchester City",
      "away_team": "Chelsea",
      "venue": "Etihad Stadium",
      "category": 1
    },
    {
      "id": 12346,
      "competition_code": "EPL",
      "match_date": "2025-09-02T19:00:00Z",
      "status": "SCHEDULED",
      "home_team": "Arsenal",
      "away_team": "Liverpool",
      "venue": "Emirates Stadium",
      "category": 1
    }
  ]
}
```

---

### Response (400)

```json
{
  "success": false,
  "errorCode": "INVALID_PARAMETER",
  "message": "date_from은 date_to보다 이전이어야 합니다."
}
```

### Response (500)

```json
{
  "success": false,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "message": "서버 내부 오류가 발생했습니다."
}
```

---

## 필드 정의

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | int | 경기 고유 ID (PK) |
| `competition_code` | string(10) | 대회 코드 (예: EPL, UCL 등) |
| `match_date` | datetime | 경기 시작 일시 (UTC 권장) |
| `status` | string(20) | `SCHEDULED`,`LIVE`,`FINISHED`,`POSTPONED` 등 |
| `home_team` | string(100) | 홈 팀명 |
| `away_team` | string(100) | 원정 팀명 |
| `venue` | string(255) | 경기장 |
| `category` | int | 서비스 내 분류 값 |

---

## 예시 요청

**EPL 9월 예정 경기만, 날짜 오름차순 1페이지(50개)**  
```
GET /api/v1/matches?competition_code=EPL&status=SCHEDULED&date_from=2025-09-01T00:00:00Z&date_to=2025-09-30T23:59:59Z&sort=match_date:asc&page=1&page_size=50
```

**맨시티가 홈인 경기 검색**  
```
GET /api/v1/matches?home=Manchester%20City
```

**경기장에 ‘Park’가 포함된 모든 경기 최신순**  
```
GET /api/v1/matches?venue=Park&sort=match_date:desc
```

---

## 응답 규칙

- 성공: `{ "success": true, "data": [...] , "meta": {...} }`
- 실패: `{ "success": false, "errorCode": "...", "message": "..." }`



---

## 🔧 에러 코드

### 공통 에러 응답 형식
```json
{
  "success": false,
  "message": "에러 메시지",
  "error_code": "ERROR_CODE"
}
```

### 주요 에러 코드
- `UNAUTHORIZED`: 인증이 필요합니다.
- `FORBIDDEN`: 접근 권한이 없습니다.
- `NOT_FOUND`: 리소스를 찾을 수 없습니다.
- `VALIDATION_ERROR`: 입력 데이터가 유효하지 않습니다.
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류가 발생했습니다.

---

## 📚 참고사항

1. **인증**: JWT 토큰이 필요한 API는 `Authorization: Bearer <JWT>` 헤더를 포함해야 합니다.
2. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD HH:mm:ss` 형식을 사용합니다.
3. **페이지네이션**: 목록 조회 API는 필요에 따라 페이지네이션을 지원할 수 있습니다.
4. **실시간 통신**: 채팅 기능은 WebSocket을 통해 실시간으로 동작합니다.
