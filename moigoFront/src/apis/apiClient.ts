import axios from 'axios';
import type { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// 임시 토큰 설정 (개발용)
setAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcjEiLCJpYXQiOjE3NTQyMjY5NjEsImV4cCI6MTc1NDIzNDE2MX0.DCgiJAAzvXLNZ8e4_TqCO269u9j28bTa4c3N0mQOr6k');

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('요청 헤더:', config.headers);
    } else {
      console.log('토큰이 없습니다!');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
