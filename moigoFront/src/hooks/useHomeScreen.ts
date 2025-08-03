import { useState, useEffect } from 'react';
import { events } from '@/mocks/events';
import { useMyStore } from '@/store/myStore';
import { useGetReservations } from '@/hooks/queries/useReservationQueries';

export function useHomeScreen() {
  const { userProfile } = useMyStore();
  const defaultSports = ['축구', '야구', '농구', '격투기', '게임'];
  const userPreferredSports = userProfile?.preferredSports || [];
  const filterOptions = ['전체', ...defaultSports, ...userPreferredSports];
  const filterLocations = ['서울', '경기', '인천', '대전', '대구', '부산'];

  // 필터 관련 상태
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  // API 데이터 가져오기
  const { data: reservations, isLoading, error } = useGetReservations();

  // 모달 관련 상태
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [isEnterModalVisible, setIsEnterModalVisible] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalTransitioning, setIsModalTransitioning] = useState<boolean>(false);
  
  // 토스트 관련 상태
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

  // 이벤트 참여 함수
  const handleParticipate = (event: any) => {
    // 모달 전환 중에는 다른 액션 방지
    if (isModalTransitioning) return;

    setIsModalTransitioning(true);

    // 필터 모달이 열려있다면 먼저 닫기
    if (isFilterModalVisible) {
      setIsFilterModalVisible(false);
      // 약간의 지연 후 참여 모달 열기
      setTimeout(() => {
        setSelectedEvent(event);
        setIsEnterModalVisible(true);
        setIsModalTransitioning(false);
      }, 200);
    } else {
      setSelectedEvent(event);
      setIsEnterModalVisible(true);
      setIsModalTransitioning(false);
    }
  };

  // 모달 닫기 함수들
  const closeFilterModal = () => {
    setIsFilterModalVisible(false);
  };

  const closeEnterModal = () => {
    setIsEnterModalVisible(false);
    // 약간의 지연 후 selectedEvent 초기화
    setTimeout(() => {
      setSelectedEvent(null);
    }, 100);
  };

  // 토스트 관련 함수들
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  // API 데이터와 필터링된 이벤트
  const eventsToShow = reservations?.data || events; // API 데이터가 있으면 사용, 없으면 mock 데이터

  // 검색어와 필터에 따른 이벤트 필터링
  const filteredEvents = eventsToShow.filter((event: any) => {
    // 검색어 필터링
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      searchText === '' ||
      event.title?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower) ||
      event.sportType?.toLowerCase().includes(searchLower) ||
      event.reservation_bio?.toLowerCase().includes(searchLower);

    // 카테고리 필터링
    const matchesCategory = selectedFilter === '전체' || event.sportType === selectedFilter;

    // 위치 필터링 (복수 선택)
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.includes(event.region);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return {
    filterOptions,
    filterLocations,

    // 상태
    selectedFilter,
    selectedLocations,
    searchText,
    isFilterModalVisible,
    isEnterModalVisible,
    selectedEvent,
    filteredEvents,
    isLoading,
    error,

    // 토스트 상태
    showToast,
    toastMessage,
    toastType,

    // 액션
    setSelectedFilter,
    setSearchText,
    toggleLocation,
    resetFilters,
    handleParticipate,
    setIsFilterModalVisible,
    closeFilterModal,
    closeEnterModal,
    showSuccessToast,
    showErrorToast,
    hideToast,
  };
}
