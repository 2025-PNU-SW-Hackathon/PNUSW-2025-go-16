import { create } from 'zustand';

// 예약 타입 정의
interface Reservation {
  id: string;
  status: 'recruiting' | 'reserved' | 'confirmed';
  time: string;
  date: string;
  title: string;
  group: string;
  people: string;
  info: string;
  infoIcon: string;
  action: string;
  actionColor: string;
}

// 예약 스토어 타입 정의
interface ReservationState {
  // 상태
  reservations: Reservation[];
  isLoading: boolean;
  
  // 액션
  setReservations: (reservations: Reservation[]) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

// 예약 스토어 생성
export const useReservationStore = create<ReservationState>((set) => ({
  // 초기 상태
  reservations: [
    {
      id: '1',
      status: 'recruiting',
      time: '19:30',
      date: '7월 06일',
      title: '토트넘 vs 맨시티',
      group: '스포츠 팬 클럽',
      people: '4인 예약',
      info: '인원 모집중',
      infoIcon: 'time',
      action: '상세보기',
      actionColor: '#FF6B00',
    },
    {
      id: '2',
      status: 'reserved',
      time: '20:00',
      date: '7월 06일',
      title: 'KBL 결승전',
      group: '챔피언 스포츠 펍',
      people: '3인 예약',
      info: '30분 내 입금 필요',
      infoIcon: 'alert-circle',
      action: '상세보기',
      actionColor: '#FF6B00',
    },
    {
      id: '3',
      status: 'confirmed',
      time: '18:00',
      date: '7월 06일',
      title: '두산 vs LG',
      group: '스포츠 타임',
      people: '6인 예약',
      info: '예약이 확정되었습니다',
      infoIcon: 'checkmark',
      action: '상세보기',
      actionColor: '#FF6B00',
    },
  ],
  isLoading: false,
  
  // 예약 목록 설정
  setReservations: (reservations: Reservation[]) => {
    set({ reservations });
  },
  
  // 예약 추가
  addReservation: (reservation: Reservation) => {
    set((state) => ({
      reservations: [...state.reservations, reservation],
    }));
  },
  
  // 예약 수정
  updateReservation: (id: string, updates: Partial<Reservation>) => {
    set((state) => ({
      reservations: state.reservations.map((reservation) =>
        reservation.id === id ? { ...reservation, ...updates } : reservation
      ),
    }));
  },
  
  // 예약 삭제
  deleteReservation: (id: string) => {
    set((state) => ({
      reservations: state.reservations.filter((reservation) => reservation.id !== id),
    }));
  },
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 