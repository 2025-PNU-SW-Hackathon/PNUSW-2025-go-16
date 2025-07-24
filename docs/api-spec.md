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

---
