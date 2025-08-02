import { events } from '@/mocks/events';
import { useMeetingForm } from './useMeetingForm';
import { useEventSelection } from './useEventSelection';
import { useEventFilter } from './useEventFilter';
import { useEventPagination } from './useEventPagination';
import type { CreateMeetingForm } from './useMeetingForm';

// 메인 훅 - 모든 기능을 조합
export function useCreateMeeting() {
  const form = useMeetingForm();
  const eventSelection = useEventSelection();
  const eventFilter = useEventFilter();
  const eventPagination = useEventPagination();

  // 필수 입력값 체크 (경기 선택 + 폼 유효성)
  const isFormValid =
    !!eventSelection.selectedEventId && !!form.watch('meetingName') && form.watch('maxPeople') > 0;

  // 폼 제출 핸들러
  const onSubmit = (data: CreateMeetingForm) => {
    console.log('모임 등록:', { selectedEventId: eventSelection.selectedEventId, ...data });
    // TODO: 실제 등록 로직 구현
  };

  return {
    // 이벤트 관련
    events,
    selectedEventId: eventSelection.selectedEventId,
    handleSelectEvent: (eventId: string) =>
      eventSelection.handleSelectEvent(eventId, form.setValue),

    // 필터 관련
    ...eventFilter,

    // 페이지네이션 관련
    ...eventPagination,

    // 폼 관련
    ...form,
    onSubmit,
    isFormValid,
  };
}

// 개별 훅들도 export
export { useMeetingForm } from './useMeetingForm';
export { useEventSelection } from './useEventSelection';
export { useEventFilter } from './useEventFilter';
export { useEventPagination } from './useEventPagination';
export type { CreateMeetingForm } from './useMeetingForm';
