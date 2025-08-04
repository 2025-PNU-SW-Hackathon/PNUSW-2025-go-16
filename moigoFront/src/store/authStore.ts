import { create } from 'zustand';
import type { PasswordChangeForm, PasswordValidation } from '@/types/reservation';

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
  token: string | null;
  selectedUserType: 'sports_fan' | 'business' | null; // Onboarding에서 선택한 사용자 타입
  
  // 액션
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  setUserType: (userType: 'sports_fan' | 'business') => void; // 사용자 타입 설정
  changePassword: (passwordData: PasswordChangeForm) => Promise<boolean>;
  validatePassword: (password: string) => PasswordValidation;
}

// 인증 스토어 생성
export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태 - 로그아웃 상태로 시작
  isLoggedIn: false,
  user: null,
  isLoading: false,
  token: null,
  selectedUserType: null,
  
  // 로그인 액션
  login: (userData: AuthUser, token: string) => {
    set({
      isLoggedIn: true,
      user: userData,
      token: token,
      isLoading: false,
    });
  },
  
  // 로그아웃 액션
  logout: () => {
    set({
      isLoggedIn: false,
      user: null,
      token: null,
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

  // 사용자 타입 설정 (Onboarding에서 사용)
  setUserType: (userType: 'sports_fan' | 'business') => {
    set({ selectedUserType: userType });
  },
  
  // 비밀번호 변경
  changePassword: async (passwordData: PasswordChangeForm) => {
    const { token } = get();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }
    
    // 실제로는 API 호출이 들어갈 자리
    // POST /api/auth/change-password
    // Authorization: Bearer {token}
    // {
    //   currentPassword: passwordData.currentPassword,
    //   newPassword: passwordData.newPassword
    // }
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 개발용: 현재 비밀번호가 'password123'이 아니면 실패
        if (passwordData.currentPassword !== 'password123') {
          reject(new Error('현재 비밀번호가 일치하지 않습니다.'));
        } else {
          // 성공 시 새로운 토큰을 받아서 업데이트
          const newToken = 'new-jwt-token-' + Date.now();
          set({ token: newToken });
          resolve(true);
        }
      }, 1000);
    });
  },
  
  // 비밀번호 유효성 검사
  validatePassword: (password: string): PasswordValidation => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('8자 이상 입력해주세요.');
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
      errors.push('영문/숫자/특수문자 조합으로 입력해주세요.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
}));
