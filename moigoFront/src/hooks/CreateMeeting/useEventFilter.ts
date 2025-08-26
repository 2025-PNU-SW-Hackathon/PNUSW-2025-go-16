import { useState } from 'react';
import { events } from '@/mocks/events';
import type { MatchDTO } from '@/types/DTO/reservations';

// 필터 관련 훅
export function useEventFilter(eventsToShow: any[] = events) {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // 경기 데이터에서 고유한 대회 코드들을 추출하여 필터 옵션 생성
  const uniqueCompetitions = Array.from(new Set(eventsToShow.map((event: any) => event.competition_code))).filter(Boolean);
  const filterOptions = ['전체', ...uniqueCompetitions];
  const filterLocations = ['서울', '경기', '인천', '대전', '대구', '부산'];
  
  // 디버깅 로그 (한 번만 출력)
  if (eventsToShow.length > 0) {
    console.log('필터 옵션 생성:', {
      uniqueCompetitions,
      filterOptions,
      eventsCount: eventsToShow.length
    });
  }

  // 위치 선택/해제 함수
  const toggleLocation = (location: string) => {
    if (location === '전체') {
      setSelectedLocations([]);
    } else {
      setSelectedLocations((prev) => {
        if (prev.includes(location)) {
          return prev.filter((loc) => loc !== location);
        } else {
          return [...prev, location];
        }
      });
    }
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setSelectedFilter('전체');
    setSelectedLocations([]);
    setSearchText('');
  };

  // 검색어와 필터에 따른 이벤트 필터링
  const filteredEvents = eventsToShow.filter((event: any) => {
    // 검색어 필터링
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      searchText === '' ||
      event.home_team?.toLowerCase().includes(searchLower) ||
      event.away_team?.toLowerCase().includes(searchLower) ||
      event.venue?.toLowerCase().includes(searchLower) ||
      event.competition_code?.toLowerCase().includes(searchLower);

    // 카테고리 필터링 (대회 코드 사용)
    const matchesCategory = selectedFilter === '전체' || event.competition_code === selectedFilter;

    // 위치 필터링 (venue 사용)
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.some(location => 
        event.venue?.includes(location)
      );

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return {
    searchText,
    setSearchText,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    filteredEvents,
    isFilterModalVisible,
    setIsFilterModalVisible,
    filterLocations,
    selectedLocations,
    toggleLocation,
    resetFilters,
  };
}
