import { useState } from 'react';
import { events } from '@/mocks/events';
import type { CreateMeetingForm } from './useMeetingForm';

// 경기 선택 관련 훅
export function useEventSelection() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (
    eventId: string,
    setValue: (name: keyof CreateMeetingForm, value: any) => void,
  ) => {
    setSelectedEventId(eventId);
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setValue('meetingName', `${event.home} vs ${event.away} 볼 사람 !`);
    }
  };

  return {
    selectedEventId,
    setSelectedEventId,
    handleSelectEvent,
  };
}
