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
| `keyword` | 키워드 검색 | 영화, 치킨     |

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 101,
      "store_id": "store_123",
      "store_name": "store_name",
      "reservation_start_time": "2025-07-28T19:00:00",
      "reservation_end_time": "2025-07-28T21:00:00",
      "reservation_bio": "부산 서면 메가박스에서 영화 보고 밥까지!",
      "reservation_match": "첼시 vs 맨시티",
      "reservation_status": 0 or 1,
      "reservation_participant_cnt": 4,
      "reservation_max_participant_cnt": 6
    }
  ]
}
```

#### Response (409 예시)

```json
{
  "success": false,
  "errorCode": "INVALID_PARAMETER"
}
```

```

#### Response (409 예시)

```json
{
  "success": false,
  "errorCode": "INVALID_PARAMETER"
}
```

---

## 4. ❌ 모집 취소 API

### DELETE `/reservations/{reservation_id}`

> 사용자가 자신이 만든 모임의 모집을 취소합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "message": "모임이 정상적으로 취소되었습니다."
}
```

#### Response (403)

```json
{
  "success": false,
  "errorCode": "FORBIDDEN"
}
```

#### Response (404)

```json
{
  "success": false,
  "errorCode": "RESERVATION_NOT_FOUND"
}
```

---

## 5. 📋 예약 현황 조회 API

### GET `/reservations/{reservation_id}`

> 특정 모임의 상세 예약 현황을 확인합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "reservation_id": 101,
    "store_id": "store_123",
    "store_name": "가게 이름",
    "reservation_start_time": "2025-07-28T19:00:00",
    "reservation_end_time": "2025-07-28T21:00:00",
    "reservation_match": "첼시 vs 맨시티",
    "reservation_bio": "친목 모임입니다",
    "reservation_status": 1,
    "reservation_participant_cnt": 5,
    "reservation_max_participant_cnt": 6,
    "participants": [
      { "user_id": "user1", "user_name": "홍길동" },
      { "user_id": "user2", "user_name": "김영희" }
    ]
  }
}
```

---

## 6. ✍️ 리뷰 작성 API

### POST `/reviews`

> 특정 가게에 대한 리뷰를 작성합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body (JSON)

```json
{
  "store_id": "store_123",
  "review_text": "너무 맛있고 분위기도 좋았어요!",
  "review_rating": 5,
  "review_visited_time": "2025-07-27T19:00:00",
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### Response (201)

```json
{
  "success": true,
  "data": {
    "review_id": 301
  }
}
```

---

## 7. 🧾 내 리뷰 목록 조회 API

### GET `/users/me/reviews`

> 사용자가 작성한 리뷰들을 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "review_id": 301,
      "store_id": "store_123",
      "store_name": "한신포차",
      "review_text": "재밌게 봤어요!",
      "review_rating": 4,
      "review_created_time": "2025-07-28T22:00:00"
    }
  ]
}
```

---

## 8. 👤 마이페이지 정보 조회 API

### GET `/users/me`

> 사용자 본인의 정보를 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "user_name": "홍길동",
    "user_email": "hong@example.com",
    "user_region": "부산",
    "user_gender": 1,
    "user_phone_number": "010-1234-5678",
    "user_thumbnail": "profile.jpg"
  }
}
```

---

## 9-1. 📖 참여 완료된 매칭 이력 조회 API

### GET `/users/me/matchings`

> 내가 참여한 모임 이력을 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 16,
      "store_id": "store_123",
      "reservation_start_time": "2025-08-10T10:00:00.000Z",
      "reservation_end_time": "2025-08-10T12:00:00.000Z",
      "reservation_bio": "치킨에 맥주까지 마시면서 친해져요!",
      "reservation_match": "맨시티 vs 첼시",
      "reservation_status": 0,
      "reservation_participant_cnt": 1,
      "reservation_max_participant_cnt": 6
    }
  ]
}
```

## 9-2. 📖 참여중인 매칭 이력 조회 API

### GET `/users/me/reservations`

> 내가 참여중인 시작되지 않은 모임 이력을 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 16,
      "store_id": "store_123",
      "reservation_start_time": "2025-08-10T10:00:00.000Z",
      "reservation_end_time": "2025-08-10T12:00:00.000Z",
      "reservation_bio": "치킨에 맥주까지 마시면서 친해져요!",
      "reservation_match": "맨시티 vs 첼시",
      "reservation_status": 0,
      "reservation_participant_cnt": 1,
      "reservation_max_participant_cnt": 6
    }
  ]
}
```

---

## 10. 🛠️ 프로필 수정 API

### PUT `/users/me`

> 사용자 프로필 정보를 수정합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body (JSON)

```json
{
  "user_name": "홍길동",
  "user_region": "서울",
  "user_phone_number": "010-1234-5678",
  "user_thumbnail": "profile_new.jpg"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "프로필이 수정되었습니다."
}
```

---

## 11. 🔐 비밀번호 변경 API

### PUT `/users/me/password`

> 사용자의 비밀번호를 변경합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body (JSON)

```json
{
  "old_password": "123456",
  "new_password": "newpass789"
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
  "errorCode": "WRONG_PASSWORD"
}
```

## 12. 💬 채팅 기능 API

### 12.1. 채팅방 목록 조회 API

**GET** `/chat/rooms`

> 유저가 참여 중인 채팅방 목록을 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "chat_room_id": 12,
      "chat_room_name": "부산 직관 모임",
      "last_message": "그럼 7시에 만날까요?",
      "last_message_time": "2025-07-30T20:15:00"
    },
  ]
}
```

---

### 12.2. 채팅방 나가기 API

**DELETE** `/chat/rooms/:roomId/leave`

> 유저가 특정 채팅방에서 나갑니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "message": "채팅방을 나갔습니다"
}
```

---

### 12.3. 채팅방 상태 변경 API

**PATCH** `/chat/rooms/:roomId/status`

> 채팅방 상태를 변경합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body

```json
{
  "status": 2
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "채팅방 상태가 예약완료로 변경되었습니다"
}
```

---

### 12.4. 채팅방 강퇴 API

**DELETE** `/chat/rooms/:roomId/kick/:userId`

> 방장이 특정 유저를 채팅방에서 강퇴합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "message": "유저를 채팅방에서 강퇴했습니다"
}
```

---

### 12.5. 유저 정보 조회 API

**GET** `/users/:userId/profile`

> 유저의 닉네임과 프로필 사진을 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": {
    "user_id": "yejun",
    "nickname": "축구사랑러",
    "profile_image_url": "https://cdn.example.com/profiles/12.jpg"
  }
}
```

---

### 12.6. 채팅방 전체 메시지 조회 API

**GET** `/chat/rooms/:roomId/all-messages`

> 채팅방 내 모든 메시지를 최신순으로 조회합니다.  
> 채팅 화면 진입 시 호출되며, 자동으로 읽음 처리됩니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "message_id": 345,
      "sender_id": 3,
      "message": "안녕하세요!",
      "created_at": "2025-07-30T20:15:00",
      "read_count": 3
    },
  ]
}
```

### 12.6. 채팅방 생성 기능

**POST** `/chat/rooms/enter`

>>채팅방 생성 기능

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body

```json
{
  "group_id": 101
}
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "chat_room_id": 12,
    "message": "입장 완료"
  }
}
```

#### Response (400)

```json
{
  "success": false,
  "errorCode": "INVALID_RESERVATION_ID",
  "message": "존재하지 않는 모임입니다."
}
```

#### Response (403)

```json
{
  "success": false,
  "errorCode": "NOT_A_PARTICIPANT",
  "message": "모임 참여자만 채팅방에 입장할 수 있습니다."
}
```

---

## 13. 💰 채팅방 결제/예약 관련 기능 API


### 13.1. 방장의 예약금 결제 요청 API

**POST** `/chat/rooms/{roomId}/payments/request`

> 모임의 방장이 채팅방 내에서 참여자들에게 예약금 결제 요청을 보냅니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 (방장 권한 확인)

#### Request Body

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
  "message": "예약금 결제 요청 메시지가 발송되었습니다."
}
```

---

### 13.2. 예약금 결제 시작 API 

**POST** `/chat/rooms/{roomId}/payments/initiate`

> 사용자가 채팅방 내에서 결제 버튼을 눌러 PG(결제대행사) 호출에 필요한 정보를 서버로부터 받습니다

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body

```json
{
  "amount": 5000,
  "payment_method": "KAKAO_PAY"
}
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "order_id": "ORD-20250728-12345",
    "payment_gateway_url": "https://pg.kakaopay.com/v1/order/123456789...",
    "product_name": "[맨시티 vs 첼시] 모임 예약금"
  }
}
```

---

### 13.3. 결제 결과 콜백/알림 API

**POST** `/api/payments/callback`

> 사용자가 PG사에서 결제를 완료하면, PG사가 이 결과를 백엔드 서버로 통보합니다. (PG사 -> 서버)

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 

#### Request Body

```json
{
    "tid": "T1234567890", // 트랜잭션 ID
    "order_id": "ORD_20250730_001",
    "status": "SUCCESS", 
    "amount": 5000,
    "payload": "{...}" 
}
```

#### Response (200)

```json
{
    "type": "PAYMENT_COMPLETED",
    "chat_room_id": "chat_room_001",
    "user_id": "user_abc",
    "nickname": "결제자닉네임",
    "amount": 5000,
    "timestamp": "2025-07-30T22:55:00Z",
    "message": "XXX님이 예약금 결제를 완료했습니다."
}
```

---

### 13.4. 사장님 예약 승인/거절 API

**POST** `/api/reservations/{reservationId}/approval`

> 사장님이 결제 완료된 매칭(예약)을 확인하고 최종 승인하거나 거절합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 

#### Request Body


```json
{
    "managerId": "manager_user_id", // 승인/거절을 수행하는 사장/관리자 ID (인증 토큰에서 추출)
    "action": "APPROVE" // 또는 "REJECT"
    // (선택 사항) "reason": "시설 예약 불가"
}
```

#### Response (200)

```json
{
    "status": "success",
    "message": "예약이 성공적으로 승인되었습니다.", 
    "data": {
        "reservationId": "match_001",
        "newStatus": "RESERVATION_CONFIRMED" 
    }
}
```

---

### 13.5. 채팅방 내 결제 현황 조회 API

**GET** `/chat/rooms/{roomId}/payments/status`

> 채팅방 내에서 각 참가자의 예약금 결제 상태를 확인합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 

#### Response (200)

```json
{
  "success": true,
  "data": {
    "reservation_id": 101,
    "reservation_status": "PENDING_DEPOSIT",
    "required_participants_count": 5,
    "current_paid_participants_count": 2,
    "participants_payment_status": [
      { "user_id": "user1", "nickname": "홍길동", "payment_status": "PAID" },
      { "user_id": "user2", "nickname": "김철수", "payment_status": "PAID" },
      { "user_id": "user3", "nickname": "박영희", "payment_status": "PENDING" }
    ]
  }
}
```

---

### 13.6. 결제 미완료 참가자 강퇴 API

**DELETE** `/chat/rooms/{roomId}/participants/{userId}`

> 방장이 결제 기한이 지난 참가자를 채팅방에서 강퇴시킵니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 (방장 권한 확인)

#### Response (200)

```json
{
  "success": true,
  "message": "참가자가 성공적으로 강퇴되었습니다."
}
```

---

## 14. 👤 마이페이지 관련 API

### 14.1. 마이페이지 정보 조회 API

**GET** `/users/me`

> 마이페이지 화면에 필요한 사용자 프로필, 활동 요약, 설정 정보 등을 한 번에 조회합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수 

#### Response (200)

```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "user_name": "홍길동",
    "user_email": "hong@example.com",
    "user_phone_number": "010-1234-5678",
    "user_thumbnail_url": "https://cdn.example.com/profiles/12.jpg",
    "user_region": "부산",
    "user_gender": 1,
    "user_level": "GOLD",
    "user_coupon_count": 5,
    "user_activity_summary": {
      "participated_matches_count": 27,
      "written_reviews_count": 23
    },
    "user_settings": {
      "push_notifications_enabled": true,
      "email_notifications_enabled": true,
      "marketing_opt_in": true,
      "location_tracking_enabled": true
    }
  }
}
```

---

### 14.2. 사용자 설정 변경 API

**PATCH** `/users/me`

> 알림 설정, 마케팅 수신 동의 등 다양한 사용자 설정을 변경합니다. PATCH를 사용하여 변경하려는 속성만 보냅니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body

```json
{
  "push_notifications_enabled": false,
  "marketing_opt_in": false
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "설정이 성공적으로 변경되었습니다."
}
```

---

### 14.3. 프로필 수정 API

**PUT** `/users/me/profile`

> 사용자 프로필 정보를 수정합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Request Body

```json
{
  "user_thumbnail_url": "https://cdn.example.com/profiles/new_image.jpg",
  "user_name": "김서연",
  "user_phone_number": "010-1234-5678",
  "user_email": "ptw0414@naver.com",
  "user_date_of_birth": "1995-03-15",
  "user_gender": "여성",
  "user_bio": "안녕하세요! 새로운 사람들과의 만남을 좋아하는 김서연입니다. 다양한 스포츠를 좋아하고 야구를 특히 좋아해요. 함께 즐거운 시간을 보낼 수 있는 분들과 만나고 싶습니다!"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "프로필이 성공적으로 업데이트되었습니다."
}
```

---
### 14.4. 로그아웃 API

**POST** `/auth/logout`

> 사용자의 현재 세션을 종료합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수

#### Response (200)

```json
{
  "success": true,
  "message": "로그아웃 되었습니다."
}
```

#### Response (400)

```json
  "success": false,
  "errorCode": "UNAUTHORIZED",
  "message": "유효하지 않은 토큰입니다."
```

---
