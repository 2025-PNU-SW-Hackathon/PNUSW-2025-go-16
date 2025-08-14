import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getStoreDashboard, 
  getStoreReservations,
  acceptReservation,
  rejectReservation
} from '@/apis/users';
import type { 
  StoreDashboardDTO, 
  StoreReservationDTO,
  ReservationActionRequestDTO 
} from '@/types/DTO/users';

// 사장님 대시보드 정보 조회 훅
export const useStoreDashboard = () => {
  return useQuery({
    queryKey: ['storeDashboard'],
    queryFn: getStoreDashboard,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 사장님 예약 관리 목록 조회 훅
export const useStoreReservations = () => {
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
  
  return useMutation({
    mutationFn: acceptReservation,
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
  
  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: number; reason?: string }) =>
      rejectReservation(reservationId, reason),
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

// 사장님 홈 화면 통합 훅
export const useHomeScreen = () => {
  const [selectedReservation, setSelectedReservation] = useState<StoreReservationDTO | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const queryClient = useQueryClient();

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
