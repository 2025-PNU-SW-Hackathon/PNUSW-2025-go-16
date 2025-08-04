import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/store';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, selectedUserType } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 justify-center items-center px-8 bg-white">
      {/* 로고 */}
      <View className="mb-12">
        <Image
          source={require('@/assets/moigoLogo.png')}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* 입력 필드들 */}
      <View className="mb-5 space-y-4 w-full">
        <View className="px-4 py-2 mb-3 bg-white rounded-lg border border-gray-200">
          <TextInput
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            className="text-base"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View className="px-4 py-2 mb-3 bg-white rounded-lg border border-gray-200">
          <TextInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            className="text-base"
            secureTextEntry
          />
        </View>
      </View>

      {/* 로그인 버튼 */}
      <View className="mb-5 w-full">
        <PrimaryButton
          title="로그인"
          color={COLORS.mainOrange}
          onPress={() => {
            // 간단한 유효성 검사
            if (!email.trim()) {
              Alert.alert('알림', '이메일을 입력해주세요.');
              return;
            }
            if (!password.trim()) {
              Alert.alert('알림', '비밀번호를 입력해주세요.');
              return;
            }

            // 로그인 성공 시 사용자 정보로 로그인
            const mockToken = 'mock-jwt-token-' + Date.now(); // 실제로는 서버에서 받은 토큰
            login({
              id: Date.now().toString(), // 고유 ID 생성
              email: email.trim(),
              userType: selectedUserType || 'sports_fan', // Onboarding에서 선택한 사용자 타입 사용
            }, mockToken);
          }}
        />
      </View>

      {/* 링크들 */}
      <View className="flex-row justify-between mb-8 w-full">
        <TouchableOpacity>
          <Text className="text-mainGrayText">비밀번호 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-mainGrayText">회원가입</Text>
        </TouchableOpacity>
      </View>

      {/* 구분선 */}
      <View className="flex-row items-center mb-3 w-full">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-4 text-mainGrayText">간편 로그인</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* 소셜 로그인 버튼들 */}
      <View className="space-y-3 w-full">
        <View className="my-2">
          <TouchableOpacity
            onPress={() => {
              Alert.alert('알림', '카카오 로그인 기능은 준비 중입니다.');
            }}
            activeOpacity={0.8}
            className="overflow-hidden items-center w-full"
          >
            <Image
              source={require('@/assets/kakaoLoginButton.png')}
              className="w-full"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View className="my-2">
          <TouchableOpacity
            onPress={() => {
              Alert.alert('알림', '네이버 로그인 기능은 준비 중입니다.');
            }}
            activeOpacity={0.8}
            className="overflow-hidden items-center w-full"
          >
            <Image
              source={require('@/assets/naverLoginButton.png')}
              className="w-full"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
