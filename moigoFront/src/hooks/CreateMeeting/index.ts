import { useMeetingForm } from './useMeetingForm';
import { useEventSelection } from './useEventSelection';
import { useEventFilter } from './useEventFilter';
import { useEventPagination } from './useEventPagination';
import { useGetReservations, useCreateReservation } from '@/hooks/queries/useReservationQueries';
import type { CreateMeetingForm } from './useMeetingForm';
import type { CreateReservationRequestDTO } from '@/types/DTO/reservations';

// 메인 훅 - 모든 기능을 조합
export function useCreateMeeting() {
  const form = useMeetingForm();
  const eventSelection = useEventSelection();
  
  // API로 모임 데이터 가져오기
  const { data: reservations, isLoading, error } = useGetReservations();
  
  // 모임 생성 API
  const createReservationMutation = useCreateReservation();

  // API 데이터 사용
  const eventsToShow = reservations?.data || [];
  
  // 디버깅 로그
  console.log('CreateMeeting API 응답:', {
    reservations,
    isLoading,
    error,
    eventsToShow: eventsToShow.length,
  });
  
  // API 데이터를 필터 훅에 전달
  const eventFilter = useEventFilter(eventsToShow);
  const eventPagination = useEventPagination();

  // 필수 입력값 체크 (경기 선택 + 폼 유효성)
  const isFormValid =
    !!eventSelection.selectedEventId && !!form.watch('meetingName') && form.watch('maxPeople') > 0;

  // 폼 제출 핸들러
  const onSubmit = async (data: CreateMeetingForm) => {
    if (!eventSelection.selectedEventId) {
      console.error('선택된 경기가 없습니다.');
      return;
    }

    const selectedEvent = eventsToShow.find((e) => e.reservation_id.toString() === eventSelection.selectedEventId);
    if (!selectedEvent) {
      console.error('선택된 경기를 찾을 수 없습니다.');
      return;
    }

    // ISO 8601 형식을 MySQL datetime 형식으로 변환
    const formatDateTimeForMySQL = (isoString: string) => {
      const date = new Date(isoString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    // 모임 생성 요청 데이터 구성
    const createRequest: CreateReservationRequestDTO = {
      store_id: selectedEvent.store_id,
      reservation_start_time: formatDateTimeForMySQL(selectedEvent.reservation_start_time),
      reservation_end_time: formatDateTimeForMySQL(selectedEvent.reservation_end_time),
      reservation_match: data.meetingName, // 사용자가 입력한 모임 이름 사용
      reservation_bio: data.description,
      reservation_max_participant_cnt: data.maxPeople,
      reservation_match_category: 1, // 기본값 (필요시 수정)
    };

    console.log('모임 생성 요청:', createRequest);

    try {
      const response = await createReservationMutation.mutateAsync(createRequest);
      console.log('모임 생성 성공:', response);
      return response;
    } catch (error) {
      console.error('모임 생성 실패:', error);
      throw error;
    }
  };

  return {
    // 이벤트 관련
    events: eventsToShow,
    selectedEventId: eventSelection.selectedEventId,
    handleSelectEvent: (eventId: string) =>
      eventSelection.handleSelectEvent(eventId, form.setValue, eventsToShow),

    // 필터 관련
    ...eventFilter,

    // 페이지네이션 관련
    ...eventPagination,

    // 폼 관련
    ...form,
    onSubmit,
    isFormValid,
    
    // API 상태
    isLoading,
    error,
    isCreating: createReservationMutation.isPending,
    createError: createReservationMutation.error,
  };
}

// 개별 훅들도 export
export { useMeetingForm } from './useMeetingForm';
export { useEventSelection } from './useEventSelection';
export { useEventFilter } from './useEventFilter';
export { useEventPagination } from './useEventPagination';
export type { CreateMeetingForm } from './useMeetingForm';
