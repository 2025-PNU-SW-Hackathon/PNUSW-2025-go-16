import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import Toast from '@/components/common/Toast';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BusinessInfoEdit'>;

export default function BusinessInfoEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showToast, setShowToast] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '챔피언 스포츠 펍',
    representativeName: '김성훈',
    businessNumber: '123-45-67890',
    zipCode: '06123',
    address: '서울특별시 강남구 강남대로 123길 45',
    detailAddress: '2층 201호',
    businessCertificate: null as string | null,
  });

  const handleInputChange = (field: keyof typeof businessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSearch = () => {
    // 주소 검색 로직 (현재는 알림으로 대체)
    Alert.alert('주소 검색', '주소 검색 기능을 구현합니다.');
  };

  const handleFileUpload = () => {
    // 파일 업로드 로직 (현재는 알림으로 대체)
    Alert.alert('파일 업로드', '사업자등록증 업로드 기능을 구현합니다.');
  };

  const handleSave = () => {
    // 저장 로직
    console.log('저장된 사업자 정보:', businessInfo);
    
    // 토스트 표시
    setShowToast(true);
    
    // 2초 후 이전 화면으로 이동
    setTimeout(() => {
      setShowToast(false);
      navigation.goBack();
    }, 2000);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* 상호명 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            상호명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.businessName}
            onChangeText={(text) => handleInputChange('businessName', text)}
            placeholder="상호명을 입력하세요"
          />
        </View>

        {/* 대표자명 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            대표자명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.representativeName}
            onChangeText={(text) => handleInputChange('representativeName', text)}
            placeholder="대표자명을 입력하세요"
          />
        </View>

        {/* 사업자 등록번호 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            사업자 등록번호 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.businessNumber}
            onChangeText={(text) => handleInputChange('businessNumber', text)}
            placeholder="000-00-00000"
            keyboardType="numeric"
          />
        </View>

        {/* 사업장 주소 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            사업장 주소 <Text className="text-red-500">*</Text>
          </Text>
          
          {/* 우편번호 */}
          <View className="flex-row mb-3 space-x-3">
            <TextInput
              className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200"
              value={businessInfo.zipCode}
              onChangeText={(text) => handleInputChange('zipCode', text)}
              placeholder="우편번호"
              keyboardType="numeric"
            />
            <TouchableOpacity 
              className="justify-center items-center px-6 py-4 bg-orange-500 rounded-xl"
              onPress={handleAddressSearch}
              activeOpacity={0.7}
            >
              <Text className="font-medium text-white">주소 검색</Text>
            </TouchableOpacity>
          </View>
          
          {/* 기본 주소 */}
          <TextInput
            className="p-4 mb-3 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="기본 주소"
          />
          
          {/* 상세 주소 */}
          <TextInput
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.detailAddress}
            onChangeText={(text) => handleInputChange('detailAddress', text)}
            placeholder="상세 주소"
          />
        </View>

        {/* 사업자등록증 */}
        <View className="mb-8">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            사업자등록증 <Text className="text-red-500">*</Text>
          </Text>
          
          <TouchableOpacity 
            className="justify-center items-center p-8 rounded-xl border-2 border-gray-300 border-dashed"
            onPress={handleFileUpload}
            activeOpacity={0.7}
          >
            <Feather name="upload-cloud" size={48} color={COLORS.mainOrange} />
            <Text className="mt-3 text-lg font-medium" style={{ color: COLORS.mainOrange }}>
              사업자등록증을 업로드하세요
            </Text>
            <Text className="mt-2 text-sm text-gray-500">
              PNG, JPG, PDF up to 10MB
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 저장 버튼 */}
      <View className="px-4 pb-8 bg-white">
        <TouchableOpacity 
          className="py-4 w-full bg-orange-500 rounded-xl"
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text className="text-lg font-semibold text-center text-white">저장</Text>
        </TouchableOpacity>
      </View>

      {/* 토스트 */}
      {showToast && (
        <Toast 
          visible={showToast}
          message="저장되었습니다" 
          type="success"
          onHide={() => setShowToast(false)}
        />
      )}
    </View>
  );
}
