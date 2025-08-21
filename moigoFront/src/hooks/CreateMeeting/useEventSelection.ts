import { useState } from 'react';
import type { CreateMeetingForm } from './useMeetingForm';
import type { MatchDTO } from '@/types/DTO/reservations';

// 경기 선택 관련 훅
export function useEventSelection() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (
    eventId: string | undefined | null,
    setValue: (name: keyof CreateMeetingForm, value: any) => void,
    events: MatchDTO[] = []
  ) => {
    // eventId가 유효하지 않은 경우 처리
    if (!eventId) {
      console.warn('eventId가 유효하지 않습니다:', eventId);
      return;
    }

    console.log('handleSelectEvent 호출:', { eventId, eventsLength: events.length });
    setSelectedEventId(eventId);
    
    // 안전한 타입 체크 추가
    const event = events.find((e) => {
      // id가 존재하고 유효한 값인지 확인
      if (e.id === undefined || e.id === null) {
        console.warn('경기 데이터에 id가 없습니다:', e);
        return false;
      }
      return e.id.toString() === eventId;
    });
    
    console.log('찾은 경기:', event);
    if (event) {
      const meetingName = `${event.home_team} vs ${event.away_team} 경기 모임`;
      console.log('설정할 모임 이름:', meetingName);
      setValue('meetingName', meetingName);
    } else {
      console.warn('선택된 경기를 찾을 수 없습니다. eventId:', eventId);
    }
  };

  return {
    selectedEventId,
    setSelectedEventId,
    handleSelectEvent,
  };
}
