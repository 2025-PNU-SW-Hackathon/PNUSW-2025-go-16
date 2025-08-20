export interface Reservation {
  type: 'collecting' | 'waiting' | 'confirmed';
  title: string;
  description: string;
  time: string;
  date: string;
  status: string;
  store_id: string;
  max_participant_cnt: number;
}

// 참여한 매칭 이력 관련 타입들
export interface ParticipatedMatch {
  id: string;
  title: string;
  date: string | Date;
  time?: string;
  location: string;
  participants: number;
  maxParticipants: number;
  category: '축구' | '야구' | '농구' | '격투기' | '게임';
  status: string;
  hasReview: boolean;
}

export type MatchCategory = '전체' | '축구' | '야구' | '농구' | '격투기' | '게임';
export type SortOption = '최신순' | '오래된순';

// 리뷰 관련 타입들
export interface Review {
  id: string;
  matchId: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface ReviewFormData {
  rating: number;
  content: string;
}

// 비밀번호 변경 관련 타입들
export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}
