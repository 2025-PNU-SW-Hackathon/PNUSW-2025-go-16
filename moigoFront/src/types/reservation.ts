export interface Reservation {
  type: 'collecting' | 'waiting' | 'confirmed';
  title: string;
  description: string;
  time: string;
  date: string;
  status: string;
}

// 참여한 매칭 이력 관련 타입들
export interface ParticipatedMatch {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  category: '축구' | '야구' | '농구' | '격투기' | '게임';
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
