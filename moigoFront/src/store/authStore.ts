import { create } from 'zustand';
import { useMyStore } from './myStore';

// 로그인 사용자 타입 정의
interface AuthUser {
  id: string;
  email: string;
  userType: 'sports_fan' | 'business';
}

// 인증 스토어 타입 정의
interface AuthState {
  // 상태
  isLoggedIn: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  
  // 액션
  login: (userData: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<AuthUser>) => void;
}

// 초기 인증 사용자 데이터
const initialAuthUser: AuthUser = {
  id: '1',
  email: 'ptw0414@naver.com',
  userType: 'sports_fan',
};

// 인증 스토어 생성
export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태
  isLoggedIn: true, // 개발용으로 로그인 상태로 설정
  user: initialAuthUser, // 초기 사용자 데이터로 설정
  isLoading: false,
  
  // 로그인 액션
  login: (userData: AuthUser) => {
    set({
      isLoggedIn: true,
      user: userData,
      isLoading: false,
    });
    
    // myStore의 userProfile도 함께 업데이트
    const { updateUserProfile } = useMyStore.getState();
    updateUserProfile({
      id: userData.id,
      name: userData.email, // 로그인 아이디를 이름으로 설정
      email: userData.email, // 로그인 아이디를 이메일로 설정
    });
  },
  
  // 로그아웃 액션
  logout: () => {
    set({
      isLoggedIn: false,
      user: null,
      isLoading: false,
    });
  },
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  // 사용자 정보 업데이트
  updateUser: (userData: Partial<AuthUser>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },
})); 