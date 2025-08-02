import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface BioTextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  isEditable?: boolean;
}

export default function BioTextArea({ 
  value='', 
  onChangeText, 
  maxLength = 200,
  isEditable = true 
}: BioTextAreaProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-medium text-gray-700">자기소개</Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="자기소개를 입력해주세요"
          multiline
          numberOfLines={4}
          maxLength={maxLength}
          editable={isEditable}
          className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900 min-h-[100]"
          textAlignVertical="top"
        />
        <Text className="absolute right-2 bottom-2 text-xs text-gray-500">
          {value.length}/{maxLength}자
        </Text>
      </View>
    </View>
  );
} 