import { create } from 'zustand';

// 마이페이지 전용 설정 타입
interface MyPageSettings {
  notifications: boolean;
  appVersion: string;
}

// MyScreen 스토어 타입 정의
interface MyState {
  // 상태
  settings: MyPageSettings;
  isLoading: boolean;
  
  // 액션
  toggleNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

// 초기 마이페이지 설정
const initialSettings: MyPageSettings = {
  notifications: true,
  appVersion: 'v2.1.0',
};

// MyScreen 스토어 생성
export const useMyStore = create<MyState>((set) => ({
  // 초기 상태
  settings: initialSettings,
  isLoading: false,
  
  // 알림 설정 토글
  toggleNotifications: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: !state.settings.notifications,
      },
    }));
  },
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 