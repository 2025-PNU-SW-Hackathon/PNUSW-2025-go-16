import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);

  // 이메일 도메인 목록
  const emailDomains = [
    'gmail.com',
    'naver.com',
    'daum.net',
    'kakao.com',
    'outlook.com',
    'yahoo.com',
    'icloud.com'
  ];

  return (
    <TouchableWithoutFeedback onPress={() => setShowDomainDropdown(false)}>
      <KeyboardAvoidingView 
        className="flex-1 bg-white" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-5 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.mainDark} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-mainDark">회원가입</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
        {/* ID 섹션 */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-mainDark mb-2">아이디</Text>
          <View className="flex-row items-center space-x-2 my-2">
            <View className="flex-1 bg-white rounded-lg border border-gray-200 px-4 py-1 mr-4">
              <TextInput
                placeholder="아이디"
                value={userId}
                onChangeText={setUserId}
                className="text-base"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity className="bg-mainOrange rounded-lg px-4 py-4">
              <Text className="text-white font-semibold text-sm">중복확인</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-mainGrayText mt-2">
            4~12자 / 영문 소문자(숫자 조합 가능)
          </Text>
        </View>

        {/* 비밀번호 섹션 */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-mainDark mb-2">비밀번호</Text>
          <View className="space-y-3">
            <View className="bg-white rounded-lg border border-gray-200 px-4 py-1 my-2">
              <TextInput
                placeholder="비밀번호"
                value={password}
                onChangeText={setPassword}
                className="text-base"
                secureTextEntry
              />
            </View>
            <View className="bg-white rounded-lg border border-gray-200 px-4 py-1 my-2">
              <TextInput
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="text-base"
                secureTextEntry
              />
            </View>
          </View>
          <Text className="text-sm text-mainGrayText mt-2">
            6~20자 / 영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합
          </Text>
        </View>

        {/* 이메일 섹션 */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-mainDark mb-2">이메일</Text>
          <View className="flex-row items-center space-x-2 my-2">
            <View className="flex-1 bg-white rounded-lg border border-gray-200 px-4 py-1">
              <TextInput
                placeholder="이메일"
                value={email}
                onChangeText={setEmail}
                className="text-base"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <Text className="text-lg font-bold text-mainGrayText mx-2">@</Text>
            <View className="flex-1 relative">
              <TouchableOpacity
                className={`bg-white rounded-lg border border-gray-200 p-4 flex-row items-center justify-between`}
                onPress={() => setShowDomainDropdown(!showDomainDropdown)}
              >
                <Text className={`text-base text-mainGrayText`}>
                  {emailDomain || '선택'}
                </Text>
                <Ionicons 
                  name={showDomainDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.mainGrayText} 
                />
              </TouchableOpacity>
              
              {/* 드롭다운 목록 */}
              {showDomainDropdown && (
                <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg max-h-48">
                  <ScrollView 
                    className="max-h-48"
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {emailDomains.map((domain, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`p-4 border-b border-gray-100 ${index === emailDomains.length - 1 ? 'border-b-0' : ''} ${emailDomain === domain ? 'bg-gray-100' : ''}`}
                        onPress={() => {
                          setEmailDomain(domain);
                          setShowDomainDropdown(false);
                        }}
                      >
                        <Text className={`text-base ${emailDomain === domain ? 'text-mainOrange font-semibold' : 'text-mainDark'}`}>
                          {domain}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 휴대폰 번호 섹션 */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-mainDark mb-2">휴대폰 번호</Text>
          <View className="flex-row items-center space-x-2 my-2">
            <View className="flex-1 bg-white rounded-lg border border-gray-200 px-4 py-1 mr-4">
              <TextInput
                placeholder="휴대폰 번호"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                className="text-base"
                keyboardType="phone-pad"
              />
            </View>
            <TouchableOpacity className="bg-mainOrange rounded-lg px-4 py-4">
              <Text className="text-white font-semibold text-sm">인증번호 받기</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
        {/* 가입하기 버튼 */}
        <View className="w-full absolute bottom-0 px-4 py-7">
          <PrimaryButton 
            title="가입하기" 
            color={COLORS.mainOrange}
            onPress={() => {
              // TODO: 회원가입 로직 구현
            }} 
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}