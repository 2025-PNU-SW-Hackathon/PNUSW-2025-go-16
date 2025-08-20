import { View, Text } from 'react-native';
import ModalBox from '@/components/common/ModalBox';
import TagChip from '@/components/common/TagChip';
import PrimaryButton from '@/components/common/PrimaryButton';
import Feather from 'react-native-vector-icons/Feather';
import type { Reservation } from '@/types/reservation';

import React from 'react';

interface MeetingModalProps {
  visible: boolean;
  selectedReservation: Reservation | null;
  onClose: () => void;
}

export default function MeetingModal({ visible, selectedReservation, onClose }: MeetingModalProps) {
  if (!selectedReservation) {
    return null;
  } 

  return (
    <ModalBox visible={visible} title="예약 상세 정보" onClose={onClose}>
      <View className="gap-8 mt-6">
        {/* 매칭 정보 리스트 */}
        <View className="gap-2 space-y-8">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-medium text-gray-900">{selectedReservation.title}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-gray-600">예약 날짜</Text>
            <Text className="text-lg font-medium text-gray-900">{selectedReservation.date}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-gray-600">예약 시간</Text>
            <Text className="text-lg font-medium text-gray-900">{selectedReservation.time}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-gray-600">예약 장소</Text>
                         <Text className="text-lg font-medium text-gray-900">
               {selectedReservation.store_id}
             </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-gray-600">모집 최대 인원</Text>
                         <Text className="text-lg font-medium text-gray-900">{selectedReservation.max_participant_cnt}인</Text>
          </View>
        </View>

        {/* 매칭 상태 */}
        <View className="p-3 bg-gray-100 rounded-lg">
          <Text className="mb-2 font-bold text-gray-600 text-md">매칭 상태</Text>
          <View className="flex-row items-center">
            <Feather name="check" size={16} color="#67C23A" />
            <TagChip label={selectedReservation.status} color="#F3F4F6" textColor="#6B7280" />
          </View>
        </View>

        {/* 액션 버튼 */}
        <PrimaryButton title="채팅하기" onPress={onClose} color="#F97316" />
      </View>
    </ModalBox>
  );
}

