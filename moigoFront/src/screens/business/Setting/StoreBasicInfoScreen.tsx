import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettingScreen } from '../../../hooks/useSettingScreen';
import { COLORS } from '../../../constants/colors';
import Toast from '../../../components/common/Toast';

const StoreBasicInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    storeInfo,
    basicInfoForm,
    isLoading,
    isUpdating,
    hasError,
    updateFormField,
    handleSaveBasicInfo,
    initializeForm,
    refetchStoreInfo,
    isSaveSuccess,
    isSaveError,
  } = useSettingScreen();

  // Toast 메시지 상태
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  // 컴포넌트 마운트 시 폼 초기화
  useEffect(() => {
    if (storeInfo) {
      initializeForm();
    }
  }, [storeInfo]);

  // 성공/실패 메시지 표시
  const showSuccessMessage = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorMessage = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  // 저장 성공 시 처리
  useEffect(() => {
    if (isSaveSuccess) {
      showSuccessMessage('가게 정보가 성공적으로 저장되었습니다!');
      // 1초 후 설정 화면으로 이동
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    }
  }, [isSaveSuccess, navigation]);

  // 저장 실패 시 처리
  useEffect(() => {
    if (isSaveError) {
      showErrorMessage('가게 정보 저장에 실패했습니다.');
    }
  }, [isSaveError]);

  // 저장 버튼 클릭 시
  const handleSave = () => {
    // 필수 필드 검증
    if (!basicInfoForm.store_name || !basicInfoForm.address_main || 
        !basicInfoForm.phone_number || !basicInfoForm.business_reg_no || 
        !basicInfoForm.owner_name || !basicInfoForm.email) {
      Alert.alert('알림', '필수 항목을 모두 입력해주세요.');
      return;
    }

    // 저장 실행
    handleSaveBasicInfo();
  };

  // 취소 버튼 클릭 시
  const handleCancel = () => {
    // 원래 데이터로 폼 초기화
    initializeForm();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">가게 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">가게 정보를 불러오는데 실패했습니다</Text>
        <TouchableOpacity
          className="px-6 py-3 mt-4 bg-orange-500 rounded-lg"
          onPress={() => refetchStoreInfo()}
        >
          <Text className="font-semibold text-white">다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-6">
        {/* 매장명 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-gray-800">
            매장명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="px-4 w-full h-12 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.store_name}
            onChangeText={(text) => updateFormField('store_name', text)}
            placeholder="매장명을 입력하세요"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 주소 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-gray-800">
            주소 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="px-4 mb-2 w-full h-12 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.address_main}
            onChangeText={(text) => updateFormField('address_main', text)}
            placeholder="주소를 입력하세요"
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            className="px-4 w-full h-12 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.address_detail}
            onChangeText={(text) => updateFormField('address_detail', text)}
            placeholder="상세주소 (선택)"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 전화번호 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-gray-800">
            전화번호 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="px-4 w-full h-12 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.phone_number}
            onChangeText={(text) => updateFormField('phone_number', text)}
            placeholder="전화번호를 입력하세요"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        {/* 사업자등록번호 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-gray-800">
            사업자등록번호 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="px-4 w-full h-12 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.business_reg_no}
            onChangeText={(text) => updateFormField('business_reg_no', text)}
            placeholder="사업자등록번호를 입력하세요"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 대표자명 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-gray-800">
            대표자명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="px-4 w-full h-12 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.owner_name}
            onChangeText={(text) => updateFormField('owner_name', text)}
            placeholder="대표자명을 입력하세요"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 이메일 */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-gray-800">
            이메일 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="px-4 w-full h-12 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.email}
            onChangeText={(text) => updateFormField('email', text)}
            placeholder="이메일을 입력하세요"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* 매장 소개 */}
        <View className="mb-8">
          <Text className="mb-2 text-lg font-semibold text-gray-800">
            매장 소개
          </Text>
          <TextInput
            className="px-4 py-3 w-full h-24 text-gray-800 rounded-lg border border-gray-300"
            value={basicInfoForm.bio}
            onChangeText={(text) => updateFormField('bio', text)}
            placeholder="매장 소개를 입력하세요"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>        
      </ScrollView>
      {/* 버튼 */}
      <View className="flex-row gap-2 justify-between items-center px-4 pt-2 mb-12 border-2 border-mainGray">
          <TouchableOpacity
            className="flex-1 justify-center items-center h-12 bg-white rounded-lg border border-gray-300"
            onPress={handleCancel}
            disabled={isUpdating}
          >
            <Text className="font-semibold text-gray-800">취소</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 justify-center items-center h-12 bg-orange-500 rounded-lg"
            onPress={handleSave}
            disabled={isUpdating}
          >
            <Text className="font-semibold text-white">
              {isUpdating ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
        </View>
                 <Toast
           message={toastMessage}
           type={toastType}
           visible={showToast}
           onHide={hideToast}
         />
    </View>
  );
};

export default StoreBasicInfoScreen;
