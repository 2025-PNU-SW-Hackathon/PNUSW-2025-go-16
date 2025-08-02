import React from 'react';
import { View, Text } from 'react-native';

interface ReservationInfoProps {
  selectedEvent: any;
  maxPeople: number;
}

// 예약 정보 컴포넌트
export default function ReservationInfo({ selectedEvent, maxPeople }: ReservationInfoProps) {
  return (
    <View className="p-4 py-6 mb-8 rounded-xl bg-mainGray">
      <Text className="mb-4 text-lg text-mainGrayText">예약 정보</Text>
      <View className="flex-col gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-md text-mainGrayText">날짜</Text>
          <Text>{selectedEvent?.date}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-md text-mainGrayText">시간</Text>
          <Text>{selectedEvent?.time}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-md text-mainGrayText">최대인원</Text>
          <Text>{maxPeople}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-md text-mainGrayText">선택한 경기</Text>
          <Text>
            {selectedEvent?.home} vs {selectedEvent?.away}
          </Text>
        </View>
      </View>
    </View>
  );
}
