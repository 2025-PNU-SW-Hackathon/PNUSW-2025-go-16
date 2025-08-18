# 💳 에스크로 결제 API 명세서 (Toss Payments 기반)

## 📦 기본 정보

- 사용 기술: Node.js, Express, MySQL, Toss Payments
- 인증 방식: JWT (user_id 파싱)
- 결제 방식: 에스크로 기반 예약금 정산

---

## 📂 엔드포인트

기본 주소: `/api/v1/payment`

---

## ✅ API 목록

### 1. 결제 요청 생성 (방장 전용)

- `POST /api/v1/payment/request`
- JWT 기반 requester_id 파싱

#### Request Body

```json
{
  "chat_room_id": 123,
  "store_id" : "store_123",
  "amount": 15000,
  "message": "예약금 요청합니다."
}
```

#### Response

```json
{
  "payment_request_id": 12,
  "status": "pending"
}
```

---

### 2. 결제 승인 (프론트에서 Toss 결제 후 요청)

- `POST /api/v1/payment/initiate`
- JWT 기반 payer_id 파싱

#### Request Body

```json
{
  "chat_room_id": 123,
  "amount": 15000,
  "paymentKey": "tosspayments-key",
  "orderId": "order_16912345678",
  "payment_method": "card"
}
```

#### Response

```json
{
  "payment_status": "completed"
}
```

> 모든 참여자 결제 완료 시, 사장님에게 예약 알림 전송됨.

---

### 3. 결제 상태 조회

- `GET /api/v1/payment/status/:chatRoomId`

#### Response

```json
{
  "payment_request": {
    "payment_request_id": 5,
    "requester_id": "user_1",
    "amount": 15000,
    "status": "pending"
  },
  "payments": [
    {
      "payer_id": "user_2",
      "payment_amount": 15000,
      "payment_status": "completed"
    },
    {
      "payer_id": "user_3",
      "payment_amount": 15000,
      "payment_status": "pending"
    }
  ]
}
```

---

### 4. 정산(사장 계좌로 송금 요청)

- `POST /api/v1/payment/release`

#### Request Body

```json
{
  "chat_room_id": 123
}
```

#### Response

```json
{
  "released_payments": [
    {
      "payer_id": "user_2",
      "paymentKey": "tosspay_key_1",
      "status": "RELEASED"
    },
    {
      "payer_id": "user_3",
      "paymentKey": "tosspay_key_2",
      "status": "RELEASED"
    }
  ]
}
```

---

### 5. 결제 취소

- `POST /api/v1/payment/cancel`

#### Request Body

```json
{
  "paymentKey": "tosspay_key_1",
  "cancelReason": "예약 취소되었습니다."
}
```

#### Response

```json
{
  "success": true,
  "refund_status": "refunded"
}
```

# 예약 확정/거절 API 명세서 (추가)

본 문서는 기존 결제 API 명세서에 **새롭게 추가된 사장님 전용 예약 확정/거절 API** 만을 정의합니다.

---

## 1) 예약 확정 (사장님 전용)

### Endpoint
```
POST /api/v1/payments/reservations/:reservationId/confirm
```

### Headers
```
Authorization: Bearer <STORE_JWT>
Content-Type: application/json
```

### Request Params
- `reservationId` (path, number): 예약 ID

### Request Body
```json
{
  "store_id": "store_001"
}
```

- `store_id`: JWT의 `store_id`와 일치해야 함 

### Response (성공)
```json
{
  "ok": true,
  "released": {
    "released_payments": [
      { "payer_id": "user_1", "paymentKey": "pay_...", "status": "RELEASED" }
    ]
  },
  "status": "confirmed"
}
```

---

## 2) 예약 거절 (사장님 전용)

### Endpoint
```
POST /api/v1/payments/reservations/:reservationId/reject
```

### Headers
```
Authorization: Bearer <STORE_JWT>
Content-Type: application/json
```

### Request Params
- `reservationId` (path, number): 예약 ID

### Request Body
```json
{
  "store_id": "store_001",              
}
```

- `store_id`: JWT의 `store_id`와 일치해야 함 

### Response (성공)
```json
{
  "ok": true,
  "canceled": [
    { "payer_id": "user_2", "paymentKey": "pay_...", "status": "CANCELED" }
  ],
  "status": "rejected"
}
```

---

## 3) 에러 응답 예시

| HTTP | 설명 |
|------|------|
| 400  | `reservationId/store_id/reason` 누락, store_id 불일치 |
| 403  | 다른 가게 소유의 예약 접근 시도 |
| 404  | 예약 없음 |
| 409  | 이미 처리된 예약 (멱등성) |
| 500  | 정산/환불 API 실패 |


---

## 🏦 은행 코드 (Toss 기준)

```js
[
  { "name": "KB국민은행", "code": "04" },
  { "name": "하나은행", "code": "05" },
  { "name": "신한은행", "code": "88" },
  { "name": "우리은행", "code": "20" },
  { "name": "NH농협은행", "code": "11" },
  { "name": "IBK기업은행", "code": "03" },
  { "name": "SC제일은행", "code": "23" },
  { "name": "씨티은행", "code": "27" },
  { "name": "부산은행", "code": "32" },
  { "name": "대구은행", "code": "31" },
  { "name": "광주은행", "code": "34" },
  { "name": "제주은행", "code": "35" },
  { "name": "경남은행", "code": "39" },
  { "name": "토스뱅크", "code": "92" },
  { "name": "케이뱅크", "code": "89" },
  { "name": "카카오뱅크", "code": "90" },
  { "name": "새마을금고", "code": "45" },
  { "name": "수협은행", "code": "07" },
  { "name": "저축은행중앙회", "code": "50" },
  { "name": "우체국예금보험", "code": "71" },
  { "name": "산림조합", "code": "64" }
]
```
