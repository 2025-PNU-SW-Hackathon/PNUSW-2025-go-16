import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
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
  getReservationSettings,
  getStoreFacilities,
  addStoreFacility,
  updateStoreFacility,
  deleteStoreFacility,
  toggleStoreFacility,
} from '../../apis/users';
import { deleteUser, deleteStore } from '../../apis/users';
import type {
  UpdateProfileRequestDTO,
  ChangePasswordRequestDTO,
  UpdateUserSettingsRequestDTO,
  StoreBasicInfoRequestDTO,
  StoreDetailInfoRequestDTO,
} from '../../types/DTO/users';

// GET /users/me - 마이페이지 정보 조회 훅
export const useGetMyInfo = () => {
  const { isLoggedIn, token, user } = useAuthStore();
  
  return useQuery({
    queryKey: ['my-info'],
    queryFn: () => {
      console.log('🔍 [useGetMyInfo] API 호출 시작:', {
        isLoggedIn,
        hasToken: !!token,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      return getMyInfo();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 15 * 60 * 1000, // 15분
    enabled: isLoggedIn && !!token, // 🆕 로그인 상태와 토큰이 있을 때만 실행
    retry: (failureCount, error) => {
      console.log('❌ [useGetMyInfo] API 실패:', {
        failureCount,
        error: error?.message,
        status: (error as any)?.response?.status
      });
      
      // 401, 403 에러는 재시도하지 않음 (인증 문제)
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 403) {
        console.log('🚫 [useGetMyInfo] 인증 오류로 재시도 중단');
        return false;
      }
      
      // 최대 3번까지 재시도
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
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
  const { user } = useAuthStore();
  
  // 일반 사용자가 호출하려고 하면 에러 발생
  if (user?.userType !== 'business') {
    console.error('사장님 계정으로만 접근 가능한 API입니다.');
    throw new Error('사장님 계정으로만 접근 가능합니다.');
  }
  
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
    mutationFn: (data: UpdateProfileRequestDTO | FormData) => updateProfile(data),
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

// PUT /users/me/password 또는 PUT /stores/me/password - 비밀번호 변경 훅
export const useChangePassword = () => {
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: ChangePasswordRequestDTO & { endpoint?: string }) => {
      const { endpoint, ...passwordData } = data;
      
      // 사장님 전용 API 호출 시 역할 검증
      if (endpoint === '/stores/me/password' && user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      
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
  const { user } = useAuthStore();
  
  // 일반 사용자가 호출하려고 하면 에러 발생
  if (user?.userType !== 'business') {
    console.error('사장님 계정으로만 접근 가능한 API입니다.');
    throw new Error('사장님 계정으로만 접근 가능합니다.');
  }
  
  return useQuery({
    queryKey: ['storeInfo'],
    queryFn: () => getStoreInfo(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

export const useUpdateStoreBasicInfo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: StoreBasicInfoRequestDTO) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return updateStoreBasicInfo(data);
    },
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
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      reservation_alerts: boolean;
      payment_alerts: boolean;
      system_alerts: boolean;
      marketing_alerts: boolean;
    }) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return updateNotificationSettings(data);
    },
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

// 예약 설정 조회
export const useReservationSettings = () => {
  const { user } = useAuthStore();
  
  // 일반 사용자가 호출하려고 하면 에러 발생
  if (user?.userType !== 'business') {
    console.error('사장님 계정으로만 접근 가능한 API입니다.');
    throw new Error('사장님 계정으로만 접근 가능합니다.');
  }
  
  return useQuery({
    queryKey: ['reservationSettings'],
    queryFn: getReservationSettings,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 예약 설정 수정
export const useUpdateReservationSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: any) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return updateReservationSettings(data);
    },
    onMutate: (data) => {
      console.log('🚀 [훅] 예약 설정 수정 시작:', data);
    },
    onSuccess: (data) => {
      console.log('✅ [훅] 예약 설정 수정 성공:', data);
      // 예약 설정 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['reservationSettings'] });
      // StoreInfo 쿼리도 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
    },
    onError: (error) => {
      console.error('❌ [훅] 예약 설정 수정 실패:', error);
    },
  });
}; 

// 가게 상세 정보 수정 훅
export const useUpdateStoreDetailInfo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: StoreDetailInfoRequestDTO) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      console.log('🏪 [훅] 매장 상세 정보 수정 요청:', data);
      console.log('🏪 [훅] 편의시설 데이터 확인:', data.facilities);
      return updateStoreDetailInfo(data);
    },
    onSuccess: (response) => {
      // 매장 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
      console.log('✅ [훅] 매장 상세 정보 수정 성공:', response);
      
      // 캐시 무효화 후 즉시 새로고침
      queryClient.refetchQueries({ queryKey: ['storeInfo'] });
    },
    onError: (error) => {
      console.error('❌ [훅] 매장 상세 정보 수정 실패:', error);
    },
  });
};

// 편의시설 관련 훅들

// 편의시설 목록 조회 훅
export const useStoreFacilities = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['storeFacilities'],
    queryFn: () => getStoreFacilities(),
    enabled: user?.userType === 'business',
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 편의시설 추가 훅
export const useAddStoreFacility = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: { facility_type: string; facility_name: string }) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return addStoreFacility(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeFacilities'] });
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
    },
  });
};

// 편의시설 수정 훅
export const useUpdateStoreFacility = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ facilityId, data }: { 
      facilityId: number; 
      data: { facility_type: string; facility_name: string; is_available: boolean } 
    }) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return updateStoreFacility(facilityId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeFacilities'] });
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
    },
  });
};

// 편의시설 삭제 훅
export const useDeleteStoreFacility = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (facilityId: number) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return deleteStoreFacility(facilityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeFacilities'] });
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
    },
  });
};

// 편의시설 토글 훅
export const useToggleStoreFacility = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (facilityId: number) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return toggleStoreFacility(facilityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeFacilities'] });
      queryClient.invalidateQueries({ queryKey: ['storeInfo'] });
    },
  });
}; 

 

// 스포츠 카테고리 조회
export const useSportsCategories = () => {
  const { user } = useAuthStore();
  
  // 일반 사용자가 호출하려고 하면 에러 발생
  if (user?.userType !== 'business') {
    console.error('사장님 계정으로만 접근 가능한 API입니다.');
    throw new Error('사장님 계정으로만 접근 가능합니다.');
  }
  
  return useQuery({
    queryKey: ['sportsCategories'],
    queryFn: getSportsCategories,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 스포츠 카테고리 추가
export const useAddSportsCategory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: any) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return addSportsCategory(data);
    },
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
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: any) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return deleteSportsCategory(data);
    },
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

// 회원 탈퇴 훅
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  
  return useMutation({
    mutationFn: async () => {
      console.log('🚀 [useDeleteAccount] mutationFn 시작, 사용자 타입:', user?.userType);
      if (user?.userType === 'business') {
        console.log('🏢 [useDeleteAccount] 사장님 회원 탈퇴 API 호출');
        return deleteStore();
      } else {
        console.log('👤 [useDeleteAccount] 일반 사용자 회원 탈퇴 API 호출');
        return deleteUser();
      }
    },
    onSuccess: (data) => {
      console.log('✅ [useDeleteAccount] 회원 탈퇴 성공:', data);
      // 모든 쿼리 캐시 무효화
      queryClient.clear();
      // 로그아웃 처리
      logout();
    },
    onError: (error) => {
      console.error('❌ [useDeleteAccount] 회원 탈퇴 실패:', error);
    },
  });
}; 