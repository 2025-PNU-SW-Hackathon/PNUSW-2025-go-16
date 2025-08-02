import { create } from 'zustand';

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

// 인증 스토어 생성
export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태 - 로그아웃 상태로 시작
  isLoggedIn: false,
  user: null,
  isLoading: false,

  // 로그인 액션
  login: (userData: AuthUser) => {
    set({
      isLoggedIn: true,
      user: userData,
      isLoading: false,
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
