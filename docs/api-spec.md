📘 API 명세서 - 단체 관람 예약 서비스

✅ 공통 정보
	•	Base URL: /api/v1
	•	인증 방식: JWT (Authorization: Bearer <ACCESS_TOKEN>) 사용 (JWT token에는 사용자 아이디 첨부.)

⸻

1. 모임 생성 API

POST /meetups

새로운 모임(방)을 생성합니다.

Headers
	•	Authorization: Bearer <JWT> ✅ 필수

Request Body (JSON)

{
  "title": "7월 28일 영화 보러갈 사람?",
  "store_id": "store_123",
  "date": "2025-07-28T19:00:00",
  "max_members": 6,
  "bio": "부산 서면 메가박스에서 영화 보고 밥까지!"
}

Response (200)

{
  "success": true,
  "data": {
    "reservation_id": 101,
    "created_at": "2025-07-16T14:03:00Z"
  }
}

Response (400 예시)

{
  "success": false,
  "message": "store_id가 유효하지 않습니다.",
  "errorCode": "INVALID_STORE_ID"
}


⸻

2. 🔍 모임 리스트 조회 API

GET /meetups

조건에 맞는 모임 리스트를 조회합니다.

Query Params

파라미터	설명	예시
region	지역 검색	부산
date	날짜 필터	2025-07-28
keyword	키워드 검색	영화, 치킨

Response

{
  "success": true,
  "data": [
    {
      "reservation_id": 101,
      "title": "영화 보러갈 사람",
      "store_id": "store_123",
      "date": "2025-07-28T19:00:00",
      "current_members": 4,
      "max_members": 6
    }
  ]
}


⸻

3. 🙋 모임 참여 API

POST /meetups/{reservation_id}/join

사용자가 특정 모임에 참여합니다.

Response (200)

{
  "success": true,
  "message": "모임에 참여하였습니다."
}

Response (409)

{
  "success": false,
  "message": "이미 참여 중입니다.",
  "errorCode": "ALREADY_JOINED"
}


⸻

4. 📍 가게 리스트 조회 API

GET /stores

예약 가능한 가게 리스트를 조회합니다.

Query Params

파라미터	설명
region	지역 필터 (optional)
capacity	인원 수 기준 필터 (optional)
keyword	가게 이름/메뉴 키워드 (optional)

Response

{
  "success": true,
  "data": [
    {
      "store_id": "store_123",
      "store_address": "부산 서면로 123",
      "store_bio": "최대 50명 수용 영화관!",
      "store_rating": 4,
      "store_review_cnt": 12,
      "store_thumbnail": "https://...",
      "store_max_people_cnt": 50,
      "store_max_table_cnt": 10,
      "store_open_hour": 10,
      "store_close_hour": 22
    }
  ]
}
