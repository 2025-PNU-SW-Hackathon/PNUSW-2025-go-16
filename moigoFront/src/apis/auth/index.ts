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
