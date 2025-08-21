import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/store';
import { useLogin, useStoreLogin } from '@/hooks/queries/useAuthQueries';


export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, selectedUserType, setLoading, isLoading } = useAuthStore();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // 자동 로그인 설정 (Zustand persist가 자동 처리)

  // 로그인 훅들
  const loginMutation = useLogin();
  const storeLoginMutation = useStoreLogin();

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
      if (selectedUserType === 'business') {
        // 사장님 로그인
        await storeLoginMutation.mutateAsync({
          store_id: userId.trim(),
          store_pwd: password.trim(),
        });
        
        // 사장님 로그인 성공 후 RootNavigator가 자동으로 처리
        Alert.alert('성공', '사장님 로그인되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              // RootNavigator에서 isLoggedIn 상태 변화를 감지하여 자동으로 Main 화면 표시
            }
          }
        ]);
      } else {
        // 일반 사용자 로그인
        await loginMutation.mutateAsync({
          user_id: userId.trim(),
          user_pwd: password.trim(),
        });

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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    style={{
                      fontSize: 16,
                      lineHeight: 20,
                    }}
                  />
                </View>
                <View className="px-4 py-2 mb-3 bg-white rounded-lg border border-gray-200">
                  <TextInput
                    placeholder="비밀번호"
                    value={password}
                    onChangeText={setPassword}
                    className="text-base"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    style={{
                      fontSize: 16,
                      lineHeight: 20,
                    }}
                  />
                </View>
              </View>

      {/* 자동 로그인 체크박스 */}
      <View className="flex-row items-center mb-4 w-full">
        <TouchableOpacity 
          onPress={() => setRememberMe(!rememberMe)}
          className="flex-row items-center"
        >
          <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
            rememberMe ? 'bg-mainOrange border-mainOrange' : 'border-gray-300'
          }`}>
            {rememberMe && (
              <Text className="text-xs font-bold text-white">✓</Text>
            )}
          </View>
          <Text className="text-gray-600">자동 로그인</Text>
        </TouchableOpacity>
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
                <View className="my-1">
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('알림', '카카오 로그인 기능은 준비 중입니다.');
                    }}
                    activeOpacity={0.8}
                    className="overflow-hidden items-center w-full"
                    style={{
                      height: 48,
                      backgroundColor: '#FEE500',
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                    }}
                  >
                    {/* 카카오 아이콘 */}
                    <Image
                      source={require('@/assets/kakaoIcon.png')}
                      style={{
                        width: 18,
                        height: 18,
                        marginRight: 25,
                      }}
                      resizeMode="contain"
                    />
                    
                    {/* 텍스트 */}
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 18,
                        fontFamily: 'System',
                        color: 'rgba(0, 0, 0, 0.85)',
                        textAlign: 'center',
                      }}
                    >
                      카카오 로그인
                    </Text>
                    
                    {/* 오른쪽 여백을 위한 빈 공간 */}
                    <View style={{ width: 25, height: 18 }} />
                  </TouchableOpacity>
                </View>
                <View className="my-1">
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('알림', '네이버 로그인 기능은 준비 중입니다.');
                    }}
                    activeOpacity={0.8}
                    className="overflow-hidden items-center w-full"
                    style={{
                      height: 48,
                      backgroundColor: '#03C75A',
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                    }}
                  >
                    {/* 네이버 로고 */}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        marginRight: 25,
                      }}
                    >
                      N
                    </Text>
                    
                    {/* 텍스트 */}
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 18,
                        fontFamily: 'System',
                        color: '#FFFFFF',
                        textAlign: 'center',
                      }}
                    >
                      네이버 로그인
                    </Text>
                    
                    {/* 오른쪽 여백을 위한 빈 공간 */}
                    <View style={{ width: 25, height: 18 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
