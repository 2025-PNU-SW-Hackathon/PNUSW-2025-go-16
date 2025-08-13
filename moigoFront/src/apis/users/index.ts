import apiClient from '../apiClient';
import type { LoginRequestDTO, LoginResponseDTO } from '../../types/DTO/auth';
import type {
  GetUserInfoResponseDTO,
  UpdateProfileRequestDTO,
  UpdateProfileResponseDTO,
  ChangePasswordRequestDTO,
  ChangePasswordResponseDTO,
  GetMatchingHistoryResponseDTO,
  UpdateUserSettingsRequestDTO,
  UpdateUserSettingsResponseDTO,
  ReservationHistoryDTO,
} from '../../types/DTO/users';
import type { GetUserProfileResponseDTO } from '../../types/DTO/chat';

// POST /auth/login - 로그인 (기존 호환성을 위해 유지)
export async function postLogin(data: LoginRequestDTO): Promise<LoginResponseDTO> {
  const response = await apiClient.post<LoginResponseDTO>('/auth/login', data);
  return response.data;
}

// GET /users/{user_id} - 사용자 정보 조회
export const getUserInfo = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

// PUT /users/{user_id} - 사용자 정보 수정
export const updateUserInfo = async (userId: string, userData: any) => {
  const response = await apiClient.put(`/users/${userId}`, userData);
  return response.data;
};

// GET /users/me - 마이페이지 정보 조회
export const getMyInfo = async (): Promise<GetUserInfoResponseDTO> => {
  const response = await apiClient.get<GetUserInfoResponseDTO>('/users/me');
  return response.data;
};

// PUT /users/me - 프로필 수정
export const updateProfile = async (
  data: UpdateProfileRequestDTO
): Promise<UpdateProfileResponseDTO> => {
  const response = await apiClient.put<UpdateProfileResponseDTO>('/users/me', data);
  return response.data;
};

// PUT /users/me/password - 비밀번호 변경
export const changePassword = async (
  data: ChangePasswordRequestDTO,
  endpoint?: string
): Promise<ChangePasswordResponseDTO> => {
  const apiEndpoint = endpoint || '/users/me/password';
  const response = await apiClient.put<ChangePasswordResponseDTO>(apiEndpoint, data);
  return response.data;
};

// GET /users/me/matchings - 참여한 매칭 이력 조회
export const getMatchingHistory = async (): Promise<GetMatchingHistoryResponseDTO> => {
  const response = await apiClient.get<GetMatchingHistoryResponseDTO>('/users/me/matchings');
  return response.data;
};

// GET /users/me/reservations - 참여중인 매칭 이력 조회
export const getReservationHistory = async (): Promise<ReservationHistoryDTO> => {
  const response = await apiClient.get<ReservationHistoryDTO>('/users/me/reservations');
  return response.data;
};

// PATCH /users/me - 사용자 설정 변경
export const updateUserSettings = async (
  data: UpdateUserSettingsRequestDTO
): Promise<UpdateUserSettingsResponseDTO> => {
  const response = await apiClient.patch<UpdateUserSettingsResponseDTO>('/users/me', data);
  return response.data;
};

// GET /users/{userId}/profile - 유저 정보 조회
export const getUserProfile = async (userId: string): Promise<GetUserProfileResponseDTO> => {
  const response = await apiClient.get<GetUserProfileResponseDTO>(`/users/${userId}/profile`);
  return response.data;
};
