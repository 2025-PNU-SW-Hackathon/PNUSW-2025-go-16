import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import Toast from '@/components/common/Toast';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreBasicInfo'>;

export default function StoreBasicInfoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showToast, setShowToast] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: '챔피언 스포츠 펍',
    zipCode: '',
    address: '강남역 2번 출구 도보 3분',
    detailedAddress: '',
    phoneNumber: '02-1234-5678',
    businessNumber: '123-45-67890',
    representativeName: '김철수',
    email: 'sportsclub@example.com',
    introduction: '강남역 근처에 위치한 스포츠 전문 바입니다. 다양한 스포츠 중계를 시청하며 맛있는 음식과 음료를 즐기실 수 있습니다.',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // 필수 필드 검증
    if (!formData.storeName || !formData.address || !formData.phoneNumber || 
        !formData.businessNumber || !formData.representativeName || !formData.email) {
      Alert.alert('알림', '필수 항목을 모두 입력해주세요.');
      return;
    }

    // 저장 로직
    console.log('저장된 데이터:', formData);
    
    // 토스트 표시
    setShowToast(true);
    
    // 2초 후 이전 화면으로 이동
    setTimeout(() => {
      setShowToast(false);
      navigation.goBack();
    }, 2000);
  };

  const handleCancel = () => {
    Alert.alert('취소', '변경사항이 저장되지 않습니다. 정말 취소하시겠습니까?', [
      { text: '계속 편집', style: 'cancel' },
      { text: '취소', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* 매장명 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            매장명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
            value={formData.storeName}
            onChangeText={(value) => handleInputChange('storeName', value)}
            placeholder="매장명을 입력하세요"
          />
        </View>

        {/* 주소 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            주소 <Text className="text-red-500">*</Text>
          </Text>
          
          {/* 우편번호 */}
          <View className="mb-3">
            <TextInput
              className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
              value={formData.zipCode}
              onChangeText={(value) => handleInputChange('zipCode', value)}
              placeholder="우편번호를 입력하세요"
              keyboardType="numeric"
            />
          </View>
          
          {/* 기본 주소 */}
          <View className="mb-3">
            <TextInput
              className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="기본 주소를 입력하세요"
            />
          </View>
          
          {/* 상세 주소 */}
          <View className="mb-3">
            <TextInput
              className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
              value={formData.detailedAddress}
              onChangeText={(value) => handleInputChange('detailedAddress', value)}
              placeholder="상세주소 (선택)"
            />
          </View>
        </View>

        {/* 전화번호 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            전화번호 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            placeholder="전화번호를 입력하세요"
            keyboardType="phone-pad"
          />
        </View>

        {/* 사업자등록번호 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            사업자등록번호 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
            value={formData.businessNumber}
            onChangeText={(value) => handleInputChange('businessNumber', value)}
            placeholder="사업자등록번호를 입력하세요"
            keyboardType="numeric"
          />
        </View>

        {/* 대표자명 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            대표자명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
            value={formData.representativeName}
            onChangeText={(value) => handleInputChange('representativeName', value)}
            placeholder="대표자명을 입력하세요"
          />
        </View>

        {/* 이메일 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            이메일 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="이메일을 입력하세요"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* 매장 소개 */}
        <View className="mb-8">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            매장 소개 (선택)
          </Text>
          <TextInput
            className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
            value={formData.introduction}
            onChangeText={(value) => handleInputChange('introduction', value)}
            placeholder="매장 소개를 입력하세요"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ height: 100 }}
          />
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="px-4 pb-12 bg-white border-t-2 border-mainGray">
        <View className="flex-row gap-3 pt-4">
          <TouchableOpacity 
            className="flex-1 px-6 py-4 rounded-xl border border-gray-300"
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text className="font-medium text-center text-gray-600">취소</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 px-6 py-4 bg-orange-500 rounded-xl"
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text className="font-medium text-center text-white">저장</Text>
          </TouchableOpacity>
        </View>
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
