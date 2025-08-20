import { useState } from 'react';
import type { CreateMeetingForm } from './useMeetingForm';
import type { ReservationDTO } from '@/types/DTO/reservations';

// 경기 선택 관련 훅
export function useEventSelection() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (
    eventId: string,
    setValue: (name: keyof CreateMeetingForm, value: any) => void,
    events: ReservationDTO[] = []
  ) => {
    console.log('handleSelectEvent 호출:', { eventId, eventsLength: events.length });
    setSelectedEventId(eventId);
    const event = events.find((e) => e.reservation_id.toString() === eventId);
    console.log('찾은 이벤트:', event);
    if (event) {
      const meetingName = `${event.reservation_match} 볼 사람 !`;
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
