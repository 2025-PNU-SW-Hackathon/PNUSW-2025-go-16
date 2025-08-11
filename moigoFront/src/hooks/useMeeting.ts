import { useState } from 'react';
import type { Reservation } from '@/types/reservation';
import { useGetReservationHistory } from './queries/useUserQueries';

export default function useMeeting() {
  const [visible, setVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  const { 
    data: reservationHistory, 
    isLoading: loading, 
    error: queryError,
    refetch: refreshReservationHistory
  } = useGetReservationHistory();

  const error = queryError ? '참여중인 모임 목록을 불러오는데 실패했습니다.' : null;

  const openModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setVisible(true);
  };
  
  const closeModal = () => setVisible(false);

  const refreshMatchingHistory = () => {
    refreshReservationHistory();
  };

  return {
    visible,
    selectedReservation,
    matchingHistory: reservationHistory?.data || [],
    loading,
    error,
    openModal,
    closeModal,
    refreshMatchingHistory,
  };
}
