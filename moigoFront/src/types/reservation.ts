export interface Reservation {
  type: 'collecting' | 'waiting' | 'confirmed';
  title: string;
  description: string;
  time: string;
  date: string;
  status: string;
}
