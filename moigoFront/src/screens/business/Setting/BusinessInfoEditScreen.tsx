import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import Toast from '@/components/common/Toast';
import { useBusinessRegistration } from '@/hooks/queries/useAuthQueries';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BusinessInfoEdit'>;
type RoutePropType = RouteProp<RootStackParamList, 'BusinessInfoEdit'>;

export default function BusinessInfoEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { storeId, isSignup = false } = route.params || {};
  
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState({
    store_name: '',
    owner_name: '',
    business_number: '',
    postal_code: '',
    store_address: '',
    address_detail: '',
    business_certificate_url: '',
  });

  const businessRegistrationMutation = useBusinessRegistration();

  useEffect(() => {
    // 회원가입이 아닌 경우 기존 정보를 불러옴
    if (!isSignup) {
      // TODO: 기존 사업자 정보를 불러오는 로직
      setBusinessInfo({
        store_name: '챔피언 스포츠 펍',
        owner_name: '김성훈',
        business_number: '123-45-67890',
        postal_code: '06123',
        store_address: '서울특별시 강남구 강남대로 123길 45',
        address_detail: '2층 201호',
        business_certificate_url: '',
      });
    }
  }, [isSignup]);

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

  const validateForm = () => {
    if (!businessInfo.store_name || !businessInfo.owner_name || !businessInfo.business_number || 
        !businessInfo.postal_code || !businessInfo.store_address || !businessInfo.address_detail) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return false;
    }

    // 사업자등록번호 형식 검증 (000-00-00000)
    const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberRegex.test(businessInfo.business_number)) {
      Alert.alert('입력 오류', '올바른 사업자등록번호 형식을 입력해주세요. (예: 123-45-67890)');
      return false;
    }

    // 우편번호 형식 검증 (5자리 숫자)
    const postalCodeRegex = /^\d{5}$/;
    if (!postalCodeRegex.test(businessInfo.postal_code)) {
      Alert.alert('입력 오류', '올바른 우편번호 형식을 입력해주세요. (5자리 숫자)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignup && storeId) {
        // 회원가입 시: 사업자 정보 등록 API 호출
        const response = await businessRegistrationMutation.mutateAsync({
          storeId,
          data: businessInfo
        });

        if (response.success) {
          setShowToast(true);
          
          // 2초 후 로그인 화면으로 이동
          setTimeout(() => {
            setShowToast(false);
            navigation.navigate('Login');
          }, 2000);
        }
      } else {
        // 일반 수정 시: 기존 로직
        console.log('저장된 사업자 정보:', businessInfo);
        
        setShowToast(true);
        
        // 2초 후 이전 화면으로 이동
        setTimeout(() => {
          setShowToast(false);
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      console.error('저장 실패:', error);
      Alert.alert('저장 실패', '저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isSignup) {
      // 회원가입 시: 회원가입 화면으로 돌아가기
      navigation.navigate('Signup');
    } else {
      // 일반 수정 시: 이전 화면으로 돌아가기
      navigation.goBack();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isSignup ? '사업자 정보 등록' : '사업자 정보 수정'}
          </Text>
          <Text className="text-sm text-center text-gray-600">
            {isSignup 
              ? '회원가입을 완료하기 위해 사업자 정보를 입력해주세요' 
              : '사업자 정보를 수정할 수 있습니다'
            }
          </Text>
        </View>

        {/* 상호명 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            상호명 <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.store_name}
            onChangeText={(text) => handleInputChange('store_name', text)}
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
            value={businessInfo.owner_name}
            onChangeText={(text) => handleInputChange('owner_name', text)}
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
            value={businessInfo.business_number}
            onChangeText={(text) => handleInputChange('business_number', text)}
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
              value={businessInfo.postal_code}
              onChangeText={(text) => handleInputChange('postal_code', text)}
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
            value={businessInfo.store_address}
            onChangeText={(text) => handleInputChange('store_address', text)}
            placeholder="기본 주소"
          />
          
          {/* 상세 주소 */}
          <TextInput
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.address_detail}
            onChangeText={(text) => handleInputChange('address_detail', text)}
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
          disabled={isLoading || businessRegistrationMutation.isPending}
        >
          <Text className="text-lg font-semibold text-center text-white">
            {isLoading || businessRegistrationMutation.isPending 
              ? '처리중...' 
              : (isSignup ? '회원가입 완료' : '저장')
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* 토스트 */}
      {showToast && (
        <Toast 
          visible={showToast}
          message={isSignup ? "회원가입이 완료되었습니다. 로그인해주세요." : "저장되었습니다"} 
          type="success"
          onHide={() => setShowToast(false)}
        />
      )}
    </View>
  );
}
