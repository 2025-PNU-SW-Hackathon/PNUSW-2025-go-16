import { useState } from 'react';
import { Alert } from 'react-native';
import { useReviewStore } from '@/store/reviewStore';
import { useParticipatedMatchesStore } from '@/store/participatedMatchesStore';
import type { ParticipatedMatch } from '@/types/reservation';

export function useReview() {
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ParticipatedMatch | null>(null);

  const { submitReview, setLoading } = useReviewStore();
  const { writeReview } = useParticipatedMatchesStore();

  // 리뷰 모달 열기
  const openReviewModal = (match: ParticipatedMatch) => {
    setSelectedMatch(match);
    setIsReviewModalVisible(true);
  };

  // 리뷰 모달 닫기
  const closeReviewModal = () => {
    setIsReviewModalVisible(false);
    setSelectedMatch(null);
  };

  // 리뷰 제출
  const handleSubmitReview = (rating: number, content: string) => {
    if (!selectedMatch) return;

    setLoading(true);

    // 실제로는 API 호출이 들어갈 자리
    setTimeout(() => {
      // 리뷰 스토어에 저장
      submitReview(selectedMatch.id, { rating, content });

      // 매칭 스토어에서 리뷰 완료 상태 업데이트
      writeReview(selectedMatch.id);

      setLoading(false);
      Alert.alert('알림', '리뷰가 성공적으로 등록되었습니다.');
    }, 1000);
  };

  return {
    // 상태
    isReviewModalVisible,
    selectedMatch,

    // 액션
    openReviewModal,
    closeReviewModal,
    handleSubmitReview,
  };
}
