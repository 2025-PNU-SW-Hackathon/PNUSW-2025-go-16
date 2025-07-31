import { create } from 'zustand';

// 사용자 등급 타입
type UserGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

// 사용자 타입 정의
interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  bio: string;
  userType: 'sports_fan' | 'business';
  profileImage?: string;
  // 마이페이지 전용 정보들
  grade: UserGrade;
  progressToNextGrade: number;
  coupons: number;
  participatedMatches: number;
  writtenReviews: number;
  preferredSports: string[];
}

// 인증 스토어 타입 정의
interface AuthState {
  // 상태
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  
  // 액션
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
}

// 초기 사용자 데이터
const initialUser: User = {
  id: '1',
  email: 'ptw0414@naver.com',
  name: '김서연',
  phone: '010-1234-5678',
  birthDate: '1995년 3월 15일',
  gender: 'female',
  bio: '안녕하세요! 새로운 사람들과의 만남을 좋아하는 김서연입니다. 다양한 스포츠를 좋아하고 야구를 특히 좋아해요. 함께 즐거운 시간을 보낼 수 있는 분들과 만나고 싶습니다!',
  userType: 'sports_fan',
  profileImage: undefined,
  grade: 'GOLD',
  progressToNextGrade: 75,
  coupons: 5,
  participatedMatches: 27,
  writtenReviews: 23,
  preferredSports: ['축구', '야구', '농구'],
};

// 인증 스토어 생성
export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  isLoggedIn: true, // 개발용으로 로그인 상태로 설정
  user: initialUser, // 초기 사용자 데이터로 설정
  isLoading: false,
  
  // 로그인 액션
  login: (userData: User) => {
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
  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },
})); 