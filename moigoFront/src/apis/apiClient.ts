import axios from 'axios';
import type { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1/';

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

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = accessToken;
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
