import { useState } from 'react';
import type { CreateMeetingForm } from './useMeetingForm';
import type { MatchDTO } from '@/types/DTO/reservations';

// 경기 선택 관련 훅
export function useEventSelection() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (
    eventId: string,
    setValue: (name: keyof CreateMeetingForm, value: any) => void,
    events: MatchDTO[] = []
  ) => {
    console.log('handleSelectEvent 호출:', { eventId, eventsLength: events.length });
    setSelectedEventId(eventId);
    
    // MatchDTO에서 id 필드 사용
    const event = events.find((e) => {
      if (e.id === undefined || e.id === null) {
        console.warn('경기 데이터에 id가 없습니다:', e);
        return false;
      }
      return e.id.toString() === eventId;
    });
    
    console.log('찾은 이벤트:', event);
    if (event) {
      const meetingName = `${event.home_team} vs ${event.away_team} 볼 사람 !`;
      console.log('설정할 모임 이름:', meetingName);
      setValue('meetingName', meetingName);
    }
  };

  return {
    selectedEventId,
    setSelectedEventId,
    handleSelectEvent,
  };
}
