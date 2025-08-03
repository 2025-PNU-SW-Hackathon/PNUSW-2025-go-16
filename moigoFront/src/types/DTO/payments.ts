// 예약금 결제 요청 요청 DTO
export interface RequestPaymentRequestDTO {
  amount: number;
  message: string;
}

// 예약금 결제 요청 응답 DTO
export interface RequestPaymentResponseDTO {
  success: boolean;
  message: string;
}

// 결제 시작 요청 DTO
export interface InitiatePaymentRequestDTO {
  amount: number;
  payment_method: string; // "KAKAO_PAY", "NAVER_PAY" 등
}

// 결제 시작 응답 DTO
export interface InitiatePaymentResponseDTO {
  success: boolean;
  data: {
    order_id: string;
    payment_gateway_url: string;
    product_name: string;
  };
}

// 결제 콜백 요청 DTO
export interface PaymentCallbackRequestDTO {
  tid: string; // 트랜잭션 ID
  order_id: string;
  status: string; // "SUCCESS", "FAILED" 등
  amount: number;
  payload: string;
}

// 결제 콜백 응답 DTO
export interface PaymentCallbackResponseDTO {
  type: string;
  chat_room_id: string;
  user_id: string;
  nickname: string;
  amount: number;
  timestamp: string; // ISO 8601 형식
  message: string;
}

// 예약 승인/거절 요청 DTO
export interface ReservationApprovalRequestDTO {
  managerId: string;
  action: "APPROVE" | "REJECT";
  reason?: string;
}

// 예약 승인/거절 응답 DTO
export interface ReservationApprovalResponseDTO {
  status: string;
  message: string;
  data: {
    reservationId: string;
    newStatus: string;
  };
}

// 결제 상태 조회 응답 DTO
export interface PaymentStatusResponseDTO {
  success: boolean;
  data: {
    reservation_id: number;
    reservation_status: string;
    required_participants_count: number;
    current_paid_participants_count: number;
    participants_payment_status: Array<{
      user_id: string;
      nickname: string;
      payment_status: "PAID" | "PENDING" | "FAILED";
    }>;
  };
}

// 참가자 강퇴 응답 DTO
export interface KickParticipantResponseDTO {
  success: boolean;
  message: string;
} 