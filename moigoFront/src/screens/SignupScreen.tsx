import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { signup, checkUserIdDuplicate, checkStoreIdDuplicate, signupWithDuplicateCheck, storeSignupWithDuplicateCheck } from '@/apis/auth';
import { useStoreBasicSignup } from '@/hooks/queries/useAuthQueries';
import { useAuthStore } from '@/store';
import Toast from '@/components/common/Toast';
import CustomHeader from '@/components/common/CustomHeader';
import type { StoreBasicSignupResponseDTO } from '@/types/DTO/auth';

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedUserType } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  
  // 일반 사용자 회원가입 상태
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  
  // 사장님 회원가입 상태
  const [storeBasicInfo, setStoreBasicInfo] = useState({
    store_id: '',
    store_pwd: '',
    confirmPassword: '',
    email: '',
    store_phonenumber: '',
  });
  const [isStoreIdAvailable, setIsStoreIdAvailable] = useState(false);
  const [isCheckingStoreId, setIsCheckingStoreId] = useState(false);
  const [storeIdCheckMessage, setStoreIdCheckMessage] = useState('');

  const storeBasicSignupMutation = useStoreBasicSignup();

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

  // 일반 사용자 아이디 중복검사 (수동)
  const checkUserIdAvailability = async (id: string) => {
    if (!id.trim() || id.length < 4) {
      setIsIdAvailable(false);
      setIdCheckMessage('');
      return;
    }

    setIsCheckingId(true);
    try {
      const result = await checkUserIdDuplicate(id);
      console.log('중복검사 결과:', result);
      // 서버에서 isDuplicate 필드로 응답하므로 이를 반대로 처리
      setIsIdAvailable(!result.isDuplicate);
      setIdCheckMessage(result.isDuplicate ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.');
    } catch (error: any) {
      console.error('아이디 중복검사 실패:', error);
      setIsIdAvailable(false);
      setIdCheckMessage('중복검사 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingId(false);
    }
  };

  // 사장님 아이디 중복검사 (수동)
  const checkStoreIdAvailability = async (id: string) => {
    if (!id.trim() || id.length < 4) {
      setIsStoreIdAvailable(false);
      setStoreIdCheckMessage('');
      return;
    }

    setIsCheckingStoreId(true);
    try {
      const result = await checkStoreIdDuplicate(id);
      console.log('사장님 중복검사 결과:', result);
      // 서버에서 isDuplicate 필드로 응답하므로 이를 반대로 처리
      setIsStoreIdAvailable(!result.isDuplicate);
      setStoreIdCheckMessage(result.isDuplicate ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.');
    } catch (error: any) {
      console.error('사장님 아이디 중복검사 실패:', error);
      setIsStoreIdAvailable(false);
      setStoreIdCheckMessage('중복검사 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingStoreId(false);
    }
  };

  // 수동 아이디 중복확인
  const handleIdCheck = async () => {
    if (!userId.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (userId.length < 4 || userId.length > 12) {
      Alert.alert('알림', '아이디는 4~12자로 입력해주세요.');
      return;
    }
    
    await checkUserIdAvailability(userId);
  };

  // 수동 사장님 아이디 중복확인
  const handleStoreIdCheck = async () => {
    if (!storeBasicInfo.store_id.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (storeBasicInfo.store_id.length < 4 || storeBasicInfo.store_id.length > 12) {
      Alert.alert('알림', '아이디는 4~12자로 입력해주세요.');
      return;
    }
    
    await checkStoreIdAvailability(storeBasicInfo.store_id);
  };

  // 사장님 회원가입 입력 처리
  const handleStoreInputChange = (field: keyof typeof storeBasicInfo, value: string) => {
    setStoreBasicInfo(prev => ({ ...prev, [field]: value }));
  };

  // 사장님 회원가입 유효성 검사
  const validateStoreForm = () => {
    if (!storeBasicInfo.store_id || !storeBasicInfo.store_pwd || !storeBasicInfo.confirmPassword || !storeBasicInfo.email || !storeBasicInfo.store_phonenumber) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return false;
    }

    if (storeBasicInfo.store_pwd !== storeBasicInfo.confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return false;
    }

    if (storeBasicInfo.store_pwd.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return false;
    }

    // 비밀번호에 최소 1개의 문자가 포함되어야 함
    if (!/[a-zA-Z]/.test(storeBasicInfo.store_pwd)) {
      Alert.alert('입력 오류', '비밀번호에 최소 1개의 문자가 포함되어야 합니다.');
      return false;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(storeBasicInfo.email)) {
      Alert.alert('입력 오류', '올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9-]+$/;
    if (!phoneRegex.test(storeBasicInfo.store_phonenumber)) {
      Alert.alert('입력 오류', '올바른 전화번호 형식을 입력해주세요.');
      return false;
    }

    return true;
  };

  // 사장님 회원가입 처리
  const handleStoreSignup = async () => {
    console.log('handleStoreSignup 시작');
    console.log('현재 storeBasicInfo:', storeBasicInfo);
    
    if (!validateStoreForm()) {
      console.log('사장님 회원가입 유효성 검사 실패');
      return;
    }

    try {
      console.log('사장님 회원가입 API 호출 시작');
      const { confirmPassword, ...signupData } = storeBasicInfo;
      console.log('회원가입 데이터:', signupData);
      
      // API 호출 전 데이터 확인
      if (!signupData.store_id || !signupData.store_pwd || !signupData.email || !signupData.store_phonenumber) {
        console.error('필수 데이터 누락:', signupData);
        Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
        return;
      }
      
      // 중복검사 후 회원가입 API 호출
      const response = await storeSignupWithDuplicateCheck(signupData);
      console.log('사장님 회원가입 API 응답:', response);
      
      if (response && response.success) {
        console.log('사장님 회원가입 성공, 토스트 표시');
        setShowToast(true);
        setToastMessage('기본 회원가입이 완료되었습니다. 사업자 정보를 입력해주세요.');
        setToastType('success');
        
        // 2초 후 사업자 정보 등록 화면으로 이동
        setTimeout(() => {
          console.log('타이머 완료, BusinessInfoEdit 화면으로 이동 시도');
          setShowToast(false);
          
          try {
            // 타입 단언을 사용하여 타입 에러 해결
            const typedResponse = response as StoreBasicSignupResponseDTO;
            if (typedResponse.data && typedResponse.data.store_id) {
              navigation.navigate('BusinessInfoEdit', { 
                storeId: typedResponse.data.store_id,
                isSignup: true 
              });
              console.log('BusinessInfoEdit 화면으로 이동 성공');
            } else {
              console.error('store_id가 응답에 없음:', typedResponse.data);
              Alert.alert('오류', '서버 응답에 store_id가 없습니다.');
            }
          } catch (navError) {
            console.error('네비게이션 에러:', navError);
            Alert.alert('오류', '화면 이동 중 오류가 발생했습니다.');
          }
        }, 2000);
      } else {
        console.log('사장님 회원가입 실패:', response?.message || '알 수 없는 오류');
        // 에러 메시지를 토스트로 표시
        setShowToast(true);
        setToastMessage(response?.message || '알 수 없는 오류');
        setToastType('error');
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error) {
      console.error('사장님 회원가입 실패:', error);
      
      // 더 자세한 에러 정보 표시
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = (error as any).message;
        } else if ('response' in error && (error as any).response?.data?.message) {
          errorMessage = (error as any).response.data.message;
        }
      }
      
      // 에러 메시지를 토스트로 표시
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  // 일반 사용자 회원가입 처리
  const handleUserSignup = async () => {
    // 유효성 검사
    if (!userId.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상 입력해주세요.');
      return;
    }
    // 비밀번호에 최소 1개의 문자가 포함되어야 함
    if (!/[a-zA-Z]/.test(password)) {
      Alert.alert('알림', '비밀번호에 최소 1개의 문자가 포함되어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!email.trim() || !emailDomain) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('알림', '휴대폰 번호를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      const fullEmail = `${email}@${emailDomain}`;
      
      // 중복검사 후 회원가입 요청
      const response = await signupWithDuplicateCheck({
        user_id: userId.trim(),
        user_pwd: password.trim(),
        user_email: fullEmail,
        user_name: userId.trim(), // 임시로 아이디를 이름으로 사용
        user_phone_number: phoneNumber.trim(),
        user_region: '서울', // 기본값
        user_gender: 1, // 기본값
      });

      console.log('회원가입 성공:', response);

      if (response.success) {
        // 성공 메시지를 토스트로 표시
        setToastMessage('회원가입이 완료되었습니다.');
        setToastType('success');
        setShowToast(true);
        
        setTimeout(() => {
          setShowToast(false);
          navigation.navigate('Login');
        }, 2000);
      } else {
        // 에러 메시지를 토스트로 표시
        setToastMessage(response.message || '회원가입에 실패했습니다.');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      
      // 서버에서 받은 에러 메시지 표시
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // 에러 메시지를 토스트로 표시
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 타입에 따른 회원가입 처리
  const handleSignup = () => {
    console.log('handleSignup 호출됨, selectedUserType:', selectedUserType);
    
    if (selectedUserType === 'business') {
      console.log('사장님 회원가입 처리 시작');
      handleStoreSignup();
    } else {
      console.log('일반 사용자 회원가입 처리 시작');
      handleUserSignup();
    }
  };

  // 사용자 타입에 따른 유효성 검사
  const validateForm = () => {
    if (selectedUserType === 'business') {
      return validateStoreForm();
    } else {
      // 일반 사용자 유효성 검사는 handleUserSignup에서 처리
      return true;
    }
  };

  // 사장님 회원가입 폼 렌더링
  const renderStoreSignupForm = () => (
    <>
      {/* 매장 ID */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-800">
          매장 ID <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
          value={storeBasicInfo.store_id}
          onChangeText={(text) => {
            setStoreBasicInfo(prev => ({ ...prev, store_id: text }));
            setIsStoreIdAvailable(false); // 아이디 변경 시 중복확인 초기화
            setStoreIdCheckMessage('');
          }}
          placeholder="매장 ID를 입력하세요"
          autoCapitalize="none"
          editable={!isLoading}
        />
        {isCheckingStoreId ? (
          <Text className="mt-2 text-sm text-mainGrayText">중복 확인 중...</Text>
        ) : (
          <Text className="mt-2 text-sm text-mainGrayText">
            {storeIdCheckMessage || '4~12자 영문 소문자(숫자 조합 가능)'}
          </Text>
        )}
        <TouchableOpacity 
          className={`mt-2 rounded-lg px-4 py-4 ${isStoreIdAvailable ? 'bg-green-500' : 'bg-mainOrange'}`}
          onPress={handleStoreIdCheck}
          disabled={isLoading || isCheckingStoreId}
        >
          <Text className="text-sm font-semibold text-white">
            {isStoreIdAvailable ? '확인완료' : '중복확인'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 비밀번호 */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-800">
          비밀번호 <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
          value={storeBasicInfo.store_pwd}
          onChangeText={(text) => handleStoreInputChange('store_pwd', text)}
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
        />
      </View>

      {/* 비밀번호 확인 */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-800">
          비밀번호 확인 <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
          value={storeBasicInfo.confirmPassword}
          onChangeText={(text) => handleStoreInputChange('confirmPassword', text)}
          placeholder="비밀번호를 다시 입력하세요"
          secureTextEntry
        />
      </View>

      {/* 이메일 */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-800">
          이메일 <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
          value={storeBasicInfo.email}
          onChangeText={(text) => handleStoreInputChange('email', text)}
          placeholder="이메일을 입력하세요"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* 전화번호 */}
      <View className="mb-8">
        <Text className="mb-2 text-sm font-medium text-gray-800">
          전화번호 <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
          value={storeBasicInfo.store_phonenumber}
          onChangeText={(text) => handleStoreInputChange('store_phonenumber', text)}
          placeholder="전화번호를 입력하세요 (예: 02-1234-5678)"
          keyboardType="phone-pad"
        />
      </View>
    </>
  );

  // 일반 사용자 회원가입 폼 렌더링
  const renderUserSignupForm = () => (
    <>
      {/* ID 섹션 */}
      <View className="mb-6">
        <Text className="mb-2 text-base font-semibold text-mainDark">아이디</Text>
        <View className="flex-row items-center my-2 space-x-2">
          <View className="flex-1 px-4 py-1 mr-4 bg-white rounded-lg border border-gray-200">
            <TextInput
              placeholder="아이디"
              value={userId}
              onChangeText={(text) => {
                setUserId(text);
                setIsIdAvailable(false); // 아이디 변경 시 중복확인 초기화
                setIdCheckMessage('');
              }}
              className="text-base"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          <TouchableOpacity 
            className={`rounded-lg px-4 py-4 ${isIdAvailable ? 'bg-green-500' : 'bg-mainOrange'}`}
            onPress={handleIdCheck}
            disabled={isLoading || isCheckingId}
          >
            <Text className="text-sm font-semibold text-white">
              {isIdAvailable ? '확인완료' : '중복확인'}
            </Text>
          </TouchableOpacity>
        </View>
        {isCheckingId ? (
          <Text className="mt-2 text-sm text-mainGrayText">중복 확인 중...</Text>
        ) : (
          <Text className="mt-2 text-sm text-mainGrayText">
            {idCheckMessage || '4~12자 / 영문 소문자(숫자 조합 가능)'}
          </Text>
        )}
      </View>

      {/* 비밀번호 섹션 */}
      <View className="mb-6">
        <Text className="mb-2 text-base font-semibold text-mainDark">비밀번호</Text>
        <View className="space-y-3">
          <View className="px-4 py-1 my-2 bg-white rounded-lg border border-gray-200">
            <TextInput
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              className="text-base"
              secureTextEntry
              editable={!isLoading}
            />
          </View>
          <View className="px-4 py-1 my-2 bg-white rounded-lg border border-gray-200">
            <TextInput
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="text-base"
              secureTextEntry
              editable={!isLoading}
            />
          </View>
        </View>
        <Text className="mt-2 text-sm text-mainGrayText">
          6~20자 / 영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합
        </Text>
      </View>

      {/* 이메일 섹션 */}
      <View className="mb-6">
        <Text className="mb-2 text-base font-semibold text-mainDark">이메일</Text>
        <View className="flex-row items-center my-2 space-x-2">
          <View className="flex-1 px-4 py-1 bg-white rounded-lg border border-gray-200">
            <TextInput
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              className="text-base"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>
          <Text className="mx-2 text-lg font-bold text-mainGrayText">@</Text>
          <View className="relative flex-1">
            <TouchableOpacity
              className={`flex-row justify-between items-center p-4 bg-white rounded-lg border border-gray-200`}
              onPress={() => setShowDomainDropdown(!showDomainDropdown)}
              disabled={isLoading}
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
              <View className="absolute right-0 left-0 top-full z-10 mt-1 max-h-48 bg-white rounded-lg border border-gray-200 shadow-lg">
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
        <Text className="mb-2 text-base font-semibold text-mainDark">휴대폰 번호</Text>
        <View className="flex-row items-center my-2 space-x-2">
          <View className="flex-1 px-4 py-1 mr-4 bg-white rounded-lg border border-gray-200">
            <TextInput
              placeholder="휴대폰 번호"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              className="text-base"
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
          <TouchableOpacity 
            className="px-4 py-4 rounded-lg bg-mainOrange"
            disabled={isLoading}
          >
            <Text className="text-sm font-semibold text-white">인증번호 받기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={() => setShowDomainDropdown(false)}>
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* CustomHeader 사용 */}
          <CustomHeader 
            title={selectedUserType === 'business' ? '사장님 회원가입' : '회원가입'}
            showBackButton
            onBackPress={() => navigation.goBack()}
          />

          <ScrollView 
            className="flex-1 px-4 py-6" 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* 사용자 타입 표시 */}
            <View className="px-4 py-3 mb-6 bg-gray-100 rounded-lg">
              <Text className="text-sm text-center text-gray-600">
                {selectedUserType === 'business' ? '사업자' : '스포츠 팬'} 모드로 회원가입
              </Text>
            </View>

            {/* 사용자 타입에 따른 폼 렌더링 */}
            {selectedUserType === 'business' ? renderStoreSignupForm() : renderUserSignupForm()}
          </ScrollView>

          {/* 가입하기 버튼 */}
          <View className="absolute bottom-0 px-4 py-7 w-full bg-white border-t border-gray-100">
            <PrimaryButton 
              title={isLoading || storeBasicSignupMutation.isPending ? "가입 중..." : "가입하기"} 
              color={COLORS.mainOrange}
              onPress={handleSignup}
              disabled={isLoading || storeBasicSignupMutation.isPending}
            />
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
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}