import { useState, useEffect } from 'react';
import type { Reservation } from '@/types/reservation';
import type { MatchingHistoryDTO } from '@/types/DTO/users';
import { getMatchingHistory } from '@/apis/users';

export default function useMeeting() {
  const [visible, setVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [matchingHistory, setMatchingHistory] = useState<MatchingHistoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchingHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMatchingHistory();
      if (response.success) {
        setMatchingHistory(response.data);
      } else {
        setError('매칭 이력을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('매칭 이력 조회 오류:', err);
      setError('매칭 이력을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchingHistory();
  }, []);

  const openModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setVisible(true);
  };
  
  const closeModal = () => setVisible(false);

  const refreshMatchingHistory = () => {
    fetchMatchingHistory();
  };

  return {
    visible,
    selectedReservation,
    matchingHistory,
    loading,
    error,
    openModal,
    closeModal,
    refreshMatchingHistory,
  };
}
