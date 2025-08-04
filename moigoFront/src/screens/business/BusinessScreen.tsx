import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/types/RootStackParamList';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store';

export default function BusinessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuthStore();

  return (
    <View className="flex-1 p-6 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="mb-4 text-2xl font-bold text-gray-900">
          사업자 전용 화면
        </Text>
        <Text className="mb-8 text-base text-center text-gray-600">
          사업자님을 위한 특별한 기능들이 준비되어 있습니다.
        </Text>
        
        <TouchableOpacity
          onPress={() => logout()}
          className="px-6 py-3 rounded-lg bg-mainOrange"
        >
          <Text className="font-semibold text-white">로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 