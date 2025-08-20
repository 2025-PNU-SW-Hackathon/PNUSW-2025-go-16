import React from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/store/authStore';

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUserType } = useAuthStore();

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* 로고 */}
      <View className="mb-12">
        <Image 
          source={require('@/assets/moigoLogo.png')}
          className="w-32 h-32"
          resizeMode="contain"
        />
      </View>

      {/* 메인 텍스트 */}
      <View className="mb-5 items-center">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-5">
          같이 보는 스포츠, Spotple에서
        </Text>
        <Text className="text-base text-center text-gray-600 leading-6">
          스포츠를 좋아하는 사람들과 함께{'\n'}경기를 즐기고 최고의 장소를 찾아보세요
        </Text>
      </View>

      {/* 버튼들 */}
      <View className="w-full space-y-3">
        <View className="my-2">
          <PrimaryButton 
            title="스포츠 팬으로 시작하기" 
            color={COLORS.mainOrange}
            icon="👤"
            onPress={() => {
              setUserType('sports_fan');
              navigation.navigate('Login');
            }} 
          />
        </View>
        <View className="my-2">
          <PrimaryButton 
            title="사업자로 시작하기" 
            color={COLORS.bizButton}
            icon="🏢"
            onPress={() => {
              setUserType('business');
              navigation.navigate('Login');
            }} 
          />
        </View>
      </View>
    </View>
  );
} 