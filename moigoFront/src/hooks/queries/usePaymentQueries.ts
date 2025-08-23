import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startPayment, completePayment, getPaymentStatus } from '@/apis/payment';
import type { StartPaymentRequestDTO, CompletePaymentRequestDTO } from '@/types/DTO/payment';

// 정산 상태 조회 훅
export const usePaymentStatus = (roomId: number) => {
  return useQuery({
    queryKey: ['payment-status', roomId],
    queryFn: () => getPaymentStatus(roomId),
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
    retry: (failureCount, error) => {
      // 404는 정산이 시작되지 않은 경우이므로 재시도하지 않음
      if ((error as any)?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// 정산 시작 훅 (방장만 가능)
export const useStartPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: StartPaymentRequestDTO }) => 
      startPayment(roomId, data),
    onSuccess: (response, variables) => {
      console.log('✅ 정산 시작 성공:', response);
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['payment-status', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      queryClient.invalidateQueries({ queryKey: ['chat-participants', variables.roomId] });
    },
    onError: (error) => {
      console.error('❌ 정산 시작 실패:', error);
    },
  });
};

// 개별 입금 완료 훅
export const useCompletePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: CompletePaymentRequestDTO }) => 
      completePayment(roomId, data),
    onSuccess: (response, variables) => {
      console.log('✅ 입금 완료 성공:', response);
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['payment-status', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
    onError: (error) => {
      console.error('❌ 입금 완료 실패:', error);
    },
  });
};