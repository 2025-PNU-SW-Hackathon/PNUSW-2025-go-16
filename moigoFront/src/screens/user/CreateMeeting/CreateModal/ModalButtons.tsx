import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';

interface ModalButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

// 모달 버튼 컴포넌트
export default function ModalButtons({ onCancel, onConfirm, isLoading = false }: ModalButtonsProps) {
  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={onCancel}
        disabled={isLoading}
        className="flex-1 p-4 rounded-lg border border-gray-300"
      >
        <Text className="font-medium text-center text-gray-600">취소</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onConfirm}
        disabled={isLoading}
        className={`flex-1 p-4 rounded-lg ${
          isLoading ? 'bg-gray-300' : 'bg-mainOrange'
        }`}
      >
        <Text className="font-medium text-center text-white">
          {isLoading ? '생성 중...' : '확인'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
