// 리뷰 작성 요청 DTO
export interface CreateReviewRequestDTO {
  store_id: string;
  review_text: string;
  review_rating: number;
  review_visited_time: string; // ISO 8601 형식
  images?: string[]; // 이미지 파일명 배열
}

// 리뷰 작성 응답 DTO
export interface CreateReviewResponseDTO {
  success: boolean;
  data: {
    review_id: number;
  };
}

// 리뷰 정보 DTO
export interface ReviewDTO {
  review_id: number;
  store_id: string;
  store_name: string;
  review_text: string;
  review_rating: number;
  review_created_time: string; // ISO 8601 형식
}

// 내 리뷰 목록 조회 응답 DTO
export interface GetMyReviewsResponseDTO {
  success: boolean;
  data: ReviewDTO[];
} 