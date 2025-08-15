import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { 
  getStoreDashboard, 
  getStoreReservations,
  acceptReservation,
  rejectReservation,
  getReservationHistory,
  getMatches
} from '@/apis/users';
import { getReservations } from '@/apis/reservations';
import type { 
  StoreDashboardDTO, 
  StoreReservationDTO,
  ReservationActionRequestDTO 
} from '@/types/DTO/users';

// 사장님 대시보드 정보 조회 훅
export const useStoreDashboard = () => {
  const { user } = useAuthStore();
  
  // 일반 사용자가 호출하려고 하면 에러 발생
  if (user?.userType !== 'business') {
    console.error('사장님 계정으로만 접근 가능한 API입니다.');
    throw new Error('사장님 계정으로만 접근 가능합니다.');
  }
  
  return useQuery({
    queryKey: ['storeDashboard'],
    queryFn: getStoreDashboard,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 일반 사용자용 홈 화면 훅 (사장님 전용 API 호출하지 않음)
export const useUserHomeScreenOnly = () => {
  const { user } = useAuthStore();
  
  // 일반 사용자가 사장님 전용 API를 호출하지 않도록 방지
  if (user?.userType === 'business') {
    console.warn('일반 사용자용 훅입니다. 사장님은 useBusinessHomeScreen을 사용하세요.');
    return null;
  }
  
  return {
    userType: user?.userType,
    isBusinessUser: false,
  };
};

// 사장님 예약 관리 목록 조회 훅
export const useStoreReservations = () => {
  const { user } = useAuthStore();
  
  // 일반 사용자가 호출하려고 하면 에러 발생
  if (user?.userType !== 'business') {
    console.error('사장님 계정으로만 접근 가능한 API입니다.');
    throw new Error('사장님 계정으로만 접근 가능합니다.');
  }
  
  return useQuery({
    queryKey: ['storeReservations'],
    queryFn: getStoreReservations,
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 예약 승인 훅
export const useAcceptReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: any) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return acceptReservation(data);
    },
    onSuccess: (data) => {
      console.log('예약 승인 성공:', data);
      // 예약 목록과 대시보드 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['storeReservations'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
    },
    onError: (error) => {
      console.error('예약 승인 실패:', error);
    },
  });
};

// 예약 거절 훅
export const useRejectReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: number; reason?: string }) => {
      if (user?.userType !== 'business') {
        throw new Error('사장님 계정으로만 접근 가능합니다.');
      }
      return rejectReservation(reservationId, reason);
    },
    onSuccess: (data) => {
      console.log('예약 거절 성공:', data);
      // 예약 목록과 대시보드 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['storeReservations'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
    },
    onError: (error) => {
      console.error('예약 거절 실패:', error);
    },
  });
};

// 일반 사용자 홈 화면 훅
export const useUserHomeScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isEnterModalVisible, setIsEnterModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // 필터 옵션
  const filterOptions = ['all', '축구', '야구', '농구', '기타'];
  const filterLocations = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종'];

  // 필터에 따른 카테고리 매핑
  const getCategoryFromFilter = (filter: string): number | undefined => {
    switch (filter) {
      case '축구': return 1;
      case '야구': return 2;
      case '농구': return 3;
      case '기타': return 4;
      default: return undefined; // 'all'인 경우
    }
  };

  // 일반 사용자 모임 조회 API (GET /api/v1/reservations)
  const { 
    data: reservationsData, 
    isLoading: isReservationsLoading, 
    error: reservationsError,
    refetch: refetchReservations
  } = useQuery({
    queryKey: ['reservations', selectedFilter, selectedLocations],
    queryFn: () => getReservations({
      category: getCategoryFromFilter(selectedFilter)?.toString(),
      // 지역 필터는 백엔드에서 지원하는 경우 추가
    }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 필터링된 모임 목록
  const filteredEvents = reservationsData?.data || [];

  // 새로고침 함수
  const handleRefresh = async () => {
    try {
      console.log('새로고침 시작 - 모임 조회 API 재호출');
      await refetchReservations();
      console.log('새로고침 완료 - 모임 조회 API 재호출 성공');
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  };

  // 토스트 표시 함수들
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  // 필터 모달 관련
  const openFilterModal = () => setIsFilterModalVisible(true);
  const closeFilterModal = () => setIsFilterModalVisible(false);

  // 참여 모달 관련
  const openEnterModal = (event: any) => {
    setSelectedEvent(event);
    setIsEnterModalVisible(true);
  };

  const closeEnterModal = () => {
    setIsEnterModalVisible(false);
    setSelectedEvent(null);
  };

  // 위치 토글
  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  // 필터 리셋
  const resetFilters = () => {
    setSelectedFilter('all');
    setSelectedLocations([]);
  };

  // 이벤트 참여 처리 - 모달 열기
  const handleParticipate = (event: any) => {
    console.log('이벤트 참여 모달 열기:', event);
    openEnterModal(event);
  };

  return {
    // 상태
    searchText,
    setSearchText,
    selectedFilter,
    setSelectedFilter,
    selectedLocations,
    setSelectedLocations,
    isFilterModalVisible,
    isEnterModalVisible,
    selectedEvent,
    showToast,
    toastMessage,
    toastType,
    
    // 필터 옵션
    filterOptions,
    filterLocations,
    
    // 데이터
    filteredEvents,
    isLoading: isReservationsLoading,
    
    // 에러 상태
    reservationsError,
    
    // 액션 함수들
    openFilterModal,
    closeFilterModal,
    openEnterModal,
    closeEnterModal,
    toggleLocation,
    resetFilters,
    showSuccessToast,
    showErrorToast,
    hideToast,
    handleParticipate,
    setIsFilterModalVisible,
    handleRefresh,
  };
};

// 사장님 홈 화면 통합 훅
export const useBusinessHomeScreen = () => {
  const [selectedReservation, setSelectedReservation] = useState<StoreReservationDTO | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 사장님이 아닌 경우 에러 처리
  if (user?.userType !== 'business') {
    console.warn('사장님 계정으로만 접근 가능한 화면입니다. 사용자 타입:', user?.userType);
    console.log('현재 사용자 정보:', user);
    return {
      dashboardData: null,
      reservations: [],
      selectedReservation: null,
      isDashboardLoading: false,
      isReservationsLoading: false,
      isLoading: false,
      dashboardError: new Error('사장님 계정으로만 접근 가능합니다.'),
      reservationsError: new Error('사장님 계정으로만 접근 가능합니다.'),
      showAcceptModal: false,
      showRejectModal: false,
      openAcceptModal: () => {},
      openRejectModal: () => {},
      closeModals: () => {},
      handleAcceptReservation: async () => {},
      handleRejectReservation: async () => {},
      handleRefresh: async () => {},
      stats: {
        totalReservations: 0,
        pendingReservations: 0,
        acceptedReservations: 0,
        completedReservations: 0,
        todayReservations: 0,
        weeklyReservations: 0,
        averageRating: '0.0',
      },
      isAccepting: false,
      isRejecting: false,
    };
  }

  // 대시보드 정보 조회
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useStoreDashboard();

  // 예약 목록 조회
  const { 
    data: reservationsData, 
    isLoading: isReservationsLoading, 
    error: reservationsError,
    refetch: refetchReservations
  } = useStoreReservations();

  // 예약 승인/거절 훅
  const acceptReservationMutation = useAcceptReservation();
  const rejectReservationMutation = useRejectReservation();

  // 새로고침 함수
  const handleRefresh = async () => {
    try {
      console.log('새로고침 시작 - API 재호출');
      
      // 두 API를 동시에 재호출
      await Promise.all([
        refetchDashboard(),
        refetchReservations()
      ]);
      
      console.log('새로고침 완료 - API 재호출 성공');
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  };

  // 예약 승인 처리
  const handleAcceptReservation = async (reservationId: number) => {
    try {
      console.log('🎯 [승인 처리] handleAcceptReservation 호출됨 - ID:', reservationId);
      const result = await acceptReservationMutation.mutateAsync(reservationId);
      console.log('✅ [승인 처리] 성공 - 결과:', result);
      setShowAcceptModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('❌ [승인 처리] 실패:', error);
    }
  };

  // 예약 거절 처리
  const handleRejectReservation = async (reservationId: number, reason?: string) => {
    try {
      console.log('🚫 [거절 처리] handleRejectReservation 호출됨 - ID:', reservationId, '사유:', reason);
      const result = await rejectReservationMutation.mutateAsync({ reservationId, reason });
      console.log('✅ [거절 처리] 성공 - 결과:', result);
      setShowRejectModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('❌ [거절 처리] 실패:', error);
    }
  };

  // 예약 승인 모달 열기
  const openAcceptModal = (reservation: StoreReservationDTO) => {
    setSelectedReservation(reservation);
    setShowAcceptModal(true);
  };

  // 예약 거절 모달 열기
  const openRejectModal = (reservation: StoreReservationDTO) => {
    setSelectedReservation(reservation);
    setShowRejectModal(true);
  };

  // 모달 닫기
  const closeModals = () => {
    setShowAcceptModal(false);
    setShowRejectModal(false);
    setSelectedReservation(null);
  };

  // 통계 데이터 계산 (실제 API 응답에 맞게 수정)
  const stats = {
    totalReservations: reservationsData?.data?.length || 0,
    pendingReservations: reservationsData?.data?.filter(r => r.reservation_status === 'PENDING_APPROVAL').length || 0,
    acceptedReservations: reservationsData?.data?.filter(r => r.reservation_status === 'CONFIRMED').length || 0,
    completedReservations: reservationsData?.data?.filter(r => r.reservation_status === 'COMPLETED').length || 0,
    todayReservations: dashboardData?.data?.today_reservations_count || 0,
    weeklyReservations: dashboardData?.data?.this_week_reservations_count || 0,
    averageRating: dashboardData?.data?.average_rating || '0.0',
  };

  return {
    // 데이터
    dashboardData: dashboardData?.data,
    reservations: reservationsData?.data || [],
    selectedReservation,
    
    // 로딩 상태
    isDashboardLoading,
    isReservationsLoading,
    isLoading: isDashboardLoading || isReservationsLoading,
    
    // 에러 상태
    dashboardError,
    reservationsError,
    
    // 모달 상태
    showAcceptModal,
    showRejectModal,
    
    // 액션 함수들
    openAcceptModal,
    openRejectModal,
    closeModals,
    handleAcceptReservation,
    handleRejectReservation,
    handleRefresh, // 새로고침 함수 추가
    
    // 통계
    stats,
    
    // 뮤테이션 상태
    isAccepting: acceptReservationMutation.isPending,
    isRejecting: rejectReservationMutation.isPending,
  };
};

// 일반 사용자용 홈 화면 훅 (기본 export)
export const useHomeScreen = () => {
  const { user } = useAuthStore();
  
  // 사장님이 호출하려고 하면 경고
  if (user?.userType === 'business') {
    console.warn('일반 사용자용 훅입니다. 사장님은 useBusinessHomeScreen을 사용하세요.');
    return null;
  }
  
  return {
    userType: user?.userType,
    isBusinessUser: false,
  };
};
