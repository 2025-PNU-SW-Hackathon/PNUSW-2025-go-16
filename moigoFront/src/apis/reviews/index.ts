import apiClient from '../apiClient';
import type {
  CreateReviewRequestDTO,
  CreateReviewResponseDTO,
  GetMyReviewsResponseDTO,
} from '../../types/DTO/reviews';

// POST /reviews - 리뷰 작성
export const createReview = async (
  data: CreateReviewRequestDTO
): Promise<CreateReviewResponseDTO> => {
  const response = await apiClient.post<CreateReviewResponseDTO>(
    '/reviews',
    data
  );
  return response.data;
};

// GET /users/me/reviews - 내 리뷰 목록 조회
export const getMyReviews = async (): Promise<GetMyReviewsResponseDTO> => {
  const response = await apiClient.get<GetMyReviewsResponseDTO>(
    '/users/me/reviews'
  );
  return response.data;
}; 