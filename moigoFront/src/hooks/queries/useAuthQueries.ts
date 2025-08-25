import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePushNotifications } from '../usePushNotifications';
import { socketManager } from '../../utils/socketUtils';
import { registerPushToken } from '../../apis/users';

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
  const { login: authLogin } = useAuthStore();
  const { registerForPushNotificationsAsync } = usePushNotifications();
  
  return useMutation({
    mutationFn: async (data: Omit<StoreLoginRequestDTO, 'expo_token'>) => {
              // expo token 가져오기 (선택적)
        let expoToken = null;
        try {
          expoToken = await registerForPushNotificationsAsync();
        } catch (error) {
          console.log('⚠️ 푸시 토큰 등록 실패 (시뮬레이터에서는 정상):', error instanceof Error ? error.message : String(error));
        }
        
        // expo token을 포함한 로그인 요청 (토큰이 없어도 진행)
        const loginData: StoreLoginRequestDTO = {
          ...data,
          ...(expoToken && { expo_token: expoToken }),
        };
        
        return storeLogin(loginData);
    },
    onSuccess: async (data: StoreLoginResponseDTO) => {
      // 로그인 성공 시 액세스 토큰 설정
      if (data.data.token) {
        setAccessToken(`Bearer ${data.data.token}`);
      }
      
      // 사용자 정보를 store에 저장
      if (data.data.store) {
        // authStore 업데이트
        authLogin({
          id: data.data.store.store_id,
          name: data.data.store.store_name,
          email: '', // 사장님은 이메일 정보가 없을 수 있음
          phoneNumber: '', // 사장님은 전화번호 정보가 없을 수 있음
          gender: 0, // 사장님은 성별 정보가 없음
          userType: 'business',
        }, data.data.token);
        
        // myStore 업데이트
        updateUserProfile({
          id: data.data.store.store_id,
          name: data.data.store.store_name,
          email: '', // 사장님은 이메일 정보가 없을 수 있음
          gender: 'male', // 기본값
          grade: 'STORE_OWNER', // 사장님 등급
          progressToNextGrade: 0,
          coupons: 0,
          participatedMatches: 0,
          writtenReviews: 0,
          preferredSports: [],
        });

        // 푸시 토큰 서버 등록 (사장님 로그인 성공 후)
        try {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await registerPushToken(pushToken);
            console.log('✅ 사장님 로그인 후 푸시 토큰이 서버에 등록되었습니다');
          }
        } catch (tokenError) {
          console.log('⚠️ 사장님 로그인 후 푸시 토큰 등록 실패 (시뮬레이터에서는 정상):', tokenError instanceof Error ? tokenError.message : String(tokenError));
        }
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
  const { login: authLogin } = useAuthStore();
  const { registerForPushNotificationsAsync } = usePushNotifications();
  
  return useMutation({
    mutationFn: async (data: Omit<LoginRequestDTO, 'expo_token'>) => {
      // expo token 가져오기 (선택적)
      let expoToken = null;
              try {
          expoToken = await registerForPushNotificationsAsync();
        } catch (error) {
          console.log('⚠️ 푸시 토큰 등록 실패 (시뮬레이터에서는 정상):', error instanceof Error ? error.message : String(error));
        }
      
      // expo token을 포함한 로그인 요청 (토큰이 없어도 진행)
      const loginData: LoginRequestDTO = {
        ...data,
        ...(expoToken && { expo_token: expoToken }),
      };
      
      return login(loginData);
    },
    onSuccess: async (data:LoginResponseDTO) => {
      // 로그인 성공 시 액세스 토큰 설정
      if (data.data.token) {
        setAccessToken(`Bearer ${data.data.token}`);
      }
      
      // 사용자 정보를 store에 저장
      if (data.data.user) {
        // authStore 업데이트
        authLogin({
          id: data.data.user.user_id,
          name: data.data.user.user_name,
          email: '', // 서버에서 제공하지 않음
          phoneNumber: '', // 서버에서 제공하지 않음
          gender: 0, // 기본값
          userType: 'sports_fan',
        }, data.data.token);
        
        // myStore 업데이트
        updateUserProfile({
          id: data.data.user.user_id,
          name: data.data.user.user_name,
          email: '', // 서버에서 제공하지 않음
          gender: 'male', // 기본값
          grade: 'BRONZE', // 기본값
          progressToNextGrade: 0,
          coupons: 0,
          participatedMatches: 0,
          writtenReviews: 0,
          preferredSports: [],
        });

        // 푸시 토큰 서버 등록 (로그인 성공 후)
        try {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await registerPushToken(pushToken);
            console.log('✅ 로그인 후 푸시 토큰이 서버에 등록되었습니다');
          }
        } catch (tokenError) {
          console.log('⚠️ 로그인 후 푸시 토큰 등록 실패:', tokenError);
        }
      }
    },
    onError: (error) => {
      console.error('로그인 실패:', error);
    },
  });
};

// POST /auth/logout - 로그아웃 훅
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { resetUserProfile } = useMyStore();
  const { logout: authLogout } = useAuthStore();
  const { logout: settingsLogout } = useSettingsStore();
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log('🧹 [로그아웃] 데이터 초기화 시작');
      
      // 1. 액세스 토큰 제거
      setAccessToken(null);
      
      // 2. 소켓 연결 완전 해제
      console.log('📡 [로그아웃] 소켓 연결 해제');
      socketManager.disconnect();
      
      // 3. React Query 캐시 완전 초기화
      console.log('🗑️ [로그아웃] React Query 캐시 초기화');
      queryClient.clear();
      
      // 4. 개별 쿼리 무효화 (추가 보장)
      queryClient.invalidateQueries();
      
      // 5. 모든 Store 상태 초기화
      console.log('👤 [로그아웃] 모든 Store 상태 초기화');
      resetUserProfile();     // myStore 초기화
      authLogout();          // authStore 초기화
      settingsLogout();      // settingsStore 초기화
      
      console.log('✅ [로그아웃] 완전한 데이터 초기화 완료');
    },
    onError: (error) => {
      console.error('❌ 로그아웃 실패:', error);
      
      // 실패해도 클라이언트 측 정리는 수행
      console.log('⚠️ [로그아웃] 서버 요청 실패, 클라이언트 데이터만 초기화');
      setAccessToken(null);
      socketManager.disconnect();
      queryClient.clear();
      resetUserProfile();
      authLogout();
      settingsLogout();
    },
  });
}; 