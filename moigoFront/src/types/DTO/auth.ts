// 회원가입 요청 DTO - 서버 명세서에 맞게 수정
export interface SignupRequestDTO {
  user_id: string;
  user_pwd: string;
  user_email: string;
  user_name: string;
  user_phone_number: string;
  user_region?: string; // 선택사항 (기본값: "서울")
  user_gender?: number; // 선택사항 (기본값: 1)
}

// 회원가입 응답 DTO - 서버 명세서에 맞게 수정
export interface SignupResponseDTO {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    user_name: string;
    user_email: string;
    user_phone_number: string;
  };
}

// 사장님 기본 회원가입 요청 DTO
export interface StoreBasicSignupRequestDTO {
  store_id: string;
  store_pwd: string;
  email: string;
  store_phonenumber: string;
}

// 사장님 기본 회원가입 응답 DTO
export interface StoreBasicSignupResponseDTO {
  success: boolean;
  message: string;
  data: {
    store_id: string;
    business_registration_status: 'pending' | 'completed';
  };
}

// 사업자 정보 등록 요청 DTO
export interface BusinessRegistrationRequestDTO {
  store_name: string;
  owner_name: string;
  business_number: string;
  postal_code: string;
  store_address: string;
  address_detail: string;
  business_certificate_url: string;
}

// 사업자 정보 등록 응답 DTO
export interface BusinessRegistrationResponseDTO {
  success: boolean;
  message: string;
  data: {
    store_id: string;
    business_registration_status: 'pending' | 'completed';
  };
}

// 사업자 등록 상태 확인 응답 DTO
export interface BusinessRegistrationStatusResponseDTO {
  success: boolean;
  data: {
    business_registration_status: 'pending' | 'completed';
    store_name: string;
    owner_name: string;
    business_number: string;
    postal_code: string;
    store_address: string;
    address_detail: string;
    business_certificate_url: string | null;
    registration_completed_at: string | null;
  };
}

// 로그인 요청 DTO - 서버 코드에 맞게 수정 (user_pwd 사용)
export interface LoginRequestDTO {
  user_id: string;
  user_pwd: string; // 서버에서 user_pwd로 받음
  expo_token?: string; // expo 푸시 토큰 (선택적)
}

// 로그인 응답 DTO - 실제 서버 응답 형식에 맞게 수정
export interface LoginResponseDTO {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      user_id: string;
      user_name: string;
    }
  };
}

// 사장님 로그인 요청 DTO
export interface StoreLoginRequestDTO {
  store_id: string;
  store_pwd: string;
  expo_token?: string; // expo 푸시 토큰 (선택적)
}

// 사장님 로그인 응답 DTO
export interface StoreLoginResponseDTO {
  success: boolean;
  message: string;
  data: {
    token: string;
    store: {
      store_id: string;
      store_name: string;
      business_number: string;
      store_address: string;
    };
  };
}

// 인증 에러 응답 DTO
export interface AuthErrorResponseDTO {
  success?: boolean;
  message: string;
  statusCode?: number;
  errorCode?: string;
}

// 모임 나가기 요청 DTO
export interface LeaveMeetingRequestDTO {
  group_id: number; // 모임 ID
}

// 모임 나가기 응답 DTO
export interface LeaveMeetingResponseDTO {
  success: boolean;
  message: string;
  data?: {
    group_id: number;
    left_at: string;
  };
}

// 채팅방 나가기 요청 DTO
export interface LeaveChatRoomRequestDTO {
  roomId: number; // 채팅방 ID
}

// 채팅방 나가기 응답 DTO
export interface LeaveChatRoomResponseDTO {
  success: boolean;
  message: string;
  data: {
    roomId: number;
    left_at: string;
    reservation_id: number;        // 🆕 탈퇴한 모임 ID
    remaining_participants: number; // 🆕 남은 참여자 수
    is_host_left: boolean;         // 🆕 방장이 나갔는지 여부
    new_host_id: string | null;    // 🆕 새 방장 ID (권한 이양 시)
    meeting_status: number;        // 🆕 변경된 모임 상태
  };
}

// 🆕 사용자 퇴장 소켓 이벤트 DTO
export interface UserLeftRoomEventDTO {
  room_id: number;
  user_id: string;
  user_name: string;
  left_at: string;
  remaining_participants: number;
  is_host_left: boolean;
  new_host_id: string | null;
  meeting_status: number;
}

// 🆕 방장 권한 이양 소켓 이벤트 DTO
export interface HostTransferredEventDTO {
  room_id: number;
  previous_host: string;
  new_host: string;
  transferred_at: string;
} 