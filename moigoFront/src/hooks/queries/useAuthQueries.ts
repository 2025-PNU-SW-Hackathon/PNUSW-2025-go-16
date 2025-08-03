import { useMutation } from '@tanstack/react-query';
import { signup, login, logout } from '../../apis/auth';
import type { SignupRequestDTO, LoginRequestDTO } from '../../types/DTO/auth';
import { setAccessToken } from '../../apis/apiClient';
import { useMyStore } from '../../store/myStore';

// POST /auth/signup - 회원가입 훅
export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequestDTO) => signup(data),
    onError: (error) => {
      console.error('회원가입 실패:', error);
    },
  });
};

// POST /auth/login - 로그인 훅
export const useLogin = () => {
  const { updateUserProfile } = useMyStore();
  
  return useMutation({
    mutationFn: (data: LoginRequestDTO) => login(data),
    onSuccess: (data) => {
      // 로그인 성공 시 액세스 토큰 설정
      setAccessToken(`Bearer ${data.access_token}`);
      
      // 사용자 정보를 store에 저장
      if (data.data) {
        updateUserProfile({
          id: data.data.user_id,
          name: data.data.user_name,
          email: data.data.user_email,
          grade: 'BRONZE', // 기본값
          progressToNextGrade: 0,
          coupons: 0,
          participatedMatches: 0,
          writtenReviews: 0,
          preferredSports: [],
        });
      }
    },
    onError: (error) => {
      console.error('로그인 실패:', error);
    },
  });
};

// POST /auth/logout - 로그아웃 훅
export const useLogout = () => {
  const { resetUserProfile } = useMyStore();
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 로그아웃 성공 시 액세스 토큰 제거
      setAccessToken(null);
      // 사용자 정보 초기화
      resetUserProfile();
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error);
    },
  });
}; 