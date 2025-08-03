import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createReservation,
  joinReservation,
  getReservations,
  cancelReservation,
  getReservationDetail,
} from '../../apis/reservations';
import type {
  CreateReservationRequestDTO,
  GetReservationsQueryDTO,
} from '../../types/DTO/reservations';

// GET /reservations - 모임 조회 훅
export const useGetReservations = (queryParams?: GetReservationsQueryDTO) => {
  return useQuery({
    queryKey: ['reservations', queryParams],
    queryFn: () => getReservations(queryParams),
    staleTime: 2 * 60 * 1000, // 2분간 신선하다고 간주
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnMount: true, // 컴포넌트 마운트 시 새로고침 (캐시가 stale한 경우만)
    refetchOnWindowFocus: true, // 화면 포커스 시 새로고침 (캐시가 stale한 경우만)
  });
};

// GET /reservations/{reservation_id} - 모임 상세 조회 훅
export const useGetReservationDetail = (reservationId: number) => {
  return useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => getReservationDetail(reservationId),
    enabled: !!reservationId,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// POST /reservations - 모임 생성 훅
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequestDTO) => createReservation(data),
    onSuccess: () => {
      // 모임 생성 성공 시 모임 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
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
    mutationFn: (reservationId: number) => joinReservation(reservationId),
    onSuccess: () => {
      // 모임 참여 성공 시 모임 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      console.error('모임 참여 실패:', error);
    },
  });
};

// DELETE /reservations/{reservation_id} - 모임 취소 훅
export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => cancelReservation(reservationId),
    onSuccess: () => {
      // 모임 취소 성공 시 모임 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      console.error('모임 취소 실패:', error);
    },
  });
}; 