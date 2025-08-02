import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

// 안내문구 컴포넌트
export default function InfoSection() {
  return (
    <View className="p-4 m-4 border border-blue-200 bg-blue-50 rounded-xl">
      <View className="flex-row items-center gap-2">
        <Feather name="info" size={15} color="#2563EB" />
        <Text className="text-lg text-blue-600">모임 생성 안내</Text>
      </View>

      <Text className="pl-6 mt-2 text-sm text-blue-600">
        • 모든 필수 항목(*)을 입력해주세요{'\n'}• 생성된 모임은 다른 사용자들이 참여할 수 있습니다
      </Text>
    </View>
  );
}
