// 💰 정산 관련 DTO 타입 정의

// 정산 참여자 정보
export interface PaymentParticipantDTO {
  user_id: string;
  user_name: string;
  is_host: boolean;
  payment_status: 'pending' | 'completed';
  paid_at: string | null;
}

// 가게 계좌 정보
export interface StoreAccountDTO {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

// 정산 시작 요청
export interface StartPaymentRequestDTO {
  payment_per_person: number; // 1인당 정산 금액
}

// 정산 시작 응답
export interface StartPaymentResponseDTO {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    chat_room_id: number;
    total_participants: number;
    payment_per_person: number;
    total_amount: number;
    store_account: StoreAccountDTO;
    payment_deadline: string;
    participants: PaymentParticipantDTO[];
  };
}

// 개별 입금 완료 요청
export interface CompletePaymentRequestDTO {
  payment_method: 'bank_transfer' | 'card' | 'cash';
}

// 개별 입금 완료 응답
export interface CompletePaymentResponseDTO {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    user_name: string;
    payment_status: 'completed';
    paid_at: string;
    remaining_pending: number;
  };
}

// 정산 상태 조회 응답
export interface GetPaymentStatusResponseDTO {
  success: boolean;
  data: {
    payment_id: string;
    payment_status: 'not_started' | 'in_progress' | 'completed';
    total_participants: number;
    completed_payments: number;
    pending_payments: number;
    payment_per_person: number;
    total_amount: number;
    store_info: {
      store_name: string;
      bank_name: string;
      account_number: string;
      account_holder: string;
    };
    payment_deadline: string;
    participants: PaymentParticipantDTO[];
  };
}

// 정산 시작 소켓 이벤트
export interface PaymentStartedEventDTO {
  room_id: number;
  payment_id: string;
  started_by: string;
  started_by_name: string;
  payment_per_person: number;
  total_amount: number;
  payment_deadline: string;
  store_account: StoreAccountDTO;
}

// 개별 입금 완료 소켓 이벤트
export interface PaymentCompletedEventDTO {
  room_id: number;
  payment_id: string;
  user_id: string;
  user_name: string;
  paid_at: string;
  remaining_pending: number;
  completed_payments: number;
  total_participants: number;
}

// 전체 정산 완료 소켓 이벤트
export interface PaymentFullyCompletedEventDTO {
  room_id: number;
  payment_id: string;
  completed_at: string;
  total_amount: number;
  all_participants_paid: boolean;
}


