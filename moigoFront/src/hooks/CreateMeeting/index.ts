import { useMeetingForm } from './useMeetingForm';
import { useEventSelection } from './useEventSelection';
import { useEventFilter } from './useEventFilter';
import { useEventPagination } from './useEventPagination';
import { useGetMatches, useCreateReservation } from '@/hooks/queries/useReservationQueries';
import type { CreateMeetingForm } from './useMeetingForm';
import type { CreateReservationRequestDTO } from '@/types/DTO/reservations';
import { useAuthStore } from '@/store/authStore';

// 메인 훅 - 모든 기능을 조합
export function useCreateMeeting() {
  const form = useMeetingForm();
  const eventSelection = useEventSelection();
  
  // 경기 데이터 가져오기 (기존 예약 데이터 대신)
  const { data: matches, isLoading, error } = useGetMatches();
  
  // 모임 생성 API
  const createReservationMutation = useCreateReservation();

  // API 데이터 사용
  const eventsToShow = matches?.data || [];
  
  // 디버깅 로그 (한 번만 출력)
  if (eventsToShow.length > 0) {
    console.log('CreateMeeting 경기 데이터:', {
      matchesCount: eventsToShow.length,
      isLoading,
      error: error?.message,
      firstEvent: eventsToShow[0], // 첫 번째 경기 데이터 구조 확인
      firstEventId: eventsToShow[0]?.id, // 첫 번째 경기의 ID 확인
      firstEventIdType: typeof eventsToShow[0]?.id, // ID의 타입 확인
    });
  } else {
    console.log('CreateMeeting 경기 데이터 없음:', {
      isLoading,
      error: error?.message,
      matches: matches,
    });
  }
  
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

    // 토큰 상태 확인
    const { token } = useAuthStore.getState();
    console.log('모임 생성 시 토큰 상태:', {
      hasToken: !!token,
      tokenValue: token ? token.substring(0, 20) + '...' : '없음',
      isLoggedIn: useAuthStore.getState().isLoggedIn,
    });

    // 안전한 타입 체크 추가
    const selectedEvent = eventsToShow.find((e) => {
      // id가 존재하고 유효한 값인지 확인
      if (e.id === undefined || e.id === null) {
        console.warn('경기 데이터에 id가 없습니다:', e);
        return false;
      }
      // selectedEventId가 유효한지 확인
      if (!eventSelection.selectedEventId) {
        console.warn('selectedEventId가 유효하지 않습니다:', eventSelection.selectedEventId);
        return false;
      }
      return e.id.toString() === eventSelection.selectedEventId;
    });
    
    if (!selectedEvent) {
      console.error('선택된 경기를 찾을 수 없습니다.');
      return;
    }

    // 경기 시간을 기준으로 모임 시간 설정 (경기 1시간 전 ~ 경기 2시간 후)
    const matchDate = new Date(selectedEvent.match_date);
    const reservationStartTime = new Date(matchDate.getTime() - 60 * 60 * 1000); // 1시간 전
    const reservationEndTime = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000); // 2시간 후

    // 날짜와 시간을 분리하여 새로운 형식으로 변환
    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 10); // YYYY-MM-DD
    };

    const formatTime = (date: Date) => {
      return date.toTimeString().slice(0, 8); // HH:MM:SS
    };

    // 모임 생성 요청 데이터 구성 (match_id 포함)
    const createRequest: CreateReservationRequestDTO = {
      match_id: selectedEvent.id, // 🎯 경기 ID 전송 (백엔드에서 competition_code 자동 설정)
      store_id: "1", // 기본 매장 ID (실제로는 사용자가 선택해야 함)
      reservation_max_participant_cnt: data.maxPeople, // 최대 참여자 수
      // 백엔드에서 match_id로 자동 설정되므로 아래 필드들은 제거
      // reservation_title: data.meetingName, // 사용자가 입력한 모임 이름
      // reservation_description: data.description, // 사용자가 입력한 모임 설명
      // reservation_date: formatDate(reservationStartTime), // YYYY-MM-DD 형식
      // reservation_start_time: formatTime(reservationStartTime), // HH:MM:SS 형식
      // reservation_end_time: formatTime(reservationEndTime), // HH:MM:SS 형식
    };

    console.log('모임 생성 요청:', createRequest);
    console.log('경기 ID 확인:', {
      selectedEventId: eventSelection.selectedEventId,
      matchId: selectedEvent.id,
      matchIdType: typeof selectedEvent.id,
      competitionCode: selectedEvent.competition_code
    });

    try {
      const response = await createReservationMutation.mutateAsync(createRequest);
      console.log('모임 생성 성공:', response);
      
      // 🆕 서버 응답에서 방장 정보와 채팅방 ID 확인
      if (response.data.host_id && response.data.chat_room_id) {
        console.log('✅ 방장 권한 획득:', {
          reservation_id: response.data.reservation_id,
          host_id: response.data.host_id,
          chat_room_id: response.data.chat_room_id,
          created_at: response.data.created_at
        });
        
        // 사용자 상태에 방장 정보 저장 (선택사항)
        const authStore = useAuthStore.getState();
        if (authStore.user?.id === response.data.host_id) {
          console.log('🎯 현재 사용자가 방장으로 확인됨');
          // authStore.updateUser({ hosted_meetings: [..., response.data.reservation_id] });
        }
      } else {
        console.warn('⚠️ 서버 응답에서 방장 정보가 누락됨');
      }
      
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
    handleSelectEvent: (eventId: string | undefined | null) => {
      // eventId가 유효한지 확인
      if (!eventId) {
        console.warn('handleSelectEvent에 유효하지 않은 eventId가 전달되었습니다:', eventId);
        return;
      }
      eventSelection.handleSelectEvent(eventId, form.setValue, eventsToShow);
    },

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
