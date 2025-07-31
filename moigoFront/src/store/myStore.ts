import { create } from 'zustand';

// 사용자 등급 타입
type UserGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

// 사용자 정보 타입
interface UserProfile {
  id: string;
  name: string;
  profileImage?: string;
  grade: UserGrade;
  progressToNextGrade: number;
  coupons: number;
  participatedMatches: number;
  writtenReviews: number;
  preferredSports: string[];
}

// 설정 타입
interface Settings {
  notifications: boolean;
  appVersion: string;
}

// MyScreen 스토어 타입 정의
interface MyState {
  // 상태
  userProfile: UserProfile;
  settings: Settings;
  isLoading: boolean;
  
  // 액션
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleNotifications: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

// 초기 사용자 데이터
const initialUserProfile: UserProfile = {
  id: '1',
  name: '박지훈',
  grade: 'GOLD',
  progressToNextGrade: 75,
  coupons: 5,
  participatedMatches: 27,
  writtenReviews: 23,
  preferredSports: ['축구', '야구', '농구'],
};

const initialSettings: Settings = {
  notifications: true,
  appVersion: 'v2.1.0',
};

// MyScreen 스토어 생성
export const useMyStore = create<MyState>((set) => ({
  // 초기 상태
  userProfile: initialUserProfile,
  settings: initialSettings,
  isLoading: false,
  
  // 프로필 업데이트
  updateProfile: (profile: Partial<UserProfile>) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile },
    }));
  },
  
  // 알림 설정 토글
  toggleNotifications: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: !state.settings.notifications,
      },
    }));
  },
  
  // 로그아웃
  logout: () => {
    // 로그아웃 로직은 authStore에서 처리
    set({
      userProfile: initialUserProfile,
      settings: initialSettings,
      isLoading: false,
    });
  },
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 