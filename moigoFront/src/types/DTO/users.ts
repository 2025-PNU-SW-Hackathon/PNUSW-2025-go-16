// 사용자 정보 DTO
export interface UserInfoDTO {
  user_id: string;
  user_name: string;
  user_email: string;
  user_region?: string;
  user_gender?: number;
  user_phone_number: string;
  user_thumbnail?: string;
  user_level?: string;
  user_coupon_count?: number;
  user_activity_summary?: {
    participated_matches_count: number;
    written_reviews_count: number;
  };
  user_settings?: {
    push_notifications_enabled: boolean;
    email_notifications_enabled: boolean;
    marketing_opt_in: boolean;
    location_tracking_enabled: boolean;
  };
}

// 사용자 정보 조회 응답 DTO
export interface GetUserInfoResponseDTO {
  success: boolean;
  data: UserInfoDTO;
}

// 프로필 수정 요청 DTO
export interface UpdateProfileRequestDTO {
  user_name?: string;
  user_region?: string;
  user_phone_number?: string;
  user_thumbnail?: string;
  user_email?: string;
  user_date_of_birth?: string;
  user_gender?: string;
  user_bio?: string;
}

// 프로필 수정 응답 DTO
export interface UpdateProfileResponseDTO {
  success: boolean;
  message: string;
}

// 비밀번호 변경 요청 DTO
export interface ChangePasswordRequestDTO {
  old_password: string;
  new_password: string;
}

// 비밀번호 변경 응답 DTO
export interface ChangePasswordResponseDTO {
  success: boolean;
  message?: string;
  errorCode?: string;
}

// 매칭 이력 DTO
export interface MatchingHistoryDTO {
  reservation_id: number;
  reservation_match: string;
  reservation_start_time: string;
  store_name: string;
  status: string;
}

// 매칭 이력 조회 응답 DTO
export interface GetMatchingHistoryResponseDTO {
  success: boolean;
  data: MatchingHistoryDTO[];
}

// 사용자 설정 변경 요청 DTO
export interface UpdateUserSettingsRequestDTO {
  push_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
  marketing_opt_in?: boolean;
  location_tracking_enabled?: boolean;
}

// 사용자 설정 변경 응답 DTO
export interface UpdateUserSettingsResponseDTO {
  success: boolean;
  message: string;
} 

export interface ReservationHistoryDTO {
  success: boolean;
  data: [{
    reservation_id: number;
    store_id: string;
    reservation_start_time: string;
    reservation_end_time: string;
    reservation_bio: string;
    reservation_match: string;
    reservation_status: number;
    reservation_participant_cnt: number;
    reservation_max_participant_cnt: number;
  }]
}

// 사장님 대시보드 정보 DTO (실제 API 응답에 맞게 수정)
export interface StoreDashboardDTO {
  average_rating: string;
  this_week_reservations_count: number;
  today_reservations_count: number;
}

// 사장님 대시보드 응답 DTO
export interface StoreDashboardResponseDTO {
  success: boolean;
  data: StoreDashboardDTO;
}

// 예약 관리 DTO (실제 API 응답에 맞게 수정)
export interface StoreReservationDTO {
  reservation_id: number;
  reservation_match: string;
  reservation_participant_info: string;        // ✅ 실제 API 응답 필드
  reservation_start_time: string;
  reservation_status: string;                  // ✅ 실제 API 응답 필드 ("PENDING_APPROVAL" 등)
  reservation_table_info: string;              // ✅ 실제 API 응답 필드
}

// 예약 관리 목록 응답 DTO
export interface StoreReservationsResponseDTO {
  success: boolean;
  data: StoreReservationDTO[];
}

// 예약 승인/거절 요청 DTO (올바른 API 명세에 맞게 수정)
export interface ReservationActionRequestDTO {
  action: 'approve' | 'reject';
  reason?: string; // 거절 시 사유
}

// 예약 승인/거절 응답 DTO
export interface ReservationActionResponseDTO {
  success: boolean;
  message: string;
  data: {
    reservation_id: number;
    status: string;
  };
}

// 일정 관련 DTO (명세서 기반)
export interface MatchDTO {
  id: number;
  competition_code: string;
  match_date: string;
  status: string;
  home_team: string;
  away_team: string;
  venue: string;
  category: number;
}

export interface ScheduleEventDTO {
  reservation_id: number;
  reservation_match: string;
  reservation_start_time: string;
  reservation_end_time?: string;
  reservation_participant_info: string;
  reservation_status: string;
  reservation_table_info: string;
  // 실제 API 응답에 맞는 필드명으로 수정
  participants_count?: number;  // API에서 제공되지 않을 수 있음
  max_participants?: number;   // API에서 제공되지 않을 수 있음
}

export interface ScheduleResponseDTO {
  success: boolean;
  data: ScheduleEventDTO[];
  meta?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface MatchesResponseDTO {
  success: boolean;
  data: MatchDTO[];
  meta?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    sort: string;
    filters?: Record<string, any>;
  };
}