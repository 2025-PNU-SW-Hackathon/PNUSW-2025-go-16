import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

export interface DropdownOption {
  id: string;
  label: string;
  isDanger?: boolean;
  onPress: () => void;
}

interface DropdownMenuProps {
  options: DropdownOption[];
  isVisible: boolean;
  onClose: () => void;
  position?: 'top-right' | 'bottom-right' | 'center';
  customClassName?: {
    container?: string;
    item?: string;
    text?: string;
    dangerText?: string;
  };
}

export default function DropdownMenu({ 
  options, 
  isVisible, 
  onClose, 
  position = 'top-right',
  customClassName = {}
}: DropdownMenuProps) {
  if (!isVisible) return null;

  const getPositionClass = () => {
    switch (position) {
      case 'top-right':
        return 'absolute top-16 right-4';
      case 'bottom-right':
        return 'absolute bottom-16 right-4';
      case 'center':
        return 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'absolute top-16 right-4';
    }
  };

  const handleOptionPress = (option: DropdownOption) => {
    option.onPress();
    onClose();
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute inset-0 z-40">
        <View className={`bg-white rounded-2xl shadow-lg border border-gray-200 z-50 min-w-[150px] ${getPositionClass()} ${customClassName.container || ''}`}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleOptionPress(option)}
              className={`px-4 py-3 border-b border-gray-100 last:border-b-0 ${customClassName.item || ''}`}
              activeOpacity={0.7}
            >
              <Text 
                className={`text-sm ${
                  option.isDanger 
                    ? `text-red-500 ${customClassName.dangerText || ''}` 
                    : `text-gray-700 ${customClassName.text || ''}`
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
} 