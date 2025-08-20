import { create } from 'zustand';
import type { Review, ReviewFormData } from '@/types/reservation';

interface ReviewState {
  // 상태
  reviews: Review[];
  isLoading: boolean;
  
  // 액션
  submitReview: (matchId: string, reviewData: ReviewFormData) => void;
  getReviewByMatchId: (matchId: string) => Review | undefined;
  setLoading: (loading: boolean) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  // 초기 상태
  reviews: [],
  isLoading: false,
  
  // 리뷰 제출
  submitReview: (matchId: string, reviewData: ReviewFormData) => {
    const newReview: Review = {
      id: Date.now().toString(),
      matchId,
      rating: reviewData.rating,
      content: reviewData.content,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      reviews: [...state.reviews, newReview],
    }));
  },
  
  // 매치 ID로 리뷰 조회
  getReviewByMatchId: (matchId: string) => {
    return get().reviews.find((review) => review.matchId === matchId);
  },
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 