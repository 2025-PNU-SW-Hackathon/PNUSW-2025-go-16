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
  StoreDashboardResponseDTO,
  StoreReservationsResponseDTO,
  ReservationActionRequestDTO,
  ReservationActionResponseDTO,
  MatchesResponseDTO,
  ScheduleResponseDTO,
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

// ===== 사장님 전용 API =====

// GET /api/v1/stores/me - 사장님 대시보드 정보 조회
export const getStoreDashboard = async (): Promise<StoreDashboardResponseDTO> => {
  const response = await apiClient.get<StoreDashboardResponseDTO>('/stores/me/dashboard');
  return response.data;
};

// GET /api/v1/stores/me/reservations - 사장님 예약 관리 목록 조회
export const getStoreReservations = async (): Promise<StoreReservationsResponseDTO> => {
  const response = await apiClient.get<StoreReservationsResponseDTO>('/stores/me/reservations');
  return response.data;
};

// POST /api/v1/reservations/{reservationId}/approval - 예약 승인/거절 (올바른 API)
export const acceptReservation = async (
  reservationId: number
): Promise<ReservationActionResponseDTO> => {
  const response = await apiClient.post<ReservationActionResponseDTO>(
    `/reservations/${reservationId}/approval`,
    { action: 'APPROVE' }
  );
  
  return response.data;
};

// POST /api/v1/reservations/{reservationId}/approval - 예약 승인/거절 (올바른 API)
export const rejectReservation = async (
  reservationId: number,
  reason?: string
): Promise<ReservationActionResponseDTO> => {  
  const response = await apiClient.post<ReservationActionResponseDTO>(
    `/reservations/${reservationId}/approval`,
    { 
      action: 'REJECT',
      reason: reason || '사유 없음'
    }
  );
  
  return response.data;
};

// 일정 관련 API (명세서 기반)

// 경기 정보 조회 - GET /api/v1/matches
export const getMatches = async (params?: {
  competition_code?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  home?: string;
  away?: string;
  team?: string;
  venue?: string;
  category?: number;
  sort?: string;
  page?: number;
  page_size?: number | 'all';
  all?: boolean;
}): Promise<MatchesResponseDTO> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'all' && value === true) {
          queryParams.append('all', 'true');
        } else if (key === 'page_size' && value === 'all') {
          queryParams.append('page_size', 'all');
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
  }
  
  const url = `/matches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  console.log('🎯 [API] getMatches 호출:', url);
  
  const response = await apiClient.get<MatchesResponseDTO>(url);
  console.log('✅ [API] getMatches 성공:', response.data);
  return response.data;
};

// 매장 일정 조회 (예약 목록) - GET /api/v1/stores/me/reservations
export const getStoreSchedule = async (params?: {
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<ScheduleResponseDTO> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const url = `/stores/me/reservations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  console.log('📅 [API] getStoreSchedule 호출:', url);
  
  const response = await apiClient.get<ScheduleResponseDTO>(url);
  console.log('✅ [API] getStoreSchedule 성공:', response.data);
  return response.data;
};
