import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyInfo,
  updateProfile,
  changePassword,
  getMatchingHistory,
  updateUserSettings,
  getUserProfile,
  getReservationHistory,
  getMatches,
  getStoreSchedule,
  getStoreInfo,
  updateStoreBasicInfo,
  updateNotificationSettings,
  updateReservationSettings,
  updateStoreDetailInfo,
  deleteSportsCategory,
  addSportsCategory,
  getSportsCategories,
  updateBusinessHours,
} from '../../apis/users';
import type {
  UpdateProfileRequestDTO,
  ChangePasswordRequestDTO,
  UpdateUserSettingsRequestDTO,
  StoreBasicInfoRequestDTO,
  StoreDetailInfoRequestDTO,
} from '../../types/DTO/users';

// GET /users/me - 마이페이지 정보 조회 훅
export const useGetMyInfo = () => {
  return useQuery({
    queryKey: ['my-info'],
    queryFn: () => getMyInfo(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 15 * 60 * 1000, // 15분
  });
};

// GET /users/me/matchings - 참여한 매칭 이력 조회 훅
export const useGetMatchingHistory = () => {
  return useQuery({
    queryKey: ['matching-history'],
    queryFn: () => getMatchingHistory(),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
};

// GET /users/{userId}/profile - 유저 정보 조회 훅
export const useGetUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 15 * 60 * 1000, // 15분
  });
};

// GET /users/me/reservations - 참여중인 매칭 이력 조회 훅
export const useGetReservationHistory = () => {
  return useQuery({
    queryKey: ['reservation-history'],
    queryFn: () => getReservationHistory(),
  });
};

// 일정 관련 훅 (명세서 기반)
export const useMatches = (params?: {
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
}) => {
  return useQuery({
    queryKey: ['matches', params],
    queryFn: () => getMatches(params),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 3, // 재시도 3회
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });
};

export const useStoreSchedule = (params?: {
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: ['storeSchedule', params],
    queryFn: () => getStoreSchedule(params),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    retry: 3, // 재시도 3회
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });
};

// PUT /users/me - 프로필 수정 훅
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequestDTO) => updateProfile(data),
    onSuccess: () => {
      // 프로필 수정 성공 시 관련된 모든 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['matching-history'] });
      // console.log('프로필 수정 후 쿼리 무효화 완료');
    },
    onError: (error) => {
      console.error('프로필 수정 실패:', error);
    },
  });
};

// PUT /users/me/password - 비밀번호 변경 훅
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequestDTO & { endpoint?: string }) => {
      const { endpoint, ...passwordData } = data;
      return changePassword(passwordData, endpoint);
    },
    onError: (error) => {
      console.error('비밀번호 변경 실패:', error);
    },
  });
};

// PATCH /users/me - 사용자 설정 변경 훅
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserSettingsRequestDTO) => updateUserSettings(data),
    onSuccess: () => {
      // 설정 변경 성공 시 마이페이지 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('사용자 설정 변경 실패:', error);
    },
  });
};

// 가게 정보 관련 훅
export const useStoreInfo = () => {
  return useQuery({
    queryKey: ['storeInfo'],
    queryFn: () => getStoreInfo(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

export const useUpdateStoreBasicInfo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: StoreBasicInfoRequestDTO) => updateStoreBasicInfo(data),
    onSuccess: () => {
      // 매장 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
      console.log('✅ [훅] 매장 기본 정보 수정 성공');
    },
    onError: (error) => {
      console.error('❌ [훅] 매장 기본 정보 수정 실패:', error);
    },
  });
}; 

// 알림 설정 업데이트 훅
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      reservation_alerts: boolean;
      payment_alerts: boolean;
      system_alerts: boolean;
      marketing_alerts: boolean;
    }) => updateNotificationSettings(data),
    onSuccess: () => {
      // 매장 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
      console.log('✅ [훅] 알림 설정 업데이트 성공');
    },
    onError: (error) => {
      console.error('❌ [훅] 알림 설정 업데이트 실패:', error);
    },
  });
};

// 예약 설정 업데이트 훅
export const useUpdateReservationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      deposit_amount?: number;
      min_participants?: number;
      available_times?: Array<{ day: string; start: string; end: string }>;
    }) => updateReservationSettings(data),
    onSuccess: () => {
      // 매장 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
      console.log('✅ [훅] 예약 설정 업데이트 성공');
    },
    onError: (error) => {
      console.error('❌ [훅] 예약 설정 업데이트 실패:', error);
    },
  });
}; 

// 가게 상세 정보 수정 훅
export const useUpdateStoreDetailInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreDetailInfoRequestDTO) => updateStoreDetailInfo(data),
    onSuccess: () => {
      // 매장 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
      console.log('✅ [훅] 매장 상세 정보 수정 성공');
    },
    onError: (error) => {
      console.error('❌ [훅] 매장 상세 정보 수정 실패:', error);
    },
  });
}; 

// 영업 시간 설정 수정
export const useUpdateBusinessHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBusinessHours,
    onSuccess: (data) => {
      console.log('✅ 영업 시간 설정 수정 성공:', data);
      // StoreInfo 쿼리 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
    },
    onError: (error) => {
      console.error('❌ 영업 시간 설정 수정 실패:', error);
    },
  });
}; 

// 스포츠 카테고리 조회
export const useSportsCategories = () => {
  return useQuery({
    queryKey: ['sportsCategories'],
    queryFn: getSportsCategories,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 스포츠 카테고리 추가
export const useAddSportsCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSportsCategory,
    onSuccess: (data) => {
      console.log('✅ 스포츠 카테고리 추가 성공:', data);
      // 스포츠 카테고리 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['sportsCategories'] });
    },
    onError: (error) => {
      console.error('❌ 스포츠 카테고리 추가 실패:', error);
    },
  });
};

// 스포츠 카테고리 삭제
export const useDeleteSportsCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSportsCategory,
    onSuccess: (data) => {
      console.log('✅ 스포츠 카테고리 삭제 성공:', data);
      // 스포츠 카테고리 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['sportsCategories'] });
    },
    onError: (error) => {
      console.error('❌ 스포츠 카테고리 삭제 실패:', error);
    },
  });
}; 