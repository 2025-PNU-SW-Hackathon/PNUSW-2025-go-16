# 📲 Push Notification Handling Spec

본 문서는 **Expo Push 알림**을 서비스에서 어떻게 전송하고, 프론트엔드에서 어떤 처리를 해야 하는지 정의합니다.  
알림은 **사용자(User)**와 **사장님(StoreOwner)** 두 그룹으로 구분합니다.

---

## 1. 공통 구조

```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "알림 제목",
  "body": "알림 내용",
  "sound": "default",
  "data": {
    "v": 1,
    "eventId": "고유 이벤트 ID",
    "type": "알림 유형",
    "reservationId": 123,
    "roomId": 456,
    "meta": { ... }
  },
  "priority": "high",
  "channelId": "default",
  "ttl": 300
}
```

프론트는 `notification.request.content.data` 를 기준으로 분기 처리합니다.

---

## 2. 일반 사용자(User) 알림

### 2.1 채팅 메세지 수신 (CHAT_MESSAGE)
- **전송 상황**: 채팅방에 새 메시지 도착
- **데이터 필드**: `roomId`, `messageId`, `senderId`, `senderName`, `text`
- **Frontend 처리**
  - 푸시 클릭 시 해당 채팅방으로 이동 (`app://chat/{roomId}`)
  - 포그라운드 상태라면 메시지 미리보기/토스트 표시

### 2.2 결제 요청 (PAYMENT_REQUEST)
- **전송 상황**: 예약금 결제가 필요할 때
- **데이터 필드**: `reservationId`, `roomId`, `amount`, `dueAtISO`
- **Frontend 처리**
  - 결제 화면으로 이동 (`app://room/{roomId}/payment`)
  - 만료 시간이 있으면 카운트다운 표시

### 2.3 예약 확정 (RESERVATION_CONFIRMED)
- **전송 상황**: 가게가 예약을 수락했을 때
- **데이터 필드**: `reservationId`, `roomId`, `timeISO`, `storeName`
- **Frontend 처리**
  - 모임 상세 화면으로 이동 (`app://room/{roomId}/reservation`)
  - UI에 예약 확정 배지/상태 갱신

### 2.4 예약 거절 (RESERVATION_REJECTED)
- **전송 상황**: 가게가 예약을 거절했을 때
- **데이터 필드**: `reservationId`, `roomId`, `storeName`, `reason`
- **Frontend 처리**
  - 모임 화면으로 이동
  - 사유(reason) 알림 표시

### 2.5 모임 취소 (RESERVATION_CANCELED)
- **전송 상황**: 방장/가게가 모임을 취소했을 때
- **데이터 필드**: `reservationId`, `roomId`, `canceledBy`
- **Frontend 처리**
  - 모임 화면에서 취소 상태 반영
  - 취소 주체(host/store) 표기

### 2.6 결제 완료 (PAYMENT_SUCCESS)
- **전송 상황**: 사용자의 결제가 성공했을 때
- **데이터 필드**: `paymentId`, `reservationId`, `roomId`, `amount`
- **Frontend 처리**
  - 결제 내역 화면으로 이동
  - 성공 메시지 토스트 표시

### 2.7 환불 완료 (REFUND_COMPLETED)
- **전송 상황**: 환불이 완료되었을 때
- **데이터 필드**: `refundId`, `reservationId`, `amount`
- **Frontend 처리**
  - 결제 내역 화면 갱신
  - 환불 완료 배지 표시

### 2.8 결제 실패 (PAYMENT_FAILED)
- **전송 상황**: 결제가 실패/만료되었을 때
- **데이터 필드**: `reservationId`, `roomId`, `reason`
- **Frontend 처리**
  - 결제 화면으로 이동
  - 실패 사유(reason) 알림 표시

---

## 3. 사장님(Store Owner) 알림

### 3.1 예약 요청 (RESERVATION_REQUESTED)
- **전송 상황**: 사용자가 예약을 신청했을 때
- **데이터 필드**: `reservationId`, `roomId`, `storeId`, `meta`
- **Frontend 처리**
  - 가게 예약 관리 화면으로 이동 (`app://store/reservations/{reservationId}`)
  - 요청 상세 UI 표시

### 3.2 정산 완료 (PAYOUT_COMPLETED)
- **전송 상황**: 예약 건 정산이 완료되었을 때
- **데이터 필드**: `payoutId`, `reservationId`, `amount`
- **Frontend 처리**
  - 정산 내역 화면으로 이동 (`app://store/payouts/{payoutId}`)
  - 성공 메시지 표시

---

## 4. 공통 처리 규칙

1. **중복 방지**: `eventId`로 최근 이벤트 캐시 후 중복 무시  
2. **라우팅 우선순위**: `data.deepLink` > `screen/params`  
3. **포그라운드 처리**: 현재 화면과 관련된 알림은 토스트/뱃지로만 표시  
4. **만료 처리**: Expo 리시트에서 `DeviceNotRegistered` → DB 토큰 삭제  
5. **우선순위**: 예약/결제 이벤트는 `priority: high`

