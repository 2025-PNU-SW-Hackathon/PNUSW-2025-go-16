import { useState } from 'react';
import { useJoinReservation } from '@/hooks/queries/useReservationQueries';

export function useEnterModal() {
  const [message, setMessage] = useState('');
  const joinReservation = useJoinReservation();

  const handleConfirm = async (
    event: any, 
    onClose: () => void, 
    showSuccessToast: (message: string) => void, 
    showErrorToast: (message: string) => void
  ) => {
    try {
      const reservationId = event.id || event.reservation_id;
      
      if (!reservationId) {
        console.error('예약 ID가 없습니다:', event);
        onClose();
        setTimeout(() => {
          showErrorToast('예약 ID를 찾을 수 없습니다');
        }, 300);
        return;
      }

      console.log('참여 시도:', { 
        reservationId, 
        event,
        user_id: 'user1', // 현재 토큰의 user_id
        reservation_participant_cnt: event.reservation_participant_cnt,
        reservation_max_participant_cnt: event.reservation_max_participant_cnt
      });
      
      // API 호출
      await joinReservation.mutateAsync(reservationId);
      
      console.log('참여 성공:', { event, message });
      onClose();
      setMessage('');
      
      // 모달이 닫힌 후 성공 토스트 표시
      setTimeout(() => {
        showSuccessToast('모임 참여가 완료되었습니다!');
      }, 300);
    } catch (error: any) {
      console.error('참여 실패:', error);
      
      // 에러 메시지 설정
      let errorMessage = '모임 참여에 실패했습니다';
      if (error?.response?.status === 409) {
        errorMessage = '이미 참여 중인 모임입니다';
      } else if (error?.response?.status === 400) {
        errorMessage = '참여할 수 없는 모임입니다';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // 모달 닫고 에러 토스트 표시
      onClose();
      setMessage('');
      setTimeout(() => {
        showErrorToast(errorMessage);
      }, 300);
    }
  };

  const handleCancel = (onClose: () => void) => {
    onClose();
    setMessage('');
  };

  const resetMessage = () => {
    setMessage('');
  };

  return {
    message,
    setMessage,
    handleConfirm,
    handleCancel,
    resetMessage,
    isLoading: joinReservation.isPending,
  };
} 