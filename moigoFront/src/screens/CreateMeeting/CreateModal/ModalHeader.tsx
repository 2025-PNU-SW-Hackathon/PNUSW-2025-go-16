import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';

interface ModalHeaderProps {
  onClose: () => void;
}

// 헤더 컴포넌트
export default function ModalHeader({ onClose }: ModalHeaderProps) {
  return (
    <View className="flex-col items-center gap-4 p-6">
      <View className="items-center justify-center w-20 h-20 rounded-full bg-confirmBg">
        <Feather name="check" size={25} color={COLORS.confirmText} />
      </View>
      <Text className="text-2xl font-bold">모임이 등록되었습니다 !</Text>
      <Text className="text-mainGrayText">등록 확인 메시지를 발송해드렸습니다.</Text>
    </View>
  );
}
