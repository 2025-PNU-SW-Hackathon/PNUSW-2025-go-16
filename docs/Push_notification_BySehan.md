### 2.1 채팅 메시지 수신 (CHAT_MESSAGE)
- **수정된 딥링크**: `moigo://chat/{chatId}`
- **필요한 파라미터**: 
  - `chatId: string` (ChatRoomScreen에서 route.params.chatId로 받음)
- **데이터 필드**: `chatId`, `messageId`, `senderId`, `senderName`, `text`
- **Frontend 처리**: ChatRoomScreen으로 이동

### 2.2 결제 요청 (PAYMENT_REQUEST)  
- **수정된 딥링크**: `moigo://chat/{chatId}` (기존 채팅방으로 이동)
- **필요한 파라미터**:
  - `chatId: string` (ChatRoomScreen 파라미터)
- **데이터 필드**: `reservationId`, `chatId`, `amount`, `dueAtISO`
- **Frontend 처리**: 
  - 채팅방으로 이동 후 PaymentModal 자동 열기
  - 또는 별도 결제 화면 개발 필요

### 2.3 예약 확정 (RESERVATION_CONFIRMED)
- **수정된 딥링크**: `moigo://user/meeting/{eventId}`
- **필요한 파라미터**:
  - `eventId: string` (MeetingScreen에서 route.params.eventId로 받음)
- **데이터 필드**: `reservationId`, `eventId`, `chatId`, `timeISO`, `storeName`
- **Frontend 처리**: MeetingScreen으로 이동

### 2.4 예약 거절 (RESERVATION_REJECTED)
- **수정된 딥링크**: `moigo://chat/{chatId}`
- **필요한 파라미터**:
  - `chatId: string`
- **데이터 필드**: `reservationId`, `chatId`, `storeName`, `reason`
- **Frontend 처리**: 채팅방으로 이동 후 거절 사유 토스트/알림 표시

### 2.5 모임 취소 (RESERVATION_CANCELED)
- **수정된 딥링크**: `moigo://chat/{chatId}`
- **필요한 파라미터**:
  - `chatId: string`
- **데이터 필드**: `reservationId`, `chatId`, `canceledBy`
- **Frontend 처리**: 채팅방으로 이동 후 취소 알림 표시

### 2.6 결제 완료 (PAYMENT_SUCCESS)
- **수정된 딥링크**: `moigo://chat/{chatId}`
- **필요한 파라미터**:
  - `chatId: string`
- **데이터 필드**: `paymentId`, `reservationId`, `chatId`, `amount`
- **Frontend 처리**: 채팅방으로 이동 후 성공 토스트 표시

### 2.7 환불 완료 (REFUND_COMPLETED)
- **수정된 딥링크**: `moigo://user/participated-matches` (참여한 매칭 이력)
- **필요한 파라미터**: 없음
- **데이터 필드**: `refundId`, `reservationId`, `amount`
- **Frontend 처리**: 참여한 매칭 이력 화면으로 이동

### 2.8 결제 실패 (PAYMENT_FAILED)
- **수정된 딥링크**: `moigo://chat/{chatId}`
- **필요한 파라미터**:
  - `chatId: string`
- **데이터 필드**: `reservationId`, `chatId`, `reason`
- **Frontend 처리**: 채팅방으로 이동 후 PaymentModal 다시 열기

---

## 3. 사장님(Store Owner) 알림

### 3.1 예약 요청 (RESERVATION_REQUESTED)
- **수정된 딥링크**: `moigo://main` (BusinessHomeScreen으로 이동)
- **필요한 파라미터**: 없음 (Main 화면에서 사업자 타입 확인 후 BusinessHomeScreen 표시)
- **데이터 필드**: `reservationId`, `storeId`, `meta`
- **Frontend 처리**: 
  - BusinessHomeScreen으로 이동
  - 해당 예약을 하이라이트하거나 AcceptModal/RejectModal 자동 열기

### 3.2 정산 완료 (PAYOUT_COMPLETED)
- **수정된 딥링크**: `moigo://main` (BusinessHomeScreen으로 이동)
- **필요한 파라미터**: 없음
- **데이터 필드**: `payoutId`, `reservationId`, `amount`
- **Frontend 처리**: 
  - BusinessHomeScreen으로 이동
  - 정산 완료 토스트 표시
  - (향후) 별도 정산 화면 개발 시 해당 화면으로 이동
