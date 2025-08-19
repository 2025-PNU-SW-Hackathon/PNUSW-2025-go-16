import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogBox, Platform } from 'react-native';
import Constants from 'expo-constants';
import RootNavigator, { linking } from '@/navigation/RootNavigator';
import { healthCheck } from '@/apis/apiClient';
import './global.css';

import { usePushNotifications } from '@/hooks/usePushNotifications';

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
  const { registerForPushNotificationsAsync } = usePushNotifications();
  const navigationRef = React.useRef<any>(null);

  // 앱 시작 시 푸시 알림 설정
  React.useEffect(() => {
    // 푸시 알림 등록
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push notification token:', token);
        // 토큰은 로그인 시 서버로 전송됩니다
      }
    }).catch(error => {
      console.error('Push notification registration failed:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}