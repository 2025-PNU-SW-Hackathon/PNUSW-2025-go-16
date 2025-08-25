import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useMyStore } from '@/store/myStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { useDeleteAccount } from './queries/useUserQueries';
import { useLogout } from './queries/useAuthQueries';

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
  const { resetUserProfile } = useMyStore();
  const deleteAccountMutation = useDeleteAccount();
  const logoutMutation = useLogout();

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

  // 로그아웃 - 완전한 데이터 초기화
  const handleLogout = () => {
    console.log('🚀 [MyInfoSetting] 로그아웃 시작');
    setLoading(true);
    
    // 🆕 React Query 뮤테이션을 사용한 완전한 로그아웃
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        console.log('✅ [MyInfoSetting] 로그아웃 완료');
        setLoading(false);
      },
      onError: (error) => {
        console.error('❌ [MyInfoSetting] 로그아웃 실패:', error);
        setLoading(false);
      }
    });
  };

  // 회원탈퇴
  const handleWithdraw = async () => {
    try {
      console.log('🚀 [회원탈퇴] handleWithdraw 시작');
      setLoading(true);
      console.log('🚀 [회원탈퇴] API 호출 시작');
      await deleteAccountMutation.mutateAsync();
      console.log('✅ [회원탈퇴] API 호출 성공');
      // 회원 탈퇴 성공 시 자동으로 로그아웃되고 로그인 전 화면으로 이동됨
      // useDeleteAccount에서 logout() 호출
    } catch (error) {
      console.error('❌ [회원탈퇴] API 호출 실패:', error);
      setLoading(false);
    }
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
    
    // 회원 탈퇴 상태
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
