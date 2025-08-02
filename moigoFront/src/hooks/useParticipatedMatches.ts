import { useParticipatedMatchesStore } from '@/store/participatedMatchesStore';
import { Alert } from 'react-native';

export function useParticipatedMatches() {
  const {
    matches,
    selectedCategory,
    selectedSort,
    isLoading,
    getFilteredAndSortedMatches,
    setCategory,
    setSort,
    writeReview,
    setLoading,
  } = useParticipatedMatchesStore();

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    console.log('카테고리 변경:', category);
    setCategory(category as any);
  };

  // 정렬 변경
  const handleSortChange = (sort: string) => {
    console.log('정렬 변경:', sort);
    setSort(sort as any);
  };

  // 리뷰 작성
  const handleWriteReview = (matchId: string) => {
    setLoading(true);
    
    // 실제로는 API 호출이 들어갈 자리
    setTimeout(() => {
      writeReview(matchId);
      setLoading(false);
      Alert.alert('알림', '리뷰 작성 페이지로 이동합니다.');
    }, 500);
  };

  return {
    // 상태
    matches,
    selectedCategory,
    selectedSort,
    isLoading,
    filteredAndSortedMatches: getFilteredAndSortedMatches(),
    
    // 액션
    handleCategoryChange,
    handleSortChange,
    handleWriteReview,
  };
} 