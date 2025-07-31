import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';

export function useMyInfoSetting() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    accountSettings,
    privacySettings,
    notificationSettings,
    appSettings,
    otherSettings,
    customerSupport,
    isLoading,
    updateAccountSettings,
    updatePrivacySettings,
    updateNotificationSettings,
    updateAppSettings,
    updateOtherSettings,
    updateCustomerSupport,
    logout: settingsLogout,
    withdraw: settingsWithdraw,
    setLoading,
  } = useSettingsStore();

  const { logout: authLogout } = useAuthStore();

  // 프로필 관리
  const handleProfileManagement = () => {
    navigation.navigate('Profile');
    console.log('프로필 관리 페이지로 이동');
  };

  // 계정 보안
  const handleAccountSecurity = () => {
    console.log('계정 보안 페이지로 이동');
  };

  // 위치정보 설정 토글
  const handleLocationInfoToggle = () => {
    updatePrivacySettings({ locationInfo: !privacySettings.locationInfo });
  };

  // 데이터 관리
  const handleDataManagement = () => {
    console.log('데이터 관리 페이지로 이동');
  };

  // 푸시 알림 토글
  const handlePushNotificationsToggle = () => {
    updateNotificationSettings({ pushNotifications: !notificationSettings.pushNotifications });
  };

  // 이메일 알림 토글
  const handleEmailNotificationsToggle = () => {
    updateNotificationSettings({ emailNotifications: !notificationSettings.emailNotifications });
  };

  // 마케팅 수신 동의 토글
  const handleMarketingConsentToggle = () => {
    updateNotificationSettings({ marketingConsent: !notificationSettings.marketingConsent });
  };

  // 언어 설정
  const handleLanguageSettings = () => {
    console.log('언어 설정 페이지로 이동');
  };

  // 테마 설정
  const handleThemeSettings = () => {
    console.log('테마 설정 페이지로 이동');
  };

  // 폰트 크기 설정
  const handleFontSizeSettings = () => {
    console.log('폰트 크기 설정 페이지로 이동');
  };

  // 앱 정보
  const handleAppInformation = () => {
    console.log('앱 정보 페이지로 이동');
  };

  // 이용약관
  const handleTermsOfService = () => {
    console.log('이용약관 페이지로 이동');
  };

  // 개인정보처리방침
  const handlePrivacyPolicy = () => {
    console.log('개인정보처리방침 페이지로 이동');
  };

  // 오픈소스 라이선스
  const handleOpenSourceLicense = () => {
    console.log('오픈소스 라이선스 페이지로 이동');
  };

  // 고객센터
  const handleCustomerCenter = () => {
    console.log('고객센터 페이지로 이동');
  };

  // 자주 묻는 질문
  const handleFAQ = () => {
    console.log('자주 묻는 질문 페이지로 이동');
  };

  // 의견 보내기
  const handleSendFeedback = () => {
    console.log('의견 보내기 페이지로 이동');
  };

  // 로그아웃
  const handleLogout = () => {
    setLoading(true);
    authLogout();
    setLoading(false);
  };

  // 회원탈퇴
  const handleWithdraw = () => {
    setLoading(true);
    authLogout();
    setLoading(false);
  };

  return {
    // 상태
    accountSettings,
    privacySettings,
    notificationSettings,
    appSettings,
    otherSettings,
    customerSupport,
    isLoading,
    
    // 액션
    handleProfileManagement,
    handleAccountSecurity,
    handleLocationInfoToggle,
    handleDataManagement,
    handlePushNotificationsToggle,
    handleEmailNotificationsToggle,
    handleMarketingConsentToggle,
    handleLanguageSettings,
    handleThemeSettings,
    handleFontSizeSettings,
    handleAppInformation,
    handleTermsOfService,
    handlePrivacyPolicy,
    handleOpenSourceLicense,
    handleCustomerCenter,
    handleFAQ,
    handleSendFeedback,
    handleLogout,
    handleWithdraw,
  };
} 