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
