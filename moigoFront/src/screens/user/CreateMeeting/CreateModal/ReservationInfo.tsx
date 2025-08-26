import React from 'react';
import { View, Text } from 'react-native';
import type { MatchDTO } from '@/types/DTO/reservations';

interface ReservationInfoProps {
  selectedEvent: MatchDTO;
  maxPeople: number;
}

// 예약 정보 컴포넌트
export default function ReservationInfo({ selectedEvent, maxPeople }: ReservationInfoProps) {
  // API 데이터에서 날짜와 시간 추출
  const matchTime = new Date(selectedEvent.match_date);
  const date = matchTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = matchTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="p-4 py-4 mb-8 rounded-xl bg-mainGray">
      <Text className="mb-4 text-lg text-mainGrayText">예약 정보</Text>
      <View className="flex-col gap-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-md text-mainGrayText">날짜</Text>
          <Text>{date}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-md text-mainGrayText">시간</Text>
          <Text>{time}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-md text-mainGrayText">최대인원</Text>
          <Text>{maxPeople}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-md text-mainGrayText">선택한 경기</Text>
          <Text>{`${selectedEvent.home_team} vs ${selectedEvent.away_team}`}</Text>
        </View>
      </View>
    </View>
  );
}
