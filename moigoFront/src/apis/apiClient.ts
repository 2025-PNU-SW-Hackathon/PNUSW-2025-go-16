import axios from 'axios';
import type { AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';

// 환경변수에서 API URL 가져오기
const { API_URL } = (Constants.expoConfig?.extra ?? {}) as any;
if (!API_URL) {
  console.warn('API_URL missing: check app.json extra.API_URL');
}

const BASE_URL = API_URL ? `${API_URL}/api/v1` : 'https://spotple.kr/api/v1';

console.log('API Client 초기화 - BASE_URL:', BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 토큰을 동적으로 가져오는 함수
function getAccessToken(): string | null {
  return useAuthStore.getState().token;
}

apiClient.interceptors.request.use(
  (config) => {
    console.log('API 요청:', config.method?.toUpperCase(), config.url);
    console.log('요청 데이터:', config.data);
    console.log('전체 URL:', (config.baseURL || '') + (config.url || ''));
    
    // 매 요청마다 최신 토큰을 가져옴
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('accessToken', accessToken);
      console.log('인증 헤더 설정됨:', accessToken.substring(0, 20) + '...');
    } else {
      console.log('토큰이 없습니다! (로그인 전에는 정상)');
    }
    return config;
  },
  (error) => {
    console.error('요청 에러:', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API 응답 성공:', response.status, response.data);
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      console.error('API 응답 에러:', error.response?.status, error.response?.data);
      console.error('에러 메시지:', error.message);
      console.error('요청 URL:', error.config?.url);
      
      // 401 에러 시 토큰 상태 확인
      if (error.response?.status === 401) {
        const currentToken = getAccessToken();
        console.error('401 에러 - 현재 토큰 상태:', currentToken ? '있음' : '없음');
        if (currentToken) {
          console.error('토큰 값:', currentToken.substring(0, 20) + '...');
        }
      }
    }
    return Promise.reject(error);
  },
);

// 기존 setAccessToken 함수는 하위 호환성을 위해 유지
let legacyAccessToken: string | null = null;
export function setAccessToken(token: string | null) {
  legacyAccessToken = token;
  console.log('토큰 설정됨:', token ? '있음' : '없음');
}

// 헬스체크 함수 추가 (비활성화)
export async function healthCheck() {
  // 헬스체크 비활성화 - 불필요한 요청 방지
  console.log('API 서버 연결 설정 완료 - URL:', BASE_URL);
  return true;
}

export default apiClient;
