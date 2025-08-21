import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface CreateMeetingHeaderProps {
  onBack: () => void;
}

// 헤더 컴포넌트
export default function CreateMeetingHeader({ onBack }: CreateMeetingHeaderProps) {
  return (
    <View className="flex-row items-center p-4 border-b border-gray-200">
      <TouchableOpacity onPress={onBack} className="mr-4">
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-gray-800">모임 만들기</Text>
    </View>
  );
}
