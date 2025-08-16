import apiClient from '../apiClient';
import type {
  SignupRequestDTO,
  SignupResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  AuthErrorResponseDTO,
  StoreBasicSignupRequestDTO,
  StoreBasicSignupResponseDTO,
  BusinessRegistrationRequestDTO,
  BusinessRegistrationResponseDTO,
  BusinessRegistrationStatusResponseDTO,
  StoreLoginRequestDTO,
  StoreLoginResponseDTO,
} from '../../types/DTO/auth';

// POST /users/register - 회원가입 (서버 명세서에 맞게 수정)
export const signup = async (
  data: SignupRequestDTO
): Promise<SignupResponseDTO> => {
  const response = await apiClient.post<SignupResponseDTO>(
    '/users/register',
    data
  );
  return response.data;
};

// POST /users/check-duplicate - 사용자 아이디 중복검사
export const checkUserIdDuplicate = async (userId: string): Promise<{ success: boolean; message: string; isDuplicate: boolean }> => {
  try {
    console.log('중복검사 API 호출:', `/users/check-duplicate`, { user_id: userId });
    const response = await apiClient.post('/users/check-duplicate', { user_id: userId });
    console.log('중복검사 API 응답:', response.data);
    return {
      success: true,
      message: response.data.message || '중복검사 완료',
      isDuplicate: response.data.isDuplicate || false
    };
  } catch (error: any) {
    console.error('중복검사 API 에러:', error.response?.status, error.response?.data);
    if (error.response?.status === 409) {
      // 중복된 아이디
      return {
        success: true,
        message: '이미 사용 중인 아이디입니다.',
        isDuplicate: true
      };
    }
    // 서버 에러나 네트워크 에러
    throw error;
  }
};

// POST /users/store/check-duplicate - 사장님 아이디 중복검사
export const checkStoreIdDuplicate = async (storeId: string): Promise<{ success: boolean; message: string; isDuplicate: boolean }> => {
  try {
    console.log('사장님 중복검사 API 호출:', `/users/store/check-duplicate`, { store_id: storeId });
    const response = await apiClient.post('/users/store/check-duplicate', { store_id: storeId });
    console.log('사장님 중복검사 API 응답:', response.data);
    return {
      success: true,
      message: response.data.message || '중복검사 완료',
      isDuplicate: response.data.isDuplicate || false
    };
  } catch (error: any) {
    console.error('사장님 중복검사 API 에러:', error.response?.status, error.response?.data);
    if (error.response?.status === 409) {
      // 중복된 아이디
      return {
        success: true,
        message: '이미 사용 중인 아이디입니다.',
        isDuplicate: true
      };
    }
    // 서버 에러나 네트워크 에러
    throw error;
  }
};

// 회원가입 시 중복검사 후 가입 (일반 사용자)
export const signupWithDuplicateCheck = async (userData: SignupRequestDTO): Promise<SignupResponseDTO> => {
  // 1단계: 아이디 중복 검사
  const duplicateCheck = await checkUserIdDuplicate(userData.user_id);
  
  if (duplicateCheck.isDuplicate) {
    throw new Error('이미 사용 중인 아이디입니다.');
  }
  
  // 2단계: 회원가입 (중복이 아닌 경우에만)
  const response = await apiClient.post<SignupResponseDTO>('/users/register', userData);
  return response.data;
};

// 사장님 회원가입 시 중복검사 후 가입
export const storeSignupWithDuplicateCheck = async (storeData: StoreBasicSignupRequestDTO): Promise<StoreBasicSignupResponseDTO> => {
  // 1단계: 아이디 중복 검사
  const duplicateCheck = await checkStoreIdDuplicate(storeData.store_id);
  
  if (duplicateCheck.isDuplicate) {
    throw new Error('이미 사용 중인 아이디입니다.');
  }
  
  // 2단계: 회원가입 (중복이 아닌 경우에만)
  const response = await apiClient.post<StoreBasicSignupResponseDTO>('/users/store/register/basic', storeData);
  return response.data;
};

// POST /users/store/register/basic - 사장님 기본 회원가입
export const storeBasicSignup = async (
  data: StoreBasicSignupRequestDTO
): Promise<StoreBasicSignupResponseDTO> => {
  console.log('storeBasicSignup API 호출:', data);
  const response = await apiClient.post<StoreBasicSignupResponseDTO>(
    '/users/store/register/basic',
    data
  );
  console.log('storeBasicSignup API 응답:', response);
  return response.data;
};

// POST /users/store/{storeId}/business-registration - 사업자 정보 등록
export const businessRegistration = async (
  storeId: string,
  data: BusinessRegistrationRequestDTO
): Promise<BusinessRegistrationResponseDTO> => {
  const response = await apiClient.post<BusinessRegistrationResponseDTO>(
    `/users/store/${storeId}/business-registration`,
    data
  );
  return response.data;
};

// GET /users/store/{storeId}/business-registration/status - 사업자 등록 상태 확인
export const getBusinessRegistrationStatus = async (
  storeId: string
): Promise<BusinessRegistrationStatusResponseDTO> => {
  const response = await apiClient.get<BusinessRegistrationStatusResponseDTO>(
    `/users/store/${storeId}/business-registration/status`
  );
  return response.data;
};

// POST /users/login - 로그인 (서버 코드에 맞게 수정)
export const login = async (
  data: LoginRequestDTO
): Promise<LoginResponseDTO> => {
  const response = await apiClient.post<LoginResponseDTO>(
    '/users/login',
    data
  );
  return response.data;
};

// POST /users/store/login - 사장님 로그인
export const storeLogin = async (
  data: StoreLoginRequestDTO
): Promise<StoreLoginResponseDTO> => {
  const response = await apiClient.post<StoreLoginResponseDTO>(
    '/users/store/login',
    data
  );
  return response.data;
};

// POST /auth/logout - 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
