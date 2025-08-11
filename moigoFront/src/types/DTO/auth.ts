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

// 로그인 요청 DTO - 서버 코드에 맞게 수정 (user_pwd 사용)
export interface LoginRequestDTO {
  user_id: string;
  user_pwd: string; // 서버에서 user_pwd로 받음
}

// 로그인 응답 DTO - 실제 서버 응답 형식에 맞게 수정
export interface LoginResponseDTO {
  success: boolean;
  message: string;
  data: {
    // 토큰이 별도 필드로 오거나 data 안에 있을 수 있음
    token?: string;
    user: {
      user_id: string;
      user_name: string;
      user_email: string;
      user_phone_number: string;
      user_gender: number;
    }
  };
}

// 인증 에러 응답 DTO
export interface AuthErrorResponseDTO {
  success?: boolean;
  message: string;
  statusCode?: number;
  errorCode?: string;
} 