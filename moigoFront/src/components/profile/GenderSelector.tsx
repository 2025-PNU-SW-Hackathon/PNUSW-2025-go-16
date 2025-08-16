import React from 'react';
import { View, Text } from 'react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS } from '@/constants/colors';

interface GenderSelectorProps {
  selectedGender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
  isEditable?: boolean;
  errorMessage?: string;
}

export default function GenderSelector({
  selectedGender,
  onGenderChange,
  isEditable = true,
  errorMessage,
}: GenderSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-medium text-gray-700">성별</Text>
      <View className="flex-row gap-4">
        <PrimaryButton
          title="여성"
          onPress={() => isEditable && onGenderChange('female')}
          disabled={!isEditable}
          color={selectedGender === 'female' ? COLORS.mainOrange : '#F3F4F6'}
          className="flex-1"
        />

        <PrimaryButton
          title="남성"
          onPress={() => isEditable && onGenderChange('male')}
          disabled={!isEditable}
          color={selectedGender === 'male' ? '#FF6B35' : '#F3F4F6'}
          className="flex-1"
        />
      </View>

      {errorMessage && <Text className="mt-1 text-sm text-red-500">{errorMessage}</Text>}
    </View>
  );
}
