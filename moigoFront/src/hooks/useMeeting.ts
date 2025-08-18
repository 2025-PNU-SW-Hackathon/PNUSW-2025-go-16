import { useState, useEffect } from 'react';
import type { Reservation } from '@/types/reservation';

export default function useMeeting() {
  const [visible, setVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const openModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setVisible(true);
  };
  const closeModal = () => setVisible(false);

  return {
    visible,
    selectedReservation,
    openModal,
    closeModal,
  };
}
