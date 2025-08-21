import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { COLORS } from '@/constants/colors';
import MenuItem from '@/components/my/MenuItem';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import SettingSection from '@/components/business/SettingSection';
import StoreInfoCard from '@/components/business/StoreInfoCard';
import MinReservationModal from '@/components/business/MinReservationModal';
import ReservationDepositModal from '@/components/business/ReservationDepositModal';
import LogoutConfirmModal from '@/components/business/LogoutConfirmModal';
import WithdrawConfirmModal from '@/components/business/WithdrawConfirmModal';
import { useAuthStore } from '@/store/authStore';
import { useMyStore } from '@/store/myStore';
import { useStoreInfo } from '@/hooks/queries/useUserQueries';
import { useUpdateStoreBasicInfo, useUpdateNotificationSettings, useUpdateReservationSettings, useReservationSettings, useDeleteAccount } from '@/hooks/queries/useUserQueries';
import Toast from '@/components/common/Toast';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreBasicInfo'>;

export default function SettingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { logout: authLogout } = useAuthStore();
  const { resetUserProfile } = useMyStore();
  
  // API 훅 사용
  const { data: storeInfoData, isLoading: isStoreInfoLoading, refetch: refetchStoreInfo } = useStoreInfo();
  const { data: reservationSettingsData, refetch: refetchReservationSettings } = useReservationSettings();
  const { mutate: updateStoreBasicInfo, isPending: isUpdating } = useUpdateStoreBasicInfo();
  const { mutate: updateNotificationSettings, isSuccess: isNotificationSettingsUpdated, isError: isNotificationSettingsError } = useUpdateNotificationSettings();
  const { mutate: updateReservationSettings, isSuccess: isReservationSettingsUpdated, isError: isReservationSettingsError } = useUpdateReservationSettings();
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  // 새로고침 함수
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchStoreInfo(),
        refetchReservationSettings()
      ]);
      console.log('🔄 [SettingScreen] 새로고침 완료');
    } catch (error) {
      console.error('❌ [SettingScreen] 새로고침 실패:', error);
    }
  };
  
  // API 호출 성공/실패 콜백 설정
  useEffect(() => {
    if (isNotificationSettingsUpdated) {
      showSuccessMessage('알림 설정이 업데이트되었습니다.');
    }
    if (isNotificationSettingsError) {
      showErrorMessage('알림 설정 업데이트에 실패했습니다.');
    }
  }, [isNotificationSettingsUpdated, isNotificationSettingsError]);

  // 예약 설정 수정 성공/실패 처리
  useEffect(() => {
    if (isReservationSettingsUpdated) {
      console.log('✅ [SettingScreen] 예약 설정 수정 성공!');
      setToastMessage('예약 설정이 성공적으로 저장되었습니다!');
      setToastType('success');
      setShowToast(true);
      
      // 데이터 새로고침
      handleRefresh();
    }
  }, [isReservationSettingsUpdated]);

  useEffect(() => {
    if (isReservationSettingsError) {
      console.log('❌ [SettingScreen] 예약 설정 수정 실패!');
      setToastMessage('예약 설정 저장에 실패했습니다.');
      setToastType('error');
      setShowToast(true);
    }
  }, [isReservationSettingsError]);
  
  // 최소 예약 인원수 모달 관련
  const [showMinReservationModal, setShowMinReservationModal] = useState(false);
  const [minReservationCapacity, setMinReservationCapacity] = useState(4);

  // 최소 예약 인원수 저장
  const handleMinReservationSave = (newCapacity: number) => {
    console.log('🔧 [SettingScreen] 최소 예약 인원수 변경:', newCapacity);
    
    // API 호출
    updateReservationSettings({
      min_participants: newCapacity,
      // 기존 설정 유지
      deposit_amount: reservationDeposit,
      available_times: storeInfoData?.data?.reservation_settings?.available_times || []
    });
    
    setMinReservationCapacity(newCapacity);
    setShowMinReservationModal(false);
  };

  // 예약금 모달 관련
  const [showReservationDepositModal, setShowReservationDepositModal] = useState(false);
  const [reservationDeposit, setReservationDeposit] = useState(1000);



  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Toast 메시지 상태
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);
  
  // API에서 가져온 데이터로 상태 초기화
  const [notificationSettings, setNotificationSettings] = useState({
    reservation: true,
    payment: true,
    system: true,
    marketing: false,
  });

  // API 데이터로 상태 업데이트
  useEffect(() => {
    if (storeInfoData?.data?.reservation_settings) {
      const settings = storeInfoData.data.reservation_settings;
      if (settings.deposit_amount) {
        setReservationDeposit(settings.deposit_amount);
      }
      if (settings.min_participants) {
        setMinReservationCapacity(settings.min_participants);
      }
    }
    
    if (storeInfoData?.data?.notification_settings) {
      const notifSettings = storeInfoData.data.notification_settings;
      setNotificationSettings({
        reservation: notifSettings.reservation_alerts ?? true,
        payment: notifSettings.payment_alerts ?? true,
        system: notifSettings.system_alerts ?? true,
        marketing: notifSettings.marketing_alerts ?? false,
      });
    }
  }, [storeInfoData]);

  // 예약 설정 데이터로 상태 업데이트
  useEffect(() => {
    if (reservationSettingsData?.success && reservationSettingsData?.data) {
      const settings = reservationSettingsData.data;
      console.log('🔍 [SettingScreen] 예약 설정 조회 성공:', settings);
      
      if (settings.min_participants) {
        setMinReservationCapacity(settings.min_participants);
        console.log('🔍 [SettingScreen] 최소 인원수 설정:', settings.min_participants);
      }
      
      if (settings.deposit_amount) {
        setReservationDeposit(settings.deposit_amount);
        console.log('🔍 [SettingScreen] 예약금 설정:', settings.deposit_amount);
      }
    }
  }, [reservationSettingsData]);

  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    const newValue = !notificationSettings[key];
    setNotificationSettings(prev => ({
      ...prev,
      [key]: newValue,
    }));
    
    // API로 알림 설정 업데이트
    if (storeInfoData?.data?.store_info) {
      const currentSettings = storeInfoData.data.notification_settings || {};
      const updatedSettings = {
        reservation_alerts: key === 'reservation' ? newValue : currentSettings.reservation_alerts ?? true,
        payment_alerts: key === 'payment' ? newValue : currentSettings.payment_alerts ?? true,
        system_alerts: key === 'system' ? newValue : currentSettings.system_alerts ?? true,
        marketing_alerts: key === 'marketing' ? newValue : currentSettings.marketing_alerts ?? false,
      };
      
      updateNotificationSettings(updatedSettings);
    }
  };

  const handleReservationDepositSave = (newDeposit: number) => {
    console.log('🔧 [SettingScreen] 예약금 변경:', newDeposit);
    
    // API 호출
    updateReservationSettings({
      min_participants: minReservationCapacity,
      deposit_amount: newDeposit,
      // 기존 설정 유지
      available_times: storeInfoData?.data?.reservation_settings?.available_times || []
    });
    
    setReservationDeposit(newDeposit);
    setShowReservationDepositModal(false);
  };

  // 성공/실패 메시지 표시
  const showSuccessMessage = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorMessage = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    // 로그아웃 실행
    console.log('로그아웃 실행');
    
    // myStore의 사용자 정보 초기화
    resetUserProfile();
    
    // authStore의 로그아웃 실행
    authLogout();
    
    // 모달 닫기
    setShowLogoutModal(false);
    
    // 첫 화면(Onboarding)으로 이동
    // RootNavigator에서 isLoggedIn이 false일 때 자동으로 Onboarding 화면으로 이동됨
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
    try {
      console.log('🚀 [사장님 회원탈퇴] handleConfirmWithdraw 시작');
      setShowWithdrawModal(false);
      
      // 회원 탈퇴 API 호출
      await deleteAccount();
      
      console.log('✅ [사장님 회원탈퇴] API 호출 성공');
      // useDeleteAccount에서 자동으로 로그아웃되고 로그인 전 화면으로 이동됨
      
    } catch (error) {
      console.error('❌ [사장님 회원탈퇴] API 호출 실패:', error);
      // 에러 발생 시 모달 다시 표시
      setShowWithdrawModal(true);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 pt-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isStoreInfoLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* 매장 정보 카드 */}
        {storeInfoData?.data?.store_info ? (
          <StoreInfoCard
            storeName={storeInfoData.data.store_info.store_name || "가게명"}
            address={storeInfoData.data.store_info.address_main || "주소"}
            businessNumber={storeInfoData.data.store_info.business_reg_no || "사업자번호"}
            iconName="home"
            iconColor="#f97316"
          />
        ) : (
          <StoreInfoCard
            storeName="로딩 중..."
            address="로딩 중..."
            businessNumber="로딩 중..."
            iconName="home"
            iconColor="#f97316"
          />
        )}

        {/* 매장 정보 관리 섹션 */}
        <SettingSection title="매장 정보 관리">
          <MenuItem
            title="가게 기본 정보"
            icon="file-text"
            iconColor="#3B82F6"
            onPress={() => navigation.navigate('StoreBasicInfo')}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />
          
          <MenuItem
            title="가게 상세 정보"
            subtitle="매장 소개, 주요 메뉴, 편의시설, 매장 사진"
            icon="info"
            iconColor="#10B981"
            onPress={() => navigation.navigate('StoreDetailInfo')}
            className="mb-0 border-2 border-t-0 border-mainGray"
          />
          
          <MenuItem
            title="시청 가능 스포츠 등록"
            icon="tv"
            iconColor="#8B5CF6"
            onPress={() => navigation.navigate('SportsRegistration')}
            className="mb-0 border-2 border-t-0 border-mainGray"
          />
          
          <MenuItem
            title="영업 시간 설정"
            icon="clock"
            iconColor="#F59E0B"
            onPress={() => navigation.navigate('BusinessHours')}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          />
        </SettingSection>

        {/* 예약 설정 섹션 */}
        <SettingSection title="예약 설정">
          <MenuItem
            title="예약 최소 인원수 설정"
            subtitle={`현재: 최소 ${minReservationCapacity}명`}
            icon="users"
            iconColor="#EF4444"
            onPress={() => setShowMinReservationModal(true)}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />
          
          <MenuItem
            title="예약금 설정"
            subtitle={`현재: ${reservationDeposit.toLocaleString()}원`}
            icon="dollar-sign"
            iconColor="#10B981"
            onPress={() => setShowReservationDepositModal(true)}
            className="mb-0 border-2 border-t-0 border-mainGray"
          />
          
          <MenuItem
            title="예약 가능 시간대 설정"
            icon="calendar"
            iconColor="#3B82F6"
            onPress={() => navigation.navigate('ReservationTime')}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          />
        </SettingSection>

        {/* 알림 설정 섹션 */}
        <SettingSection title="알림 설정">
          <MenuItem
            title="예약 알림"
            icon="calendar"
            iconColor="#3B82F6"
            onPress={() => {}}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
            rightComponent={
              <ToggleSwitch 
                value={notificationSettings.reservation} 
                onValueChange={() => handleToggleNotification('reservation')} 
              />
            }
          />
          
          <MenuItem
            title="결제 알림"
            icon="dollar-sign"
            iconColor="#10B981"
            onPress={() => {}}
            className="mb-0 border-2 border-t-0 border-mainGray"
            rightComponent={
              <ToggleSwitch 
                value={notificationSettings.payment} 
                onValueChange={() => handleToggleNotification('payment')} 
              />
            }
          />
          
          <MenuItem
            title="시스템 알림"
            icon="bell"
            iconColor="#8B5CF6"
            onPress={() => {}}
            className="mb-0 border-2 border-t-0 border-mainGray"
            rightComponent={
              <ToggleSwitch 
                value={notificationSettings.system} 
                onValueChange={() => handleToggleNotification('system')} 
              />
            }
          />
          
          <MenuItem
            title="마케팅 알림"
            icon="mail"
            iconColor="#F59E0B"
            onPress={() => {}}
            className="mb-0 rounded-b-2xl border-2 border-t-0 border-mainGray"
            rightComponent={
              <ToggleSwitch 
                value={notificationSettings.marketing} 
                onValueChange={() => handleToggleNotification('marketing')} 
              />
            }
          />
        </SettingSection>

        {/* 계정 관리 섹션 */}
        <SettingSection title="계정 관리">
          <MenuItem
            title="사업자 정보 수정"
            icon="file-text"
            iconColor="#8B5CF6"
            onPress={() => navigation.navigate('BusinessInfoEdit', { 
              isSignup: false 
            })}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />
          
          <MenuItem
            title="비밀번호 변경"
            icon="lock"
            iconColor="#8B5CF6"
            onPress={() => navigation.navigate('ChangePassword')}
            className="mb-0 border-2 border-t-0 border-mainGray"
          />
          
          <MenuItem
            title="로그아웃"
            icon="log-out"
            iconColor="#6B7280"
            onPress={handleLogout}
            className="mb-0 border-2 border-t-0 border-mainGray"
          />
          
          <MenuItem
            title={isDeletingAccount ? "탈퇴 중..." : "회원 탈퇴"}
            icon="user-x"
            iconColor="#EF4444"
            onPress={isDeletingAccount ? () => {} : handleWithdraw}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
            rightComponent={
              <Text className={`font-medium ${isDeletingAccount ? 'text-gray-300' : 'text-red-500'}`}>
                {isDeletingAccount ? '탈퇴 중...' : '회원 탈퇴'}
              </Text>
            }
          />
        </SettingSection>

        {/* 결제 정보 섹션 */}
        <SettingSection title="결제 정보">
          <MenuItem
            title="정산 계좌 관리"
            icon="credit-card"
            iconColor="#10B981"
            onPress={() => console.log('정산 계좌 관리')}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />
          
          <MenuItem
            title="정산 내역 조회"
            icon="file-text"
            iconColor="#3B82F6"
            onPress={() => console.log('정산 내역 조회')}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          />
        </SettingSection>

        {/* 앱 설정 섹션 */}
        <SettingSection title="앱 설정" className="mb-8">
          <MenuItem
            title="앱 버전 정보"
            subtitle="v2.1.0"
            icon="info"
            iconColor="#6B7280"
            onPress={() => console.log('앱 버전 정보')}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />
          
          <MenuItem
            title="이용약관 및 정책"
            icon="file-text"
            iconColor="#8B5CF6"
            onPress={() => console.log('이용약관 및 정책')}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          />
        </SettingSection>
      </ScrollView>

      <MinReservationModal
        visible={showMinReservationModal}
        currentMinCapacity={minReservationCapacity}
        onClose={() => setShowMinReservationModal(false)}
        onSave={handleMinReservationSave}
      />
      <ReservationDepositModal
        visible={showReservationDepositModal}
        currentDeposit={reservationDeposit}
        onClose={() => setShowReservationDepositModal(false)}
        onSave={handleReservationDepositSave}
      />
      <LogoutConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
      <WithdrawConfirmModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={handleConfirmWithdraw}
      />
             <Toast
         message={toastMessage}
         type={toastType}
         visible={showToast}
         onHide={hideToast}
       />
    </View>
  );
}
