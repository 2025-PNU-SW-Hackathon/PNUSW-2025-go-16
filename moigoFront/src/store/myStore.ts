import { create } from 'zustand';
import { useAuthStore } from './authStore';

// 사용자 등급 타입
type UserGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

// 마이페이지 사용자 정보 타입
interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: 'male' | 'female';
  phone?: string;
  birthDate?: string;
  bio?: string;
  region?: string;
  profileImage?: string;
  grade: UserGrade;
  progressToNextGrade: number;
  coupons: number;
  participatedMatches: number;
  writtenReviews: number;
  preferredSports: string[];
}

// 마이페이지 전용 설정 타입
interface MyPageSettings {
  notifications: boolean;
  appVersion: string;
}

// MyScreen 스토어 타입 정의
interface MyState {
  // 상태
  userProfile: UserProfile | null;
  settings: MyPageSettings;
  isLoading: boolean;

  // 액션
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateProfileImage: (imageUri: string) => void;
  initializeUserProfile: (authUser: { id: string; email: string; userType: 'sports_fan' | 'business' }) => void;
  resetUserProfile: () => void;
  toggleNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

// 초기 마이페이지 설정
const initialSettings: MyPageSettings = {
  notifications: true,
  appVersion: 'v2.1.0',
};

// authStore의 사용자 정보를 기반으로 마이페이지 사용자 정보 생성
const createUserProfileFromAuth = (authUser: { id: string; email: string; userType: 'sports_fan' | 'business' }): UserProfile => {
  // 이메일에서 @ 앞부분을 이름으로 사용
  const name = authUser.email.split('@')[0];

  return {
    id: authUser.id,
    name: name,
    email: authUser.email,
    gender: 'male', // 기본값
    profileImage: undefined,
    grade: 'BRONZE',
    progressToNextGrade: 0,
    coupons: 0,
    participatedMatches: 0,
    writtenReviews: 0,
    preferredSports: [],
  };
};

// MyScreen 스토어 생성
export const useMyStore = create<MyState>((set, get) => ({
  // 초기 상태
  userProfile: null,
  settings: initialSettings,
  isLoading: false,

  // 사용자 프로필 업데이트
  updateUserProfile: (profile: Partial<UserProfile>) => {
    set((state) => ({
      userProfile: state.userProfile ? { ...state.userProfile, ...profile } : profile as UserProfile,
    }));
  },

  // 프로필 이미지 업데이트
  updateProfileImage: (imageUri: string) => {
    set((state) => ({
      userProfile: state.userProfile ? { ...state.userProfile, profileImage: imageUri } : null,
    }));
  },

  // authStore의 사용자 정보로 프로필 초기화
  initializeUserProfile: (authUser: { id: string; email: string; userType: 'sports_fan' | 'business' }) => {
    const userProfile = createUserProfileFromAuth(authUser);
    set({ userProfile });
  },

  // 사용자 프로필 초기화 (로그아웃 시 사용)
  resetUserProfile: () => {
    set({ userProfile: null });
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

  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
