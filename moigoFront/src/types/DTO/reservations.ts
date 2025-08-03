// 모임 생성 요청 DTO
export interface CreateReservationRequestDTO {
  store_id: string | null;
  reservation_start_time: string; // ISO 8601 형식
  reservation_end_time: string; // ISO 8601 형식
  reservation_match: string; // 경기 정보
  reservation_bio: string; // 모임 설명
  reservation_max_participant_cnt: number;
  reservation_match_category: number;
}

// 모임 생성 응답 DTO
export interface CreateReservationResponseDTO {
  success: boolean;
  data: {
    reservation_id: number;
    created_at: string; // ISO 8601 형식
  };
}

// 모임 참여 응답 DTO
export interface JoinReservationResponseDTO {
  success: boolean;
  message: string;
  participant_cnt: number;
}

// 모임 조회 쿼리 파라미터 DTO
export interface GetReservationsQueryDTO {
  region?: string;
  date?: string; // YYYY-MM-DD 형식
  category?: number;
  keyword?: string;
}

// 모임 정보 DTO
export interface ReservationDTO {
  reservation_id: number;
  store_id: string;
  store_name: string;
  reservation_start_time: string; // ISO 8601 형식
  reservation_end_time: string; // ISO 8601 형식
  reservation_bio: string;
  reservation_match: string;
  reservation_status: number; // 0 or 1
  reservation_participant_cnt: number;
  reservation_max_participant_cnt: number;
}

// 모임 조회 응답 DTO
export interface GetReservationsResponseDTO {
  success: boolean;
  data: ReservationDTO[];
}

// 모임 취소 응답 DTO
export interface CancelReservationResponseDTO {
  success: boolean;
  message: string;
}

// 참여자 정보 DTO
export interface ParticipantDTO {
  user_id: string;
  user_name: string;
}

// 모임 상세 정보 DTO
export interface ReservationDetailDTO {
  reservation_id: number;
  store_id: string;
  store_name: string;
  reservation_start_time: string;
  reservation_end_time: string;
  reservation_match: string;
  reservation_bio: string;
  reservation_status: number;
  reservation_participant_cnt: number;
  reservation_max_participant_cnt: number;
  participants: ParticipantDTO[];
}

// 모임 상세 조회 응답 DTO
export interface GetReservationDetailResponseDTO {
  success: boolean;
  data: ReservationDetailDTO;
}

// 에러 응답 DTO
export interface ErrorResponseDTO {
  success: boolean;
  errorCode?: string;
  message?: string;
}

// 기존 타입들 (하위 호환성을 위해 유지)
export interface reservationRequestDTO extends CreateReservationRequestDTO {}
export interface reservationResponseDTO extends CreateReservationResponseDTO {}
