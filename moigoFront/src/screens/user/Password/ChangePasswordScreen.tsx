import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import PasswordInput from '@/components/password/PasswordInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import Toast from '@/components/common/Toast';
import { COLORS } from '@/constants/colors';
import { useChangePassword } from '@/hooks/useChangePassword';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const {
    form,
    errors,
    showToast,
    toastMessage,
    toastType,
    isLoading,
    handleInputChange,
    handleSubmit,
    isFormValid,
    setShowToast,
  } = useChangePassword();

  // 성공 시 이전 화면으로 이동
  const handleSuccess = () => {
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  // 제출 핸들러
  const onSubmit = async () => {
    const result = await handleSubmit();
    if (result?.success) {
      handleSuccess();
    }
  };

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
          value={form.currentPassword}
          onChangeText={(value) => handleInputChange('currentPassword', value)}
          placeholder="현재 비밀번호를 입력해주세요"
          error={errors.currentPassword}
        />

        {/* 새 비밀번호 */}
        <PasswordInput
          label="새 비밀번호"
          value={form.newPassword}
          onChangeText={(value) => handleInputChange('newPassword', value)}
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
          value={form.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          placeholder="새 비밀번호를 다시 입력해주세요"
          error={errors.confirmPassword}
        />

        {/* 변경 완료 버튼 */}
        <View className="mt-8 mb-4">
          <PrimaryButton
            title="변경 완료"
            onPress={onSubmit}
            disabled={!isFormValid() || isLoading}
          />
        </View>
      </ScrollView>

      {/* 토스트 메시지 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </SafeAreaView>
  );
} 