
---

## ✍️ 리뷰 작성 API

### POST `/reviews`

> 특정 가게에 대한 리뷰를 작성합니다.

#### Headers

* Authorization: Bearer `<JWT>` ✅ 필수


---

## Request

- **Content-Type**: `multipart/form-data`

### Form-data Parameters

| Key                  | Type     | Required | Description |
|-----------------------|----------|----------|-------------|
| `store_id`            | string   | ✅       | 리뷰 대상 가게 ID |
| `review_text`         | string   | ✅       | 리뷰 내용 |
| `review_rating`       | number   | ✅       | 평점 (1~5) |
| `review_visited_time` | string   | ❌       | 방문 시각 (ISO-8601, 예: `2025-07-27T19:00:00`) |
| `images`              | file[]   | ❌       | 첨부 이미지 (최대 5장) |

---

## Example (Postman – form-data)

| Key                  | Value Example             | Type  |
|-----------------------|---------------------------|-------|
| store_id             | store_123                 | Text  |
| review_text          | 너무 맛있고 분위기도 좋았어요! | Text  |
| review_rating        | 5                         | Text  |
| review_visited_time  | 2025-07-27T19:00:00       | Text  |
| images               | spotple_test.jpeg         | File  |
| images               | spotple_test2.jpeg        | File  |

---


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

##  🧾 내 리뷰 목록 조회 API

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
      "review_created_time": "2025-07-28T22:00:00",
      "images": [
         {
                          "image_id": 8,
                          "url": "/api/v1/images/8",
                          "mime_type": "image/jpeg"
                      },
                      {
                          "image_id": 7,
                          "url": "/api/v1/images/7",
                          "mime_type": "image/jpeg"
                      }
                  ]
    }
  ]
}
```



---
