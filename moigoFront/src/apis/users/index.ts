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
  StoreInfoResponseDTO,
  StoreBasicInfoRequestDTO,
  StoreBasicInfoResponseDTO,
  StoreDetailInfoRequestDTO,
  StoreDetailInfoResponseDTO,
  BusinessHoursDTO,
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

// POST /users/push-token - 푸시 토큰 등록
export const registerPushToken = async (pushToken: string) => {
  const response = await apiClient.post('/users/push-token', { 
    push_token: pushToken,
    platform: 'expo' 
  });
  return response.data;
};

// GET /users/me - 마이페이지 정보 조회
export const getMyInfo = async (): Promise<GetUserInfoResponseDTO> => {
  const response = await apiClient.get<GetUserInfoResponseDTO>('/users/me');
  return response.data;
};

// PUT /users/me - 프로필 수정
export const updateProfile = async (
  data: UpdateProfileRequestDTO | FormData
): Promise<UpdateProfileResponseDTO> => {
  const headers = data instanceof FormData 
    ? { 'Content-Type': 'multipart/form-data' }
    : { 'Content-Type': 'application/json' };
    
  const response = await apiClient.put<UpdateProfileResponseDTO>('/users/me', data, { headers });
  return response.data;
};

// PUT /users/me/password 또는 PUT /stores/me/password - 비밀번호 변경
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

// POST /api/v1/reservations/{reservationId}/approval - 예약 승인
export const acceptReservation = async (
  reservationId: number
): Promise<ReservationActionResponseDTO> => {
  try {
    const requestData: ReservationActionRequestDTO = {
      action: 'APPROVE'
    };
    
    console.log('✅ [예약 승인] API 요청 시작:', {
      reservationId,
      endpoint: `/reservations/${reservationId}/approval`,
      data: requestData
    });
    
    const response = await apiClient.post<ReservationActionResponseDTO>(
      `/reservations/${reservationId}/approval`,
      requestData
    );
    
    console.log('✅ [예약 승인] API 응답 성공:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [예약 승인] API 오류:', {
      reservationId,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// POST /api/v1/reservations/{reservationId}/approval - 예약 거절
export const rejectReservation = async (
  reservationId: number,
  reason?: string
): Promise<ReservationActionResponseDTO> => {
  try {
    const requestData: ReservationActionRequestDTO = {
      action: 'REJECT',
      reason: reason || '사유 없음'
    };
    
    console.log('❌ [예약 거절] API 요청 시작:', {
      reservationId,
      endpoint: `/reservations/${reservationId}/approval`,
      data: requestData
    });
    
    const response = await apiClient.post<ReservationActionResponseDTO>(
      `/reservations/${reservationId}/approval`,
      requestData
    );
    
    console.log('❌ [예약 거절] API 응답 성공:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [예약 거절] API 오류:', {
      reservationId,
      reason,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
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
  
  const response = await apiClient.get<MatchesResponseDTO>(url);
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
  
  const response = await apiClient.get<ScheduleResponseDTO>(url);
  return response.data;
};

// 가게 정보 관련 API

// 매장 정보 조회 - GET /api/v1/stores/me
export const getStoreInfo = async (): Promise<StoreInfoResponseDTO> => {
  const response = await apiClient.get<StoreInfoResponseDTO>('/stores/me');
  return response.data;
};

// 매장 기본 정보 수정 - PUT /api/v1/stores/me/basic-info
export const updateStoreBasicInfo = async (
  data: StoreBasicInfoRequestDTO
): Promise<StoreBasicInfoResponseDTO> => {
  const response = await apiClient.put<StoreBasicInfoResponseDTO>('/stores/me/basic-info', data);
  return response.data;
};

// 알림 설정 업데이트 - PUT /api/v1/stores/me/settings/notification
export const updateNotificationSettings = async (
  data: {
    reservation_alerts: boolean;
    payment_alerts: boolean;
    system_alerts: boolean;
    marketing_alerts: boolean;
  }
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put('/stores/me/settings/notification', data);
  return response.data;
};

// 예약 설정 업데이트 - PUT /api/v1/stores/me/settings/reservation
export const updateReservationSettings = async (
  data: {
    deposit_amount?: number;
    min_participants?: number;
    available_times?: Array<{ day: string; start: string; end: string }>;
  }
): Promise<{ success: boolean; message: string }> => {
  console.log('🌐 [API] updateReservationSettings 호출:', data);
  console.log('🌐 [API] 요청 URL: /stores/me/settings/reservation');
  
  const response = await apiClient.put('/stores/me/settings/reservation', data);
  
  console.log('🌐 [API] 응답 성공:', response.data);
  return response.data;
};



// 스포츠 카테고리 조회
export const getSportsCategories = async () => {
  const response = await apiClient.get('/stores/me/sports-categories');
  return response.data;
};

// 스포츠 카테고리 추가
export const addSportsCategory = async (categoryName: string) => {
  const response = await apiClient.post('/stores/me/sports-categories', {
    category_name: categoryName
  });
  return response.data;
};

// 스포츠 카테고리 삭제
export const deleteSportsCategory = async (categoryName: string) => {
  const response = await apiClient.delete(`/stores/me/sports-categories/${categoryName}`);
  return response.data;
};

// 가게 상세 정보 관련 API

// 매장 상세 정보 수정 - PUT /api/v1/stores/me/details
export const updateStoreDetailInfo = async (
  data: StoreDetailInfoRequestDTO
): Promise<StoreDetailInfoResponseDTO> => {

  const response = await apiClient.put<StoreDetailInfoResponseDTO>('/stores/me/details', data);

  return response.data;
};

// 편의시설 관련 API

// 편의시설 목록 조회 - GET /api/v1/stores/me/facilities
export const getStoreFacilities = async () => {
  const response = await apiClient.get('/stores/me/facilities');
  return response.data;
};

// 편의시설 추가 - POST /api/v1/stores/me/facilities
export const addStoreFacility = async (data: { facility_type: string; facility_name: string }) => {
  const response = await apiClient.post('/stores/me/facilities', data);
  return response.data;
};

// 편의시설 수정 - PUT /api/v1/stores/me/facilities/{facility_id}
export const updateStoreFacility = async (
  facilityId: number, 
  data: { facility_type: string; facility_name: string; is_available: boolean }
) => {
  const response = await apiClient.put(`/stores/me/facilities/${facilityId}`, data);
  return response.data;
};

// 편의시설 삭제 - DELETE /api/v1/stores/me/facilities/{facility_id}
export const deleteStoreFacility = async (facilityId: number) => {
  const response = await apiClient.delete(`/stores/me/facilities/${facilityId}`);
  return response.data;
};

// 편의시설 사용 가능 여부 토글 - PUT /api/v1/stores/me/facilities/{facility_id}/toggle
export const toggleStoreFacility = async (facilityId: number) => {
  const response = await apiClient.put(`/stores/me/facilities/${facilityId}/toggle`);
  return response.data;
};

// 예약 설정 조회
export const getReservationSettings = async () => {
  const response = await apiClient.get('/stores/me/settings/reservation');
  return response.data;
};

// 회원 탈퇴 관련 API

// 일반 사용자 회원 탈퇴 - DELETE /api/v1/users/me
export const deleteUser = async (): Promise<{ success: boolean; message: string }> => {
  console.log('🌐 [API] deleteUser 호출: DELETE /users/me');
  const response = await apiClient.delete('/users/me');
  console.log('✅ [API] deleteUser 성공:', response.data);
  return response.data;
};

// 사장님 회원 탈퇴 - DELETE /api/v1/stores/me
export const deleteStore = async (): Promise<{ success: boolean; message: string }> => {
  console.log('🌐 [API] deleteStore 호출: DELETE /stores/me');
  const response = await apiClient.delete('/stores/me');
  console.log('✅ [API] deleteStore 성공:', response.data);
  return response.data;
};

// POST /api/v1/stores/me/images - 매장 이미지 업로드
export const uploadStoreImages = async (images: File[]): Promise<any> => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append('images', image);
  });
  
  const response = await apiClient.post('/stores/me/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// GET /api/v1/stores/me/images - 매장 이미지 조회
export const getStoreImages = async (): Promise<any> => {
  const response = await apiClient.get('/stores/me/images');
  return response.data;
};

// PUT /api/v1/stores/me/images/reorder - 이미지 순서 변경
export const reorderStoreImages = async (imageIds: string[]): Promise<any> => {
  const response = await apiClient.put('/stores/me/images/reorder', {
    image_ids: imageIds
  });
  return response.data;
};

// PUT /api/v1/stores/me/images/{imageId}/main - 메인 이미지 설정
export const setMainStoreImage = async (imageId: string): Promise<any> => {
  const response = await apiClient.put(`/stores/me/images/${imageId}/main`);
  return response.data;
};


