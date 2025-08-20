import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogBox, Platform, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import RootNavigator, { linking } from '@/navigation/RootNavigator';
import { healthCheck } from '@/apis/apiClient';
import './global.css';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import PushNotificationBanner from '@/components/common/PushNotificationBanner';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

// 환경변수 로깅
const { API_URL, WS_URL } = (Constants.expoConfig?.extra ?? {}) as any;
console.log('=== 배포 서버 설정 확인 ===');
console.log('API_URL:', API_URL || '기본값 사용 (https://spotple.kr)');
console.log('WS_URL:', WS_URL || '기본값 사용 (wss://spotple.kr)');

// 앱 시작 시 헬스체크 실행
healthCheck().then((isHealthy) => {
  console.log('초기 API 연결 상태:', isHealthy ? '성공' : '실패');
}).catch((error) => {
  console.log('헬스체크 중 오류 발생 (앱 시작에는 영향 없음):', error.message);
  console.log('실제 API 연결은 로그인 후 확인됩니다.');
});

// 특정 에러 메시지 무시 (개발 모드에서만)
LogBox.ignoreLogs([
  'AxiosError: Request failed with status code 400',
  'AxiosError: Request failed with status code 409',
  'AxiosError: Request failed with sta',
  '참여 실패:',
  '모임 참여 실패:',
]);

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const navigationRef = React.useRef<any>(null);
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  
  // 푸시 알림 배너 상태
  const [bannerVisible, setBannerVisible] = React.useState(false);
  const [bannerData, setBannerData] = React.useState({
    title: '',
    body: '',
    onPress: () => {},
  });

  // 푸시 토큰 상태 추가
  const [pushToken, setPushToken] = React.useState<string | null>(null);

  // 푸시 알림 핸들러
  const { registerForPushNotificationsAsync } = usePushNotifications({
    onNavigate: (screen: string, params?: any) => {
      console.log('푸시 알림 네비게이션:', { screen, params });
      if (navigationRef.current) {
        navigationRef.current.navigate(screen, params);
      }
    },
    onShowBanner: (title: string, body: string, onPress: () => void) => {
      console.log('푸시 알림 배너 표시:', { title, body });
      setBannerData({ title, body, onPress });
      setBannerVisible(true);
    },
    onSaveNotification: (notification) => {
      console.log('알림 저장:', notification);
      addNotification({
        type: notification.type as any,
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });
    },
    currentUserType: user?.userType,
  });

  // 앱 시작 시 자동 로그인 체크 및 푸시 알림 설정
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. 자동 로그인 체크 (태블릿에서 단순화)
        console.log('태블릿 모드: 자동 로그인 체크 단순화');
        const isAutoLoginSuccess = await user ? true : false;
        if (isAutoLoginSuccess) {
          console.log('자동 로그인 성공');
        } else {
          console.log('자동 로그인 없음 또는 실패');
        }

        // 2. 푸시 알림 등록 (선택적)
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            console.log('Push notification token:', token);
            setPushToken(token); // 토큰을 상태에 저장
            // 토큰은 로그인 시 서버로 전송됩니다
          } else {
            console.log('푸시 알림 토큰을 가져올 수 없습니다. 알림 없이 계속 진행합니다.');
          }
        } catch (pushError) {
          console.log('푸시 알림 설정 실패:', pushError);
          console.log('알림 없이 앱을 계속 사용할 수 있습니다.');
        }
      } catch (error) {
        console.error('앱 초기화 중 오류:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <NavigationContainer ref={navigationRef} linking={linking}>
            <RootNavigator />
          </NavigationContainer>
          
          {/* 개발용: 푸시 토큰 표시 오버레이 */}
          {__DEV__ && pushToken && (
            <View style={{
              position: 'absolute',
              top: 50,
              left: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 10,
              borderRadius: 5,
              zIndex: 9999,
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>
                푸시 토큰 (개발용):
              </Text>
              <ScrollView style={{ maxHeight: 60 }}>
                <Text style={{ color: 'white', fontSize: 10, fontFamily: 'monospace' }}>
                  {pushToken}
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={{ backgroundColor: '#007AFF', padding: 5, borderRadius: 3, marginTop: 5 }}
                onPress={() => {
                  // 클립보드 복사 (Expo Clipboard 사용)
                  console.log('푸시 토큰:', pushToken);
                  Alert.alert('토큰 복사됨', '콘솔에서 확인하거나 수동으로 복사하세요');
                }}
              >
                <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }}>
                  콘솔 로그 출력
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* 푸시 알림 배너 */}
          <PushNotificationBanner
            visible={bannerVisible}
            title={bannerData.title}
            body={bannerData.body}
            onPress={() => {
              setBannerVisible(false);
              bannerData.onPress();
            }}
            onDismiss={() => setBannerVisible(false)}
          />
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}