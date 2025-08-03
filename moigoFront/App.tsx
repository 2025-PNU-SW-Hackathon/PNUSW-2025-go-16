import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogBox } from 'react-native';
import RootNavigator from '@/navigation/RootNavigator';
import './global.css';

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
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}