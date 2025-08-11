// 예약 조회 요청 DTO (쿼리 파라미터)
export interface ReservationQueryDTO {
  region?: string; // 지역 필터 (예: "부산", "서울")
  date?: string; // 날짜 필터 (예: "2024-01-15")
  category?: string; // 카테고리 필터 (예: "축구", "농구")
  keyword?: string; // 검색어 (모임명 또는 소개글에서 검색)
}

// 경기 조회 요청 DTO (쿼리 파라미터)
export interface MatchQueryDTO {
  date?: string; // 날짜 필터 (YYYY-MM-DD 형식)
  competition?: string; // 대회 코드 필터 (PL, PD, BL1, SA, FL1, CL, EL, EC, WC, CLI, ACL)
  status?: string; // 경기 상태 필터 (SCHEDULED, LIVE, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED)
}

// 경기 정보 DTO
export interface MatchDTO {
  id: number;
  competition_code: string;
  match_date: string;
  status: string;
  home_team: string;
  away_team: string;
  venue: string;
}

// 경기 조회 응답 DTO
export interface MatchResponseDTO {
  success: boolean;
  data: MatchDTO[];
}

// 경기 상세 정보 DTO
export interface MatchDetailDTO {
  id: number;
  competition_code: string;
  match_date: string;
  status: string;
  home_team: string;
  away_team: string;
  venue: string;
}

// 경기 상세 조회 응답 DTO
export interface MatchDetailResponseDTO {
  success: boolean;
  data: MatchDetailDTO;
}

// 경기별 모임 정보 DTO (새로운 명세에 맞게 업데이트)
export interface MatchReservationDTO {
  reservation_id: number;
  store_id: number;
  user_id: number;
  reservation_title: string;
  reservation_description: string;
  reservation_date: string;
  reservation_start_time: string;
  reservation_end_time: string;
  reservation_max_participant_cnt: number;
  reservation_participant_cnt: number;
  reservation_status: number;
  reservation_created_at: string;
  store_name: string;
  store_address: string;
}

// 경기별 모임 조회 응답 DTO
export interface MatchReservationsResponseDTO {
  success: boolean;
  data: MatchReservationDTO[];
}

// 모임 생성 요청 DTO (새로운 명세에 맞게 업데이트)
export interface CreateReservationRequestDTO {
  store_id: number; // 매장 ID (필수)
  reservation_title: string; // 모임 제목 (필수, 최대 100자)
  reservation_description?: string; // 모임 설명 (선택)
  reservation_date: string; // 모임 날짜 (필수, YYYY-MM-DD 형식)
  reservation_start_time: string; // 시작 시간 (필수, HH:MM:SS 형식)
  reservation_end_time: string; // 종료 시간 (필수, HH:MM:SS 형식)
  reservation_max_participant_cnt: number; // 최대 참여자 수 (필수, 1 이상)
}

// 모임 생성 응답 DTO (새로운 명세에 맞게 업데이트)
export interface CreateReservationResponseDTO {
  success: boolean;
  message: string;
  data: {
    reservation_id: number;
    store_id: number;
    user_id: number;
    reservation_title: string;
    reservation_description: string;
    reservation_date: string;
    reservation_start_time: string;
    reservation_end_time: string;
    reservation_max_participant_cnt: number;
    reservation_participant_cnt: number;
    reservation_status: number;
    reservation_created_at: string;
  };
}

// 예약 정보 DTO
export interface ReservationDTO {
  reservation_id: number;
  store_id: number;
  store_name: string;
  store_address?: string; // 경기별 모임 조회에서 추가되는 필드
  reservation_start_time: string;
  reservation_end_time: string;
  reservation_bio: string;
  reservation_match: string;
  reservation_status: number; // 0: 모집중, 1: 모집완료, 2: 취소됨
  reservation_participant_cnt: number;
  reservation_max_participant_cnt: number;
}

// 예약 조회 응답 DTO
export interface ReservationResponseDTO {
  success: boolean;
  data: ReservationDTO[];
}

// 예약 에러 응답 DTO
export interface ReservationErrorResponseDTO {
  success: boolean;
  message: string;
  statusCode?: number;
  errorCode?: string;
}
