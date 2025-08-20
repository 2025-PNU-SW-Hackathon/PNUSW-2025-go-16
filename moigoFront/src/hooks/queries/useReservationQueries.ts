import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReservations,
  createReservation,
  getMatches,
  getMatchDetail,
  getMatchReservations,
  joinReservation,
} from '../../apis/reservations';
import type {
  ReservationQueryDTO,
  CreateReservationRequestDTO,
  MatchQueryDTO,
} from '../../types/DTO/reservations';

// GET /api/v1/reservations - 예약 목록 조회 훅
export const useGetReservations = (queryParams?: ReservationQueryDTO) => {
  return useQuery({
    queryKey: ['reservations', queryParams],
    queryFn: () => getReservations(queryParams),
    staleTime: 2 * 60 * 1000, // 2분간 신선하다고 간주
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnMount: true, // 컴포넌트 마운트 시 새로고침 (캐시가 stale한 경우만)
    refetchOnWindowFocus: true, // 화면 포커스 시 새로고침 (캐시가 stale한 경우만)
    retry: 1, // 재시도 횟수 제한
    retryDelay: 1000, // 재시도 간격
  });
};

// GET /api/v1/matches - 경기 목록 조회 훅
export const useGetMatches = (queryParams?: MatchQueryDTO) => {
  return useQuery({
    queryKey: ['matches', queryParams],
    queryFn: () => getMatches(queryParams),
    staleTime: 5 * 60 * 1000, // 5분간 신선하다고 간주 (경기 정보는 자주 변경되지 않음)
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });
};

// GET /api/v1/matches/:match_id - 특정 경기 상세 정보 조회 훅
export const useGetMatchDetail = (matchId: number) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatchDetail(matchId),
    enabled: !!matchId, // matchId가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
  });
};

// GET /api/v1/matches/:match_id/reservations - 경기별 모임 조회 훅
export const useGetMatchReservations = (matchId: number) => {
  return useQuery({
    queryKey: ['match-reservations', matchId],
    queryFn: () => getMatchReservations(matchId),
    enabled: !!matchId, // matchId가 있을 때만 쿼리 실행
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });
};

// POST /api/v1/reservations - 모임 생성 훅
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequestDTO) => createReservation(data),
    onSuccess: () => {
      // 모임 생성 성공 시 모임 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['match-reservations'] });
    },
    onError: (error) => {
      console.error('모임 생성 실패:', error);
    },
  });
};

// POST /reservations/{reservation_id}/join - 모임 참여 훅
export const useJoinReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: number) => {
      const response = await joinReservation(reservationId);
      return response;
    },
    onSuccess: (data) => {
      console.log('모임 참여 성공:', data);
      // 모임 참여 성공 시 모임 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['match-reservations'] });
      // 참여중인 모임 목록 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['reservation-history'] });
    },
    onError: (error: any) => {
      console.error('모임 참여 실패:', error);
      
      // 에러 코드에 따른 메시지 처리
      if (error?.response?.data?.errorCode === 'ALREADY_JOINED') {
        console.error('이미 참여 중인 모임입니다.');
      } else if (error?.response?.data?.errorCode === 'INVALID_ACTION') {
        console.error('참여할 수 없는 모임입니다.');
      }
    },
  });
}; 