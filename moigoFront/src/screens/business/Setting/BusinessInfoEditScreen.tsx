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
import { useStoreInfo, useUpdateStoreBasicInfo } from '@/hooks/queries/useUserQueries';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BusinessInfoEdit'>;
type RoutePropType = RouteProp<RootStackParamList, 'BusinessInfoEdit'>;

export default function BusinessInfoEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { storeId, isSignup = false } = route.params || {};
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState({
    store_name: '',
    owner_name: '',
    business_number: '',
    postal_code: '',
    store_address: '',
    address_detail: '',
    business_certificate_url: '',
    phone_number: '',
    email: '',
  });

  const businessRegistrationMutation = useBusinessRegistration();
  
  // API 훅 사용
  const { data: storeInfoData, isLoading: isStoreInfoLoading } = useStoreInfo();
  const { mutate: updateStoreBasicInfo, isPending: isUpdating, isSuccess: isUpdateSuccess, isError: isUpdateError } = useUpdateStoreBasicInfo();

  useEffect(() => {
    // 회원가입이 아닌 경우 기존 정보를 불러옴
    if (!isSignup && storeInfoData?.data?.store_info) {
      // API에서 가져온 storeInfo를 사용하여 폼 초기화
      const storeInfo = storeInfoData.data.store_info;
      console.log('🔍 [BusinessInfoEdit] API에서 가져온 storeInfo:', storeInfo);
      
      setBusinessInfo({
        store_name: storeInfo.store_name || '',
        owner_name: storeInfo.owner_name || '',
        business_number: storeInfo.business_reg_no || '',
        postal_code: storeInfo.postal_code || '',
        store_address: storeInfo.address_main || '',
        address_detail: storeInfo.address_detail || '',
        business_certificate_url: '', // StoreInfoDTO에 business_certificate_url이 없으므로 빈 값으로 설정
        phone_number: storeInfo.phone_number || '',
        email: storeInfo.email || '',
      });
      
      console.log('🔍 [BusinessInfoEdit] 폼에 설정된 businessInfo:', {
        store_name: storeInfo.store_name || '',
        owner_name: storeInfo.owner_name || '',
        business_number: storeInfo.business_reg_no || '',
        store_address: storeInfo.address_main || '',
        address_detail: storeInfo.address_detail || '',
      });
    } else if (!isSignup) {
      // storeInfo가 없는 경우 기본값 설정
      setBusinessInfo({
        store_name: '',
        owner_name: '',
        business_number: '',
        postal_code: '',
        store_address: '',
        address_detail: '',
        business_certificate_url: '',
        phone_number: '',
        email: '',
      });
    }
  }, [isSignup, storeInfoData]);

  // 사업자 정보 수정 성공/실패 처리
  useEffect(() => {
    if (isUpdateSuccess) {
      console.log('✅ [BusinessInfoEdit] 사업자 정보 수정 성공!');
      setToastMessage('사업자 정보가 성공적으로 수정되었습니다!');
      setToastType('success');
      setShowToast(true);
      
      // 2초 후 이전 화면으로 이동
      setTimeout(() => {
        setShowToast(false);
        navigation.goBack();
      }, 2000);
    }
  }, [isUpdateSuccess, navigation]);

  useEffect(() => {
    if (isUpdateError) {
      console.log('❌ [BusinessInfoEdit] 사업자 정보 수정 실패!');
      setToastMessage('사업자 정보 수정에 실패했습니다.');
      setToastType('error');
      setShowToast(true);
    }
  }, [isUpdateError]);

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
        // 일반 수정 시: 사업자 정보 수정 API 호출
        console.log('🚀 [BusinessInfoEdit] 사업자 정보 수정 시작:', businessInfo);
        
        const updateData = {
          // 새로운 요구사항: 모든 필수 필드 포함
          store_name: businessInfo.store_name,        // 상호명 (필수)
          owner_name: businessInfo.owner_name,        // 대표자명 (필수)
          business_number: businessInfo.business_number, // 사업자 등록번호 (필수)
          store_phonenumber: businessInfo.phone_number, // 연락처 (필수)
          store_address: businessInfo.store_address,   // 사업장 주소 (필수)
          postal_code: businessInfo.postal_code,       // 우편번호 (필수)
        };
        
        console.log('🚀 [BusinessInfoEdit] 서버로 전송할 데이터:', updateData);
        console.log('🔍 [BusinessInfoEdit] 필드별 값 확인:');
        console.log('- store_name:', businessInfo.store_name);
        console.log('- owner_name:', businessInfo.owner_name);
        console.log('- business_number:', businessInfo.business_number);
        console.log('- store_phonenumber:', businessInfo.phone_number);
        console.log('- store_address:', businessInfo.store_address);
        console.log('- postal_code:', businessInfo.postal_code);
        
        console.log('🚀 [BusinessInfoEdit] 서버로 전송할 데이터:', updateData);
        updateStoreBasicInfo(updateData);
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
          <Text className="mb-2 text-2xl font-bold text-center text-gray-800">
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

        {/* 연락처 정보 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-800">
            연락처 <Text className="text-red-500">*</Text>
          </Text>
          
          {/* 전화번호 */}
          <TextInput
            className="p-4 mb-3 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.phone_number || ''}
            onChangeText={(text) => handleInputChange('phone_number', text)}
            placeholder="전화번호"
            keyboardType="phone-pad"
          />
          
          {/* 이메일 */}
          <TextInput
            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            value={businessInfo.email || ''}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholder="이메일"
            keyboardType="email-address"
            autoCapitalize="none"
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
          disabled={isLoading || businessRegistrationMutation.isPending || isUpdating}
        >
          <Text className="text-lg font-semibold text-center text-white">
            {isLoading || businessRegistrationMutation.isPending || isUpdating
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
          message={toastMessage} 
          type={toastType}
          onHide={() => setShowToast(false)}
        />
      )}
    </View>
  );
}
