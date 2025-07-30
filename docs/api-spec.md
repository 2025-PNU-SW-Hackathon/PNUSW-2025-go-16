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

## 9. 📖 참여한 매칭 이력 조회 API

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
      "reservation_id": 101,
      "reservation_match": "맨유 vs 리버풀",
      "reservation_start_time": "2025-07-20T18:00:00",
      "store_name": "티비있는 포차",
      "status": "참여완료"
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
    }
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
    "user_id": 12,
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
    }
  ]
}
```

---
