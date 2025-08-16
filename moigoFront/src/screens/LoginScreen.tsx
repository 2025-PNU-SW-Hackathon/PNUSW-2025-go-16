import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/store';
import { login as loginAPI, storeLogin as storeLoginAPI } from '@/apis/auth';
import { setAccessToken } from '@/apis/apiClient';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, selectedUserType, setLoading, isLoading } = useAuthStore();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 간단한 유효성 검사
    if (!userId.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      console.log('로그인 시도:', { userId: userId.trim(), password: '***', userType: selectedUserType });
      
      let response;
      
      if (selectedUserType === 'business') {
        // 사장님 로그인
        response = await storeLoginAPI({
          store_id: userId.trim(),
          store_pwd: password.trim(),
        });
        
        console.log('사장님 로그인 성공:', response);
        
        // 사장님 로그인 성공 시 처리
        if (response.success && response.data.token) {
          setAccessToken(response.data.token);
          
          // 스토어에 사용자 정보 저장
          login({
            id: response.data.store.store_id,
            email: '', // 사장님은 이메일 정보가 없을 수 있음
            name: response.data.store.store_name,
            phoneNumber: '', // 사장님은 전화번호 정보가 없을 수 있음
            gender: 0, // 사장님은 성별 정보가 없음
            userType: 'business',
          }, response.data.token);
          
          // 사장님 로그인 성공 후 RootNavigator가 자동으로 처리
          Alert.alert('성공', '사장님 로그인되었습니다.', [
            {
              text: '확인',
              onPress: () => {
                // RootNavigator에서 isLoggedIn 상태 변화를 감지하여 자동으로 Main 화면 표시
              }
            }
          ]);
        }
      } else {
        // 일반 사용자 로그인
        response = await loginAPI({
          user_id: userId.trim(),
          user_pwd: password.trim(),
        });

        console.log('일반 사용자 로그인 성공:', response);

        // 서버 응답에서 토큰 찾기 (여러 가능한 위치 확인)
        let token: string | null = null;
        
        // 1. 최상위 레벨에서 token 확인
        if ((response.data as any).token) {
          token = (response.data as any).token;
          console.log('최상위 레벨에서 토큰 발견');
        }
        // 2. data 안에서 token 확인 (response.data가 중첩된 구조일 경우)
        else if ((response.data as any).data && ((response.data as any).data as any).token) {
          token = ((response.data as any).data as any).token;
          console.log('data 안에서 토큰 발견');
        }
        // 3. 전체 응답에서 token 확인
        else if ((response as any).token) {
          token = (response as any).token;
          console.log('전체 응답에서 토큰 발견');
        }
        
        if (token) {
          console.log('서버에서 제공된 토큰 사용:', token.substring(0, 20) + '...');
        } else {
          // 서버에서 토큰을 제공하지 않는 경우 (임시)
          console.log('서버에서 토큰을 제공하지 않음. 임시 토큰 생성');
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify({ 
            user_id: response.data.user.user_id,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24시간 후 만료
            iat: Math.floor(Date.now() / 1000)
          }));
          const signature = btoa('temp-signature-' + Date.now());
          token = `${header}.${payload}.${signature}`;
          console.log('임시 JWT 토큰 생성됨');
        }
        
        setAccessToken(token);

        // 스토어에 사용자 정보 저장
        login({
          id: response.data.user.user_id,
          email: response.data.user.user_email,
          name: response.data.user.user_name,
          phoneNumber: response.data.user.user_phone_number,
          gender: response.data.user.user_gender,
          userType: selectedUserType || 'sports_fan',
        }, token);

        // 일반 사용자 로그인 성공 후 RootNavigator가 자동으로 처리
        Alert.alert('성공', '로그인되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              // RootNavigator에서 isLoggedIn 상태 변화를 감지하여 자동으로 Main 화면 표시
            }
          }
        ]);
      }
    } catch (error: any) {
      console.error('로그인 에러:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // 서버에서 받은 에러 메시지 표시
      if (error.response?.data?.message) {
        Alert.alert('로그인 실패', error.response.data.message);
      } else if (error.message) {
        Alert.alert('로그인 실패', error.message);
      } else {
        Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-8 bg-white">
      {/* 로고 */}
      <View className="mb-12">
        <Image
          source={require('@/assets/moigoLogo.png')}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* 사용자 타입 표시 */}
      {selectedUserType && (
        <View className="px-4 py-2 mb-4 bg-gray-100 rounded-lg">
          <Text className="text-sm text-center text-gray-600">
            {selectedUserType === 'business' ? '사업자' : '스포츠 팬'} 모드로 로그인
          </Text>
        </View>
      )}

      {/* 입력 필드들 */}
      <View className="mb-5 space-y-4 w-full">
        <View className="px-4 py-2 mb-3 bg-white rounded-lg border border-gray-200">
          <TextInput
            placeholder={selectedUserType === 'business' ? '매장 ID' : '아이디'}
            value={userId}
            onChangeText={setUserId}
            className="text-base"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        <View className="px-4 py-2 mb-3 bg-white rounded-lg border border-gray-200">
          <TextInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            className="text-base"
            secureTextEntry
            editable={!isLoading}
          />
        </View>
      </View>

      {/* 로그인 버튼 */}
      <View className="mb-5 w-full">
        <PrimaryButton
          title={isLoading ? "로그인 중..." : "로그인"}
          color={COLORS.mainOrange}
          onPress={handleLogin}
          disabled={isLoading}
        />
      </View>

      {/* 링크들 */}
      <View className="flex-row justify-between mb-8 w-full">
        <TouchableOpacity>
          <Text className="text-mainGrayText">비밀번호 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-mainGrayText">회원가입</Text>
        </TouchableOpacity>
      </View>

      {/* 구분선 */}
      <View className="flex-row items-center mb-3 w-full">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-4 text-mainGrayText">간편 로그인</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* 소셜 로그인 버튼들 */}
      <View className="space-y-3 w-full">
        <View className="my-2">
          <TouchableOpacity
            onPress={() => {
              Alert.alert('알림', '카카오 로그인 기능은 준비 중입니다.');
            }}
            activeOpacity={0.8}
            className="overflow-hidden items-center w-full"
            style={{
              height: 60,
              backgroundColor: '#FEE500',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 30,
            }}
          >
                         {/* 카카오 아이콘 */}
             <Image
               source={require('@/assets/kakaoIcon.png')}
               style={{
                 width: 20,
                 height: 20,
                 marginRight: 15,
               }}
               resizeMode="contain"
             />
            
            {/* 텍스트 */}
            <Text
              style={{
                flex: 1,
                fontSize: 20,
                fontFamily: 'System',
                color: 'rgba(0, 0, 0, 0.85)',
                textAlign: 'center',
              }}
            >
              카카오 로그인
            </Text>
            
                         {/* 오른쪽 여백을 위한 빈 공간 */}
             <View style={{ width: 15, height: 30 }} />
          </TouchableOpacity>
        </View>
        <View className="my-2">
          <TouchableOpacity
            onPress={() => {
              Alert.alert('알림', '네이버 로그인 기능은 준비 중입니다.');
            }}
            activeOpacity={0.8}
            className="overflow-hidden items-center w-full"
            style={{
              height: 60,
              backgroundColor: '#03C75A',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 30,
            }}
          >
            {/* 네이버 로고 */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginRight: 15,
              }}
            >
              N
            </Text>
            
            {/* 텍스트 */}
            <Text
              style={{
                flex: 1,
                fontSize: 20,
                fontFamily: 'System',
                color: '#FFFFFF',
                textAlign: 'center',
              }}
            >
              네이버 로그인
            </Text>
            
            {/* 오른쪽 여백을 위한 빈 공간 */}
            <View style={{ width: 15, height: 30 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
