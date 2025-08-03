import { useMutation } from '@tanstack/react-query';
import { signup, login, logout } from '../apis/auth';
import type { SignupRequestDTO, LoginRequestDTO } from '../types/DTO/auth';
import { setAccessToken } from '../apis/apiClient';

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
  return useMutation({
    mutationFn: (data: LoginRequestDTO) => login(data),
    onSuccess: (data) => {
      // 로그인 성공 시 액세스 토큰 설정
      setAccessToken(`Bearer ${data.access_token}`);
    },
    onError: (error) => {
      console.error('로그인 실패:', error);
    },
  });
};

// POST /auth/logout - 로그아웃 훅
export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 로그아웃 성공 시 액세스 토큰 제거
      setAccessToken(null);
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error);
    },
  });
}; 