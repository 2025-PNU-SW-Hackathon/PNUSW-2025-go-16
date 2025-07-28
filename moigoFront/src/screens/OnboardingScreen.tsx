import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* 로고 */}
      <View className="mb-12">
        <Text className="text-6xl font-bold text-mainOrange">S</Text>
      </View>

      {/* 메인 텍스트 */}
      <View className="mb-16 items-center">
        <Text className="text-2xl font-bold text-mainDark text-center mb-3">
          같이 보는 스포츠, Spotple에서
        </Text>
        <Text className="text-base text-mainGrayText text-center leading-6">
          스포츠를 좋아하는 사람들과 함께{'\n'}경기를 즐기고 최고의 장소를 찾아보세요
        </Text>
      </View>

      {/* 버튼들 */}
      <View className="w-full space-y-3">
        <PrimaryButton 
          title="스포츠 팬으로 시작하기" 
          color={COLORS.mainOrange}
          icon="👤"
          onPress={() => navigation.navigate('Login')} 
        />
        <PrimaryButton 
          title="사업자로 시작하기" 
          color={COLORS.bizButton}
          icon="🏢"
          onPress={() => navigation.navigate('Login')} 
        />
      </View>
    </View>
  );
} 