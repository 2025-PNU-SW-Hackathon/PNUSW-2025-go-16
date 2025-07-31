import { create } from 'zustand';

// 사용자 등급 타입
type UserGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

// 사용자 정보 타입
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  bio: string;
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
  userProfile: UserProfile;
  settings: MyPageSettings;
  isLoading: boolean;
  
  // 액션
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateProfileImage: (imageUri: string) => void;
  toggleNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

// 초기 사용자 프로필 데이터
const initialUserProfile: UserProfile = {
  id: '1',
  name: 'ptw0414@naver.com', // 로그인 아이디로 초기화
  email: 'ptw0414@naver.com', // 로그인 아이디로 초기화
  phone: '',
  birthDate: '',
  gender: 'female',
  bio: '',
  profileImage: undefined,
  grade: 'BRONZE',
  progressToNextGrade: 0,
  coupons: 0,
  participatedMatches: 0,
  writtenReviews: 0,
  preferredSports: [
    '축구', '야구', '농구', '격투기' ,'게임'
  ],
};

// 초기 마이페이지 설정
const initialSettings: MyPageSettings = {
  notifications: true,
  appVersion: 'v2.1.0',
};

// MyScreen 스토어 생성
export const useMyStore = create<MyState>((set) => ({
  // 초기 상태
  userProfile: initialUserProfile,
  settings: initialSettings,
  isLoading: false,
  
  // 사용자 프로필 업데이트
  updateUserProfile: (profile) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile },
    }));
  },
  
  // 프로필 이미지 업데이트
  updateProfileImage: (imageUri) => {
    set((state) => ({
      userProfile: { ...state.userProfile, profileImage: imageUri },
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
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 