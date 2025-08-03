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
  message: string;
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