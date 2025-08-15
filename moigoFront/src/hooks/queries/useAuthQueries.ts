import { useMutation } from '@tanstack/react-query';
import { 
  signup, 
  login, 
  logout, 
  storeBasicSignup, 
  businessRegistration, 
  getBusinessRegistrationStatus,
  storeLogin 
} from '../../apis/auth';
import type { 
  SignupRequestDTO, 
  LoginRequestDTO,
  LoginResponseDTO,
  StoreBasicSignupRequestDTO,
  BusinessRegistrationRequestDTO,
  StoreLoginRequestDTO,
  StoreLoginResponseDTO
} from '../../types/DTO/auth';
import { setAccessToken } from '../../apis/apiClient';
import { useMyStore } from '../../store/myStore';

// POST /auth/signup - 회원가입 훅
export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequestDTO) => signup(data),
    onError: (error) => {
      console.error('회원가입 실패:', error);
    },
  });
};

// POST /users/store/register/basic - 사장님 기본 회원가입 훅
export const useStoreBasicSignup = () => {
  return useMutation({
    mutationFn: (data: StoreBasicSignupRequestDTO) => storeBasicSignup(data),
    onError: (error) => {
      console.error('사장님 기본 회원가입 실패:', error);
    },
  });
};

// POST /users/store/{storeId}/business-registration - 사업자 정보 등록 훅
export const useBusinessRegistration = () => {
  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: BusinessRegistrationRequestDTO }) =>
      businessRegistration(storeId, data),
    onError: (error) => {
      console.error('사업자 정보 등록 실패:', error);
    },
  });
};

// GET /users/store/{storeId}/business-registration/status - 사업자 등록 상태 확인 훅
export const useBusinessRegistrationStatus = () => {
  return useMutation({
    mutationFn: (storeId: string) => getBusinessRegistrationStatus(storeId),
    onError: (error) => {
      console.error('사업자 등록 상태 확인 실패:', error);
    },
  });
};

// POST /api/v1/users/store/login - 사장님 로그인 훅
export const useStoreLogin = () => {
  const { updateUserProfile } = useMyStore();
  
  return useMutation({
    mutationFn: (data: StoreLoginRequestDTO) => storeLogin(data),
    onSuccess: (data: StoreLoginResponseDTO) => {
      // 로그인 성공 시 액세스 토큰 설정
      if (data.data.token) {
        setAccessToken(`Bearer ${data.data.token}`);
      }
      
      // 사용자 정보를 store에 저장
      if (data.data.store) {
        updateUserProfile({
          id: data.data.store.store_id,
          name: data.data.store.store_name,
          email: '', // 사장님은 이메일 정보가 없을 수 있음
          grade: 'STORE_OWNER', // 사장님 등급
          progressToNextGrade: 0,
          coupons: 0,
          participatedMatches: 0,
          writtenReviews: 0,
          preferredSports: [],
        });
      }
    },
    onError: (error) => {
      console.error('사장님 로그인 실패:', error);
    },
  });
};

// POST /auth/login - 로그인 훅
export const useLogin = () => {
  const { updateUserProfile } = useMyStore();
  
  return useMutation({
    mutationFn: (data: LoginRequestDTO) => login(data),
    onSuccess: (data:LoginResponseDTO) => {
      // 로그인 성공 시 액세스 토큰 설정
      setAccessToken(`Bearer ${data.data.token}`);
      
      // 사용자 정보를 store에 저장
      if (data.data) {
        updateUserProfile({
          id: data.data.user.user_id,
          name: data.data.user.user_name,
          email: data.data.user.user_email,
          grade: 'BRONZE', // 기본값
          progressToNextGrade: 0,
          coupons: 0,
          participatedMatches: 0,
          writtenReviews: 0,
          preferredSports: [],
        });
      }
    },
    onError: (error) => {
      console.error('로그인 실패:', error);
    },
  });
};

// POST /auth/logout - 로그아웃 훅
export const useLogout = () => {
  const { resetUserProfile } = useMyStore();
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 로그아웃 성공 시 액세스 토큰 제거
      setAccessToken(null);
      // 사용자 정보 초기화
      resetUserProfile();
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error);
    },
  });
}; 