# 📘 API 명세서 - 단체 관람 예약 서비스

## ✅ 공통 정보

* **Base URL**: `/api/v1`
* **인증 방식**: JWT (`Authorization: Bearer <ACCESS_TOKEN>`) 사용 (사용자 아이디 필수 첨부)

---

## 1. 🧾 모임 생성 API

### POST `/reservations`

> 새로운 모임(예약)을 생성합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body (JSON)

```json
{
  "store_id": "store_123" or null,
  "reservation_start_time": "2025-07-28T19:00:00",
  "reservation_end_time": "2025-07-28T21:00:00",
  "reservation_match": "맨시티 vs 첼시" (경기 정보),
  "reservation_bio": "맥주한잔하며 즐겁게 보실분들!" (모임 설명),
  "reservation_max_participant_cnt": 6,
  "reservation_match_category": 1
}
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "reservation_id": 101,
    "created_at": "2025-07-25T00:10:00Z"
  }
}
```

#### Response (400 예시)

```json
{
  "success": false,
  "errorCode": "INVALID_STORE_ID"
}
```

---

## 2. 🙋 모임 참여 API

### POST `/reservations/{reservation_id}/join`

> 사용자가 특정 모임에 참여합니다.

#### Request Body (optional)

* 없음 (토큰에서 user_id 추출) (db에서 reservation_status를 확인후 추가.)

#### Response (200)

```json
{
  "success": true,
  "message": "모임에 참여하였습니다.",
  "participant_cnt": 4
}
```

#### Response (400)

```json
{
  "success": false,
  "errorCode": "INVALID_ACTION"
}
```

#### Response (409)

```json
{
  "success": false,
  "message": "이미 참여 중입니다.",
  "errorCode": "ALREADY_JOINED"
}
```

---

## 3. 🔍 모임 조회 API

### GET `/reservations`

> 조건에 맞는 모임 리스트를 조회합니다.

#### Query Params

| 파라미터      | 설명     | 예시         |
| --------- | ------ | ---------- |
| `region`  | 지역 검색  | 부산         |
| `date`    | 날짜 필터  | 2025-07-28 |
| `category` | 스포츠 카테고리 필터  | 3 |
| `keyword` | 키워드 검색 | 맨시티 |

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 101,
      "store_id": "store_123",
      "reservation_store_name": "스포츠 펍 훈련",
      "reservation_start_time": "2025-07-28T19:00:00",
      "reservation_end_time": "2025-07-28T21:00:00",
      "reservation_bio": "맥주한잔하며 즐겁게 보실분들!",
      "reservation_match": "맨시티 vs 첼시",
      "reservation_status": 0,
      "reservation_participant_cnt": 4,
      "reservation_max_participant_cnt": 6
    }
  ]
}
```

---

## 4. 🏪 가게 관련 API

### 4.1 가게 목록 조회

#### GET `/stores`

> 조건에 맞는 가게 리스트를 조회합니다.

#### Query Params

| 파라미터      | 설명     | 예시         |
| --------- | ------ | ---------- |
| `region`  | 지역 검색  | 부산         |
| `date`    | 날짜 필터  | 2025-07-28 |
| `category` | 스포츠 카테고리 필터  | 3 |
| `keyword` | 키워드 검색 | 축구, 치킨 |

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "store_id": "store_123",
      "store_name": "스포츠 펍 훈련",
      "store_address": "서울특별시 강남구 역삼동",
      "store_phonenumber": "02-1234-5678",
      "store_rating": 5,
      "store_thumbnail": "https://example.com/images/store1.jpg"
    }
  ]
}
```

### 4.2 가게 상세 정보 조회

#### GET `/stores/{storeId}/detail`

> 특정 가게의 상세 정보를 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "store_id": "store_123",
    "store_name": "스포츠 펍 훈련",
    "store_address": "서울특별시 강남구 역삼동",
    "store_bio": "축구 모임 전문점입니다!",
    "store_open_hour": 9,
    "store_close_hour": 22,
    "store_holiday": 0,
    "store_max_people_cnt": 50,
    "store_max_table_cnt": 10,
    "store_max_parking_cnt": 20,
    "store_max_screen_cnt": 5,
    "store_phonenumber": "02-1234-5678",
    "store_thumbnail": "https://example.com/images/store1.jpg",
    "store_review_cnt": 0,
    "store_rating": 5,
    "bank_code": "001",
    "account_number": "123-456789-01-234",
    "account_holder_name": "김스포츠",
    "business_number": "123-45-67890"
  }
}
```

#### Response (404)

```json
{
  "success": false,
  "message": "가게를 찾을 수 없습니다."
}
```

### 4.3 가게 결제 정보 조회

#### GET `/stores/{storeId}/payment-info`

> 특정 가게의 결제 정보를 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "store_id": "store_123",
    "bank_code": "001",
    "account_number": "123-456789-01-234",
    "account_holder_name": "김스포츠",
    "business_number": "123-45-67890"
  }
}
```

#### Response (404)

```json
{
  "success": false,
  "message": "가게를 찾을 수 없습니다."
}
```

### 4.4 가게 결제 정보 수정

#### PUT `/stores/{storeId}/payment-info`

> 특정 가게의 결제 정보를 수정합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수
* Content-Type: application/json

#### Request Body (JSON)

```json
{
  "bank_code": "004",
  "account_number": "123-456789-01-234",
  "account_holder_name": "김스포츠",
  "business_number": "123-45-67890"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "결제 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "bank_code": "004",
    "account_number": "123-456789-01-234",
    "account_holder_name": "김스포츠",
    "business_number": "123-45-67890"
  }
}
```

#### Response (400)

```json
{
  "success": false,
  "message": "은행 코드, 계좌번호, 예금주명은 필수입니다."
}
```

#### Response (404)

```json
{
  "success": false,
  "message": "가게를 찾을 수 없습니다."
}
```

### 4.5 은행 코드 목록 조회

#### GET `/stores/banks`

> 사용 가능한 은행 코드 목록을 조회합니다.

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "bank_code": "001",
      "bank_name": "한국은행"
    },
    {
      "bank_code": "004",
      "bank_name": "국민은행"
    },
    {
      "bank_code": "005",
      "bank_name": "하나은행"
    },
    {
      "bank_code": "006",
      "bank_name": "신한은행"
    },
    {
      "bank_code": "007",
      "bank_name": "우리은행"
    },
    {
      "bank_code": "008",
      "bank_name": "농협은행"
    },
    {
      "bank_code": "009",
      "bank_name": "수협은행"
    },
    {
      "bank_code": "010",
      "bank_name": "케이뱅크"
    },
    {
      "bank_code": "011",
      "bank_name": "카카오뱅크"
    }
  ]
}
```

---

## 5. 💰 결제 관련 API

### 5.1 방장의 예약금 결제 요청

#### POST `/chats/{roomId}/payments/request`

> 방장이 채팅방 내에서 참여자들에게 예약금 결제 요청을 보냅니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 (방장 권한 확인)

#### Request Body (JSON)

```json
{
  "amount": 5000,
  "message": "모임 확정을 위해 예약금을 결제해주세요!"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "예약금 결제 요청 메시지가 발송되었습니다.",
  "data": {
    "payment_request_id": 1,
    "amount": 5000,
    "message": "모임 확정을 위해 예약금을 결제해주세요!"
  }
}
```

### 5.2 결제 상태 확인

#### GET `/chats/{roomId}/payments/status`

> 채팅방의 결제 요청 및 결제 상태를 확인합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "payment_requests": [
      {
        "payment_request_id": 1,
        "amount": 5000,
        "message": "모임 확정을 위해 예약금을 결제해주세요!",
        "request_time": "2025-07-30T15:30:00",
        "status": "pending",
        "requester_name": "홍길동"
      }
    ],
    "user_payments": [
      {
        "payment_id": 1,
        "payment_amount": 5000,
        "payment_method": "card",
        "payment_status": "completed",
        "payment_time": "2025-07-30T15:35:00"
      }
    ]
  }
}
```

### 5.3 결제 처리

#### POST `/chats/{roomId}/payments/process`

> 참여자가 결제를 처리합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body (JSON)

```json
{
  "payment_method": "card",
  "payment_amount": 5000
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "결제가 완료되었습니다.",
  "data": {
    "payment_id": 1,
    "payment_amount": 5000,
    "payment_method": "card",
    "payment_status": "completed"
  }
}
```

### 5.4 결제 미완료 참가자 강퇴

#### DELETE `/chats/{roomId}/participants/{userId}`

> 방장이 결제 기한이 지난 참가자를 채팅방에서 강퇴시킵니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 (방장 권한 확인)

#### Response (200)

```json
{
  "success": true,
  "message": "참가자가 성공적으로 강퇴되었습니다.",
  "data": {
    "kicked_user_id": "testuser123",
    "reason": "payment_not_completed"
  }
}
```

---

## 6. 💬 채팅 관련 API

### 6.1 채팅방 목록 조회

#### GET `/chats`

> 사용자가 참여한 채팅방 목록을 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "chat_room_id": "13",
      "name": "축구 모임",
      "last_message": "💰 예약금 결제 요청: 5000원 - 모임 확정을 위해 예약금을 결제해주세요!",
      "last_message_time": "2025-07-30T15:30:00",
      "sender_id": "testid2"
    }
  ]
}
```

### 6.2 채팅방 나가기

#### DELETE `/chats/{roomId}/leave`

> 사용자가 채팅방에서 나갑니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "message": "채팅방을 나갔습니다"
}
```

### 6.3 채팅방 상태 변경

#### PATCH `/chats/{roomId}/status`

> 채팅방의 상태를 변경합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body (JSON)

```json
{
  "status": "completed"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "채팅방 상태가 예약완료로 변경되었습니다"
}
```

### 6.4 채팅방 유저 강퇴

#### DELETE `/chats/{roomId}/kick/{userId}`

> 방장이 채팅방에서 특정 유저를 강퇴시킵니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 (방장 권한 확인)

#### Response (200)

```json
{
  "success": true,
  "message": "유저를 채팅방에서 강퇴했습니다"
}
```

### 6.5 채팅방 전체 메시지 조회

#### GET `/chats/{roomId}/all-messages`

> 채팅방의 전체 메시지를 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sender_id": "testid2",
      "message": "💰 예약금 결제 요청: 5000원 - 모임 확정을 위해 예약금을 결제해주세요!",
      "created_at": "2025-07-30T15:30:00",
      "read_count": 3
    }
  ]
}
```

---

## 7. 👤 사용자 관련 API

### 7.1 유저 정보 조회

#### GET `/users/{userId}/profile`

> 특정 사용자의 프로필 정보를 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "user_id": "testuser123",
    "nickname": "홍길동",
    "profile_image_url": "https://example.com/images/profile.jpg"
  }
}
```

### 7.2 마이페이지 정보 조회

#### GET `/users/me`

> 현재 로그인한 사용자의 마이페이지 정보를 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "user_id": "testuser123",
    "user_name": "홍길동",
    "user_email": "test@example.com",
    "user_region": "서울",
    "user_gender": 1,
    "user_phone_number": "010-1234-5678",
    "user_thumbnail": "https://example.com/images/profile.jpg"
  }
}
```

### 7.3 프로필 수정

#### PUT `/users/me`

> 현재 로그인한 사용자의 프로필을 수정합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수
* Content-Type: application/json

#### Request Body (JSON)

```json
{
  "user_name": "홍길동",
  "user_region": "서울",
  "user_phone_number": "010-1234-5678",
  "user_thumbnail": "https://example.com/images/profile.jpg"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "프로필이 수정되었습니다."
}
```

### 7.4 비밀번호 변경

#### PUT `/users/me/password`

> 현재 로그인한 사용자의 비밀번호를 변경합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수
* Content-Type: application/json

#### Request Body (JSON)

```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다."
}
```

#### Response (400)

```json
{
  "success": false,
  "message": "기존 비밀번호가 일치하지 않습니다."
}
```

---

## 8. 📝 리뷰 관련 API

### 8.1 리뷰 작성

#### POST `/reviews`

> 가게에 대한 리뷰를 작성합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수
* Content-Type: application/json

#### Request Body (JSON)

```json
{
  "store_id": "store_123",
  "review_text": "정말 좋은 가게였습니다!",
  "review_rating": 5,
  "review_visited_time": "2025-07-28T19:00:00",
  "images": [
    "https://example.com/images/review1.jpg",
    "https://example.com/images/review2.jpg"
  ]
}
```

#### Response (201)

```json
{
  "success": true,
  "data": {
    "review_id": 1
  }
}
```

---

## 9. 🔍 에러 응답

### 공통 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지",
  "errorCode": "ERROR_CODE"
}
```

### 주요 에러 코드

| 에러 코드 | 설명 | HTTP 상태 코드 |
|---------|------|---------------|
| `INVALID_TOKEN` | 유효하지 않은 토큰 | 401 |
| `FORBIDDEN` | 권한 없음 | 403 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 | 404 |
| `INVALID_ACTION` | 잘못된 요청 | 400 |
| `ALREADY_JOINED` | 이미 참여 중 | 409 |
| `PAYMENT_COMPLETED` | 결제 완료된 사용자 | 400 |
| `PARTICIPANT_NOT_FOUND` | 참가자를 찾을 수 없음 | 404 |

---

## 10. 📊 데이터 타입

### 날짜/시간 형식
- ISO 8601 형식 사용: `YYYY-MM-DDTHH:mm:ss`
- 예시: `2025-07-28T19:00:00`

### 상태 코드
- `0`: 대기중
- `1`: 완료/확정
- `2`: 취소

### 결제 상태
- `pending`: 대기중
- `completed`: 완료
- `failed`: 실패
- `refunded`: 환불

### 결제 방법
- `card`: 카드
- `bank_transfer`: 계좌이체
- `cash`: 현금
- `mobile_payment`: 모바일 결제