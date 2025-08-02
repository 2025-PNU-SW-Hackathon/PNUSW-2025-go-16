import { useState } from 'react';
import { events } from '@/mocks/events';

// 필터 관련 훅
export function useEventFilter() {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filterOptions = ['전체', '축구', '야구', '농구', '격투기', '게임'];
  const filterLocations = ['서울', '경기', '인천', '대전', '대구', '부산'];

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
  const filteredEvents = events.filter((event) => {
    // 검색어 필터링
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      searchText === '' ||
      event.title.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.sportType.toLowerCase().includes(searchLower);

    // 카테고리 필터링
    const matchesCategory = selectedFilter === '전체' || event.sportType === selectedFilter;

    // 위치 필터링
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.includes(event.region);

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
