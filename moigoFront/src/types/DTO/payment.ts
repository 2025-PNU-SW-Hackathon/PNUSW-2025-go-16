// 💰 정산 관련 DTO 타입 정의

// 정산 참여자 정보
export interface PaymentParticipantDTO {
  user_id: string;
  user_name: string;
  is_host: boolean;
  payment_status: 'pending' | 'completed';
  payment_method: 'bank_transfer' | 'card' | 'cash' | null;
  paid_at: string | null;
}

// 가게 계좌 정보
export interface StoreAccountDTO {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

// 정산 시작 요청 (서버에서 자동 계산하므로 빈 객체)
export interface StartPaymentRequestDTO {
  // 요청 데이터 없음 - 서버에서 모든 조건을 자동 체크하고 계산
}

// 정산 시작 응답
export interface StartPaymentResponseDTO {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    chat_room_id: number;
    total_participants: number;
    payment_per_person: number;        // 자동 계산된 1인당 금액
    total_amount: number;              // 총 금액
    store_deposit_amount: number;      // 🆕 가게 원래 예약금
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
    payment_method: 'bank_transfer' | 'card' | 'cash';
    remaining_pending: number;
    is_fully_completed: boolean;
  };
}

// 정산 상태 조회 응답
export interface GetPaymentStatusResponseDTO {
  success: boolean;
  data: {
    payment_id: string;
    payment_status: 'not_started' | 'in_progress' | 'completed';
    payment_per_person: string; // 서버에서 문자열로 보냄
    total_amount: string;       // 서버에서 문자열로 보냄
    total_participants: number;
    completed_payments: number;
    pending_payments: number;
    payment_deadline: string;
    started_at: string;
    completed_at: string | null;
    store_info: {               // 서버 실제 응답에 맞춤
      store_name: string;
      bank_name: string;
      account_number: string;
      account_holder: string;
    };
    participants: PaymentParticipantDTO[];
  } | {
    payment_status: 'not_started';
    message: string;
  };
}

// 정산 시작 소켓 이벤트
export interface PaymentStartedEventDTO {
  room_id: number;
  payment_id: string;
  started_by: string;
  started_by_name: string;
  payment_per_person: number;       // 자동 계산된 1인당 금액
  total_amount: number;             // 총 금액
  store_deposit_amount: number;     // 🆕 가게 원래 예약금
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

// 🆕 정산 현황 업데이트 이벤트
export interface PaymentStatusUpdatedEventDTO {
  room_id: number;
  payment_data: {
    payment_per_person: number;
    total_amount: number;
    total_participants: number;
    store_account: StoreAccountDTO;
    participants: PaymentParticipantDTO[];
    completed_count: number;
    payment_deadline: string;
    last_updated: string;
  };
  updated_by: string;
  updated_at: string;
}

// 🆕 정산 현황판 메시지 데이터
export interface PaymentStatusBoardData {
  payment_per_person: number;
  total_amount: number;
  total_participants: number;
  store_account: StoreAccountDTO;
  participants: PaymentParticipantDTO[];
  completed_count: number;
  payment_deadline: string;
  last_updated: string;
}


