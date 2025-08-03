import { useState } from 'react';
import { events } from '@/mocks/events';

// 필터 관련 훅
export function useEventFilter(eventsToShow: any[] = events) {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // API 데이터에서 고유한 reservation_ex1 값들을 추출하여 필터 옵션 생성
  const uniqueEx1Values = Array.from(new Set(eventsToShow.map((event: any) => event.reservation_ex1))).filter(Boolean);
  const filterOptions = ['전체', ...uniqueEx1Values];
  const filterLocations = ['서울', '경기', '인천', '대전', '대구', '부산'];
  
  // 디버깅 로그
  console.log('필터 옵션:', {
    uniqueEx1Values,
    filterOptions,
    selectedFilter,
    eventsCount: eventsToShow.length
  });
  
  // 디버깅 로그
  console.log('필터 옵션 생성:', {
    uniqueEx1Values,
    filterOptions,
    eventsCount: eventsToShow.length
  });

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
      event.title?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower) ||
      event.sportType?.toLowerCase().includes(searchLower) ||
      event.reservation_bio?.toLowerCase().includes(searchLower) ||
      event.reservation_match?.toLowerCase().includes(searchLower) ||
      event.reservation_ex1?.toLowerCase().includes(searchLower);

    // 카테고리 필터링 (reservation_ex1 사용)
    const matchesCategory = selectedFilter === '전체' || event.reservation_ex1 === selectedFilter;

    // 위치 필터링
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.includes(event.region);

    // 디버깅 로그
    if (selectedFilter !== '전체') {
      console.log('필터링 디버그:', {
        eventId: event.reservation_id,
        eventEx1: event.reservation_ex1,
        selectedFilter,
        matchesCategory,
        eventTitle: event.reservation_match
      });
    }

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
