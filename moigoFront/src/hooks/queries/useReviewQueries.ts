import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview, getMyReviews } from '../../apis/reviews';
import type { CreateReviewRequestDTO } from '../../types/DTO/reviews';

// GET /users/me/reviews - 내 리뷰 목록 조회 훅
export const useGetMyReviews = () => {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => getMyReviews(),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
};

// POST /reviews - 리뷰 작성 훅
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequestDTO) => createReview(data),
    onSuccess: () => {
      // 리뷰 작성 성공 시 내 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
    onError: (error) => {
      console.error('리뷰 작성 실패:', error);
    },
  });
}; 