import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { events } from '@/mocks/events';

interface CreateMeetingForm {
  meetingName: string;
  maxPeople: number;
  description: string;
}

export function useCreateMeeting() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const filterOptions = ['전체', '축구', '야구', '농구', '격투기', '게임'];
  const filterLocations = ['서울', '경기', '인천', '대전', '대구', '부산'];
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateMeetingForm>({
    defaultValues: {
      meetingName: '',
      maxPeople: 4,
      description: '',
    },
    mode: 'onChange',
  });

  // 유효성 검사 규칙 설정
  const validationRules = {
    meetingName: {
      required: '모임 이름을 입력해주세요',
      minLength: { value: 2, message: '모임 이름은 2자 이상 입력해주세요' },
      maxLength: { value: 50, message: '모임 이름은 50자 이하로 입력해주세요' },
    },
    maxPeople: {
      required: '최대 인원 수를 설정해주세요',
      min: { value: 1, message: '최소 1명 이상 설정해주세요' },
      max: { value: 50, message: '최대 50명까지 설정 가능합니다' },
    },
    description: {
      maxLength: { value: 300, message: '설명은 300자 이하로 입력해주세요' },
    },
  };

  // register 함수들
  const registerMeetingName = register('meetingName', validationRules.meetingName);
  const registerMaxPeople = register('maxPeople', validationRules.maxPeople);
  const registerDescription = register('description', validationRules.description);

  // 경기 선택 시 모임 이름 자동 세팅
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setValue('meetingName', `${event.home} vs ${event.away} 볼 사람 !`);
    }
  };

  // 폼 제출 핸들러
  const onSubmit = (data: CreateMeetingForm) => {
    console.log('모임 등록:', { selectedEventId, ...data });
    // TODO: 실제 등록 로직 구현
  };

  // 필수 입력값 체크 (경기 선택 + 폼 유효성)
  const isFormValid = !!selectedEventId && !!watch('meetingName') && watch('maxPeople') > 0;

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
    setCurrentPage(0);
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
    events,
    selectedEventId,
    handleSelectEvent,
    searchText,
    setSearchText,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    filteredEvents,
    // 필터 모달 관련
    isFilterModalVisible,
    setIsFilterModalVisible,
    filterLocations,
    selectedLocations,
    toggleLocation,
    resetFilters,
    // 페이지네이션 관련
    currentPage,
    setCurrentPage,
    // 폼 관련
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    onSubmit,
    isFormValid,
    registerMeetingName,
    registerMaxPeople,
    registerDescription,
  };
}
