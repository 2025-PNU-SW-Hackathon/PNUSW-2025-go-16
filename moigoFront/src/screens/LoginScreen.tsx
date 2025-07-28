import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/store';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* 로고 */}
      <View className="mb-12">
        <Text className="text-6xl font-bold text-mainOrange">S</Text>
      </View>

      {/* 입력 필드들 */}
      <View className="w-full mb-8 space-y-4">
        <View className="bg-white rounded-lg border border-gray-200 p-4">
          <TextInput
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            className="text-base"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View className="bg-white rounded-lg border border-gray-200 p-4">
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
      <View className="w-full mb-8">
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
            login({
              id: '1',
              email: email.trim(),
              name: email.split('@')[0], // 이메일 앞부분을 이름으로 사용
              userType: 'sports_fan'
            });
          }} 
        />
      </View>

      {/* 링크들 */}
      <View className="flex-row justify-between w-full mb-8">
        <TouchableOpacity>
          <Text className="text-mainGrayText">비밀번호 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-mainGrayText">회원가입</Text>
        </TouchableOpacity>
      </View>

      {/* 구분선 */}
      <View className="flex-row items-center w-full mb-8">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-4 text-mainGrayText">간편 로그인</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* 소셜 로그인 버튼들 */}
      <View className="w-full space-y-3">
        <PrimaryButton 
          title="카카오로 시작하기" 
          color={COLORS.kakaoYellow}
          icon="💬"
          onPress={() => {
            Alert.alert('알림', '카카오 로그인 기능은 준비 중입니다.');
          }} 
        />
        <PrimaryButton 
          title="네이버로 시작하기" 
          color={COLORS.naverGreen}
          icon="N"
          onPress={() => {
            Alert.alert('알림', '네이버 로그인 기능은 준비 중입니다.');
          }} 
        />
      </View>
    </View>
  );
}