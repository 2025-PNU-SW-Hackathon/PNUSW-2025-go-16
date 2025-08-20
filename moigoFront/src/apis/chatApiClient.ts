import axios from 'axios';
import type { AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';

// 환경변수에서 API URL 가져오기
const { API_URL } = (Constants.expoConfig?.extra ?? {}) as any;
if (!API_URL) {
  console.warn('API_URL missing: check app.json extra.API_URL');
}

const CHAT_BASE_URL = API_URL ? `${API_URL}/api/v1` : 'https://spotple.kr/api/v1';

console.log('Chat API Client 초기화 - CHAT_BASE_URL:', CHAT_BASE_URL);

const chatApiClient = axios.create({
  baseURL: CHAT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

function getAccessToken(): string | null {
  return useAuthStore.getState().token;
}

// 요청 인터셉터 - JWT 토큰 추가
chatApiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('채팅 API 요청:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('채팅 API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
chatApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('채팅 API 응답 성공:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('채팅 API 응답 에러:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default chatApiClient;
