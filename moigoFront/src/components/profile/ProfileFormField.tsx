import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileFormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  isRequired?: boolean;
  isEditable?: boolean;
  onValueChange?: (value: string) => void;
  onPress?: () => void;
  showIcon?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  errorMessage?: string;
}

export default function ProfileFormField({
  label,
  value,
  placeholder,
  isRequired = false,
  isEditable = true,
  onValueChange,
  onPress,
  showIcon = false,
  iconName = 'chevron-forward',
  errorMessage,
}: ProfileFormFieldProps) {
  return (
    <View className="px-4 pb-4 mb-4 border-b border-mainGray">
      <Text className="mb-2 font-medium text-gray-700">
        {label} {isRequired && <Text className="text-red-500">*</Text>}
      </Text>

      {isEditable ? (
        <TextInput
          value={value}
          placeholder={placeholder}
          onChangeText={onValueChange}
          className={`rounded-lg px-4 py-3 text-gray-900 ${
            errorMessage ? 'bg-red-50 border border-red-300' : 'bg-gray-100'
          }`}
          editable={isEditable}
        />
      ) : (
        <TouchableOpacity
          className={`rounded-lg px-4 py-3 flex-row items-center justify-between ${
            errorMessage ? 'bg-red-50 border border-red-300' : 'bg-gray-100'
          }`}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text className="flex-1 text-gray-900">{value}</Text>
          {showIcon && <Ionicons name={iconName} size={20} color="#9CA3AF" />}
        </TouchableOpacity>
      )}

      {errorMessage && <Text className="px-4 mt-1 text-sm text-red-500">{errorMessage}</Text>}
    </View>
  );
}
