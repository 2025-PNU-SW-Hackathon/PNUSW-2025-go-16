import React from 'react';
import { View } from 'react-native';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';

interface ModalButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
}

// 버튼 영역 컴포넌트
export default function ModalButtons({ onCancel, onConfirm }: ModalButtonsProps) {
  return (
    <View className="flex-row gap-3 mb-6">
      <PrimaryButton
        title="취소"
        className="flex-1 px-4 py-3 rounded-lg bg-mainGray"
        onPress={onCancel}
        color={COLORS.mainGray}
      />
      <PrimaryButton
        title="등록하기"
        className="flex-1 px-4 py-3 rounded-lg bg-mainGray"
        onPress={onConfirm}
        color={COLORS.mainOrange}
      />
    </View>
  );
}
