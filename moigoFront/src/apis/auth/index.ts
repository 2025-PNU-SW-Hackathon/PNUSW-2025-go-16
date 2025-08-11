import apiClient from '../apiClient';
import type {
  SignupRequestDTO,
  SignupResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  AuthErrorResponseDTO,
} from '../../types/DTO/auth';

// POST /register - 회원가입 (서버 명세서에 맞게 수정)
export const signup = async (
  data: SignupRequestDTO
): Promise<SignupResponseDTO> => {
  const response = await apiClient.post<SignupResponseDTO>(
    '/users/register',
    data
  );
  return response.data;
};

// POST /auth/login - 로그인 (서버 코드에 맞게 수정)
export const login = async (
  data: LoginRequestDTO
): Promise<LoginResponseDTO> => {
  const response = await apiClient.post<LoginResponseDTO>(
    '/users/login',
    data
  );
  return response.data;
};

// POST /auth/logout - 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
