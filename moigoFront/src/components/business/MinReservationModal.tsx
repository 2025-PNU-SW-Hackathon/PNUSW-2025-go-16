import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ModalBox from '@/components/common/ModalBox';
import { COLORS } from '@/constants/colors';

interface MinReservationModalProps {
  visible: boolean;
  currentMinCapacity: number;
  onClose: () => void;
  onSave: (minCapacity: number) => void;
}

export default function MinReservationModal({ 
  visible, 
  currentMinCapacity, 
  onClose, 
  onSave 
}: MinReservationModalProps) {
  const [minCapacity, setMinCapacity] = useState(currentMinCapacity);

  const increaseCapacity = () => {
    if (minCapacity < 10) {
      setMinCapacity(prev => prev + 1);
    }
  };

  const decreaseCapacity = () => {
    if (minCapacity > 1) {
      setMinCapacity(prev => prev - 1);
    }
  };

  const handleSave = () => {
    onSave(minCapacity);
    onClose();
  };

  return (
    <ModalBox 
      visible={visible} 
      title="예약 최소 인원수 설정" 
      onClose={onClose}
    >
      {/* 숫자 입력 컨트롤 */}
      <View className="flex-row justify-center items-center mb-6">
        <TouchableOpacity 
          className="justify-center items-center w-12 h-12 rounded-full bg-mainGray"
          onPress={decreaseCapacity}
          activeOpacity={0.7}
        >
          <Feather name="minus" size={24} color={COLORS.mainDarkGray} />
        </TouchableOpacity>
        
        <View className="px-4 py-2 mx-8 bg-white rounded-lg border border-mainGray">
          <Text className="text-2xl font-bold text-center text-gray-800">{minCapacity}</Text>
        </View>
        
        <TouchableOpacity 
          className="justify-center items-center w-12 h-12 rounded-full bg-mainGray"
          onPress={increaseCapacity}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={24} color={COLORS.mainDarkGray} />1
        </TouchableOpacity>
      </View>

      {/* 안내 텍스트 */}
      <Text className="mb-8 text-center text-gray-600">
        예약 최소 인원수는 1명부터 10명까지 설정 가능합니다
      </Text>

      {/* 액션 버튼 */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 px-6 py-4 rounded-xl border border-gray-300"
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-gray-600">취소</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 px-6 py-4 bg-orange-500 rounded-xl"
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-white">저장</Text>
        </TouchableOpacity>
      </View>
    </ModalBox>
  );
}
