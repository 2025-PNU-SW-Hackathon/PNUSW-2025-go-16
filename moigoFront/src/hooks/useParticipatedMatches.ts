import React from 'react';
import { useParticipatedMatchesStore } from '@/store/participatedMatchesStore';
import { useGetMatchingHistory } from '@/hooks/queries/useUserQueries';
import { Alert } from 'react-native';

// 카테고리 코드를 한글로 변환하는 함수
const getCategoryFromCode = (code: string | number | undefined): '축구' | '야구' | '농구' | '격투기' | '게임' | '전체' => {
  if (!code) return '축구'; // 기본값
  
  const codeStr = String(code).toLowerCase();
  
  // 축구 관련 코드들
  if (['pl', 'pd', 'bl1', 'sa', 'fl1', 'cl', 'el', 'ec', 'wc', 'cli', 'acl', '1'].includes(codeStr)) {
    return '축구';
  }
  
  // 야구 관련 코드들
  if (['kbo', '2'].includes(codeStr)) {
    return '야구';
  }
  
  // 농구 관련 코드들
  if (['nba', 'kbl', '3'].includes(codeStr)) {
    return '농구';
  }
  
  // 격투기 관련 코드들
  if (['ufc', 'mma', '4'].includes(codeStr)) {
    return '격투기';
  }
  
  // 게임 관련 코드들
  if (['lol', 'dota', 'csgo', '5'].includes(codeStr)) {
    return '게임';
  }
  
  return '축구'; // 기본값
};

export function useParticipatedMatches() {
  // API에서 매칭 이력 가져오기
  const { data: matchingHistory, isLoading: isApiLoading, error } = useGetMatchingHistory();
  
  const {
    selectedCategory,
    selectedSort,
    isLoading: isStoreLoading,
    getFilteredAndSortedMatches,
    setCategory,
    setSort,
    writeReview,
    setLoading,
    updateMatches,
  } = useParticipatedMatchesStore();

  // API 데이터를 store에 업데이트
  React.useEffect(() => {
    if (matchingHistory?.data) {
      console.log('매칭 이력 API 응답:', matchingHistory.data);
      
      // API 응답을 store 형식으로 변환
      const transformedMatches = matchingHistory.data.map((item) => {
        const date = new Date(item.reservation_start_time);
        return {
          id: item.reservation_id.toString(),
          title: item.reservation_title || item.match_name || item.reservation_match,
          date: date,
          time: date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          location: item.store_name,
          status: item.status,
          category: getCategoryFromCode(item.reservation_ex2 || item.reservation_match_category), // 카테고리 코드를 한글로 변환
          participants: 0, // API에서 참가자 수 정보가 없으므로 기본값 사용
          maxParticipants: 0, // API에서 최대 참가자 수 정보가 없으므로 기본값 사용
          hasReview: false, // 기본값
        };
      });
      
      updateMatches(transformedMatches);
    }
  }, [matchingHistory, updateMatches]);

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
    selectedCategory,
    selectedSort,
    isLoading: isApiLoading || isStoreLoading,
    filteredAndSortedMatches: getFilteredAndSortedMatches(),
    error,
    
    // 액션
    handleCategoryChange,
    handleSortChange,
    handleWriteReview,
  };
} 