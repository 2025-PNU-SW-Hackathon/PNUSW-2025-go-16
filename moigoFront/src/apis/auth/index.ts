import apiClient from '../apiClient';
import type {
  SignupRequestDTO,
  SignupResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  AuthErrorResponseDTO,
} from '../../types/DTO/auth';

// POST /auth/signup - 회원가입
export const signup = async (
  data: SignupRequestDTO
): Promise<SignupResponseDTO> => {
  const response = await apiClient.post<SignupResponseDTO>(
    '/auth/signup',
    data
  );
  return response.data;
};

// POST /auth/login - 로그인
export const login = async (
  data: LoginRequestDTO
): Promise<LoginResponseDTO> => {
  const response = await apiClient.post<LoginResponseDTO>(
    '/auth/login',
    data
  );
  return response.data;
};

// POST /auth/logout - 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
