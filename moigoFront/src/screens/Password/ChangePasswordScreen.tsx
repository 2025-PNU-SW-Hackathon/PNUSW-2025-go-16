import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import PasswordInput from '@/components/password/PasswordInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS } from '@/constants/colors';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { changePassword, validatePassword, isLoading } = useAuthStore();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 비밀번호 유효성 검사
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (!newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.errors[0];
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼이 유효한지 확인
  const isFormValid = () => {
    // 실시간으로 유효성 검사
    const newErrors: { [key: string]: string } = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (!newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.errors[0];
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    return currentPassword.length > 0 && 
           newPassword.length > 0 && 
           confirmPassword.length > 0 && 
           Object.keys(newErrors).length === 0;
  };

  // 비밀번호 변경 제출
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const success = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      if (success) {
        // 성공 시 이전 화면으로 이동
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      // 현재 비밀번호 에러 처리
      if (error.message.includes('현재 비밀번호')) {
        setErrors(prev => ({ ...prev, currentPassword: error.message }));
      }
    }
  };

  // 입력값 변경 시 실시간 유효성 검사
  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (currentPassword && !currentPassword.trim()) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (newPassword) {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.errors[0];
      }
    }
    
    if (confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Feather name="arrow-left" size={24} color={COLORS.mainDark} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-bold text-mainDark">
          비밀번호 변경
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* 현재 비밀번호 */}
        <PasswordInput
          label="현재 비밀번호"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="현재 비밀번호를 입력해주세요"
          error={errors.currentPassword}
        />

        {/* 새 비밀번호 */}
        <PasswordInput
          label="새 비밀번호"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="새 비밀번호를 입력해주세요"
          error={errors.newPassword}
        />

        {/* 비밀번호 규칙 */}
        <View className="mb-4">
          <View className="flex-row items-center mb-1">
            <View className="mr-2 w-2 h-2 bg-gray-300 rounded-full" />
            <Text className="text-sm text-mainGrayText">8자 이상</Text>
          </View>
          <View className="flex-row items-center">
            <View className="mr-2 w-2 h-2 bg-gray-300 rounded-full" />
            <Text className="text-sm text-mainGrayText">영문/숫자/특수문자 조합</Text>
          </View>
        </View>

        {/* 새 비밀번호 확인 */}
        <PasswordInput
          label="새 비밀번호 확인"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="새 비밀번호를 다시 입력해주세요"
          error={errors.confirmPassword}
        />

        {/* 변경 완료 버튼 */}
        <View className="mt-8 mb-4">
          <PrimaryButton
            title="변경 완료"
            onPress={handleSubmit}
            disabled={!isFormValid() || isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 