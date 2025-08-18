import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

interface FilterButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function FilterButton({ title, isSelected, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${
        isSelected 
          ? 'bg-mainOrange' 
          : 'bg-gray-100'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isSelected 
            ? 'text-white' 
            : 'text-mainDarkGray'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
} 