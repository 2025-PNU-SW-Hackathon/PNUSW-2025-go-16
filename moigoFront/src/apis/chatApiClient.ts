import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

const CHAT_BASE_URL = 'http://10.0.2.2:5000/api/v1'; // Android 에뮬레이터용

const chatApiClient = axios.create({
  baseURL: CHAT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
