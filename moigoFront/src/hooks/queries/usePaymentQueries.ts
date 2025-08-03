import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  requestPayment,
  initiatePayment,
  paymentCallback,
  approveReservation,
  getPaymentStatus,
  kickParticipant,
} from '../../apis/payments';
import type {
  RequestPaymentRequestDTO,
  InitiatePaymentRequestDTO,
  PaymentCallbackRequestDTO,
  ReservationApprovalRequestDTO,
} from '../../types/DTO/payments';

// GET /chat/rooms/{roomId}/payments/status - 결제 현황 조회 훅
export const useGetPaymentStatus = (roomId: number) => {
  return useQuery({
    queryKey: ['payment-status', roomId],
    queryFn: () => getPaymentStatus(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30초 (결제 상태는 자주 변경될 수 있음)
    gcTime: 2 * 60 * 1000, // 2분
  });
};

// POST /chat/rooms/{roomId}/payments/request - 예약금 결제 요청 훅
export const useRequestPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: RequestPaymentRequestDTO }) =>
      requestPayment(roomId, data),
    onSuccess: () => {
      // 결제 요청 성공 시 결제 현황 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
    },
    onError: (error) => {
      console.error('결제 요청 실패:', error);
    },
  });
};

// POST /chat/rooms/{roomId}/payments/initiate - 결제 시작 훅
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: InitiatePaymentRequestDTO }) =>
      initiatePayment(roomId, data),
    onSuccess: () => {
      // 결제 시작 성공 시 결제 현황 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
    },
    onError: (error) => {
      console.error('결제 시작 실패:', error);
    },
  });
};

// POST /api/payments/callback - 결제 결과 콜백 훅
export const usePaymentCallback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentCallbackRequestDTO) => paymentCallback(data),
    onSuccess: () => {
      // 결제 콜백 성공 시 결제 현황 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
    },
    onError: (error) => {
      console.error('결제 콜백 실패:', error);
    },
  });
};

// POST /api/reservations/{reservationId}/approval - 예약 승인/거절 훅
export const useApproveReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, data }: { reservationId: number; data: ReservationApprovalRequestDTO }) =>
      approveReservation(reservationId, data),
    onSuccess: () => {
      // 예약 승인/거절 성공 시 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
    },
    onError: (error) => {
      console.error('예약 승인/거절 실패:', error);
    },
  });
};

// DELETE /chat/rooms/{roomId}/participants/{userId} - 결제 미완료 참가자 강퇴 훅
export const useKickParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: string }) =>
      kickParticipant(roomId, userId),
    onSuccess: () => {
      // 강퇴 성공 시 결제 현황 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
    },
    onError: (error) => {
      console.error('참가자 강퇴 실패:', error);
    },
  });
}; 