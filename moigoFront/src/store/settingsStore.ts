import { create } from 'zustand';

// 설정 타입들
interface AccountSettings {
  profileManagement: boolean;
  accountSecurity: boolean;
}

interface PrivacySettings {
  locationInfo: boolean;
  dataManagement: boolean;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  marketingConsent: boolean;
}

interface AppSettings {
  language: string;
  theme: string;
  fontSize: string;
}

interface OtherSettings {
  appVersion: string;
  termsOfService: boolean;
  privacyPolicy: boolean;
  openSourceLicense: boolean;
}

interface CustomerSupport {
  customerCenter: boolean;
  faq: boolean;
  sendFeedback: boolean;
}

// MyInfoSetting 스토어 타입 정의
interface SettingsState {
  // 상태
  accountSettings: AccountSettings;
  privacySettings: PrivacySettings;
  notificationSettings: NotificationSettings;
  appSettings: AppSettings;
  otherSettings: OtherSettings;
  customerSupport: CustomerSupport;
  isLoading: boolean;
  
  // 액션
  updateAccountSettings: (settings: Partial<AccountSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updateOtherSettings: (settings: Partial<OtherSettings>) => void;
  updateCustomerSupport: (settings: Partial<CustomerSupport>) => void;
  logout: () => void;
  withdraw: () => void;
  setLoading: (loading: boolean) => void;
}

// 초기 설정 데이터
const initialAccountSettings: AccountSettings = {
  profileManagement: true,
  accountSecurity: true,
};

const initialPrivacySettings: PrivacySettings = {
  locationInfo: true,
  dataManagement: true,
};

const initialNotificationSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: false,
  marketingConsent: true,
};

const initialAppSettings: AppSettings = {
  language: '한국어',
  theme: '라이트 모드',
  fontSize: '보통',
};

const initialOtherSettings: OtherSettings = {
  appVersion: 'v2.1.0',
  termsOfService: true,
  privacyPolicy: true,
  openSourceLicense: true,
};

const initialCustomerSupport: CustomerSupport = {
  customerCenter: true,
  faq: true,
  sendFeedback: true,
};

// MyInfoSetting 스토어 생성
export const useSettingsStore = create<SettingsState>((set) => ({
  // 초기 상태
  accountSettings: initialAccountSettings,
  privacySettings: initialPrivacySettings,
  notificationSettings: initialNotificationSettings,
  appSettings: initialAppSettings,
  otherSettings: initialOtherSettings,
  customerSupport: initialCustomerSupport,
  isLoading: false,
  
  // 계정 설정 업데이트
  updateAccountSettings: (settings: Partial<AccountSettings>) => {
    set((state) => ({
      accountSettings: { ...state.accountSettings, ...settings },
    }));
  },
  
  // 개인정보 설정 업데이트
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => {
    set((state) => ({
      privacySettings: { ...state.privacySettings, ...settings },
    }));
  },
  
  // 알림 설정 업데이트
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings },
    }));
  },
  
  // 앱 설정 업데이트
  updateAppSettings: (settings: Partial<AppSettings>) => {
    set((state) => ({
      appSettings: { ...state.appSettings, ...settings },
    }));
  },
  
  // 기타 설정 업데이트
  updateOtherSettings: (settings: Partial<OtherSettings>) => {
    set((state) => ({
      otherSettings: { ...state.otherSettings, ...settings },
    }));
  },
  
  // 고객지원 설정 업데이트
  updateCustomerSupport: (settings: Partial<CustomerSupport>) => {
    set((state) => ({
      customerSupport: { ...state.customerSupport, ...settings },
    }));
  },
  
  // 로그아웃
  logout: () => {
    set({
      accountSettings: initialAccountSettings,
      privacySettings: initialPrivacySettings,
      notificationSettings: initialNotificationSettings,
      appSettings: initialAppSettings,
      otherSettings: initialOtherSettings,
      customerSupport: initialCustomerSupport,
      isLoading: false,
    });
  },
  
  // 회원탈퇴
  withdraw: () => {
    set({
      accountSettings: initialAccountSettings,
      privacySettings: initialPrivacySettings,
      notificationSettings: initialNotificationSettings,
      appSettings: initialAppSettings,
      otherSettings: initialOtherSettings,
      customerSupport: initialCustomerSupport,
      isLoading: false,
    });
  },
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 