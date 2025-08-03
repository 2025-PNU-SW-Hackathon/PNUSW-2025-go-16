// 회원가입 요청 DTO
export interface SignupRequestDTO {
  user_id: string;
  user_password: string; // bcrypt로 암호화된 비밀번호
  user_email: string;
  user_name: string;
  user_phone_number: string;
}

// 회원가입 응답 DTO
export interface SignupResponseDTO {
  message: string;
  user_id: string; // uuid
}

// 로그인 요청 DTO
export interface LoginRequestDTO {
  user_id: string;
  user_password: string;
}

// 로그인 응답 DTO
export interface LoginResponseDTO {
  success: boolean;
  access_token: string;
  data: {
    user_id: string;
    user_name: string;
    user_email: string;
    user_region: string;
    user_gender: number;
    user_phone_number: string;
    user_thumbnail: string | null;
  };
}

// 인증 에러 응답 DTO
export interface AuthErrorResponseDTO {
  error: string;
} 