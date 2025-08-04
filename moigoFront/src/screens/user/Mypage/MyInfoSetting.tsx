import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMyInfoSetting } from '@/hooks/useMyInfoSetting';
import { COLORS } from '@/constants/colors';

// 컴포넌트들
import SettingsSection from '@/components/settings/SettingsSection';
import MenuItem from '@/components/my/MenuItem';
import ToggleSwitch from '@/components/common/ToggleSwitch';

export default function MyInfoSetting() {
  const {
    accountSettings,
    privacySettings,
    notificationSettings,
    appSettings,
    otherSettings,
    customerSupport,
    isLoading,
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
  } = useMyInfoSetting();

  const handleLogoutPress = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: handleLogout },
    ]);
  };

  const handleWithdrawPress = () => {
    Alert.alert('회원탈퇴', '정말 회원탈퇴 하시겠습니까?\n이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '회원탈퇴', style: 'destructive', onPress: handleWithdraw },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 pt-8">
        {/* 계정 설정 */}
        <SettingsSection title="계정 설정">
          <MenuItem
            title="프로필 관리"
            icon="user"
            iconColor={COLORS.mainOrange}
            onPress={handleProfileManagement}
            className="mx-0"
          />
          <MenuItem
            title="계정 보안"
            icon="shield"
            iconColor="#3B82F6"
            onPress={handleAccountSecurity}
            className="mx-0"
          />
        </SettingsSection>

        {/* 개인정보 보호 */}
        <SettingsSection title="개인정보 보호">
          <MenuItem
            title="위치정보 설정"
            subtitle="매칭 추천을 위한 위치 정보"
            icon="map-pin"
            iconColor="#EF4444"
            rightComponent={
              <ToggleSwitch
                value={privacySettings.locationInfo}
                onValueChange={handleLocationInfoToggle}
              />
            }
            onPress={handleLocationInfoToggle}
            className="mx-0"
          />
          <MenuItem
            title="데이터 관리"
            icon="database"
            iconColor="#F59E0B"
            onPress={handleDataManagement}
            className="mx-0"
          />
        </SettingsSection>

        {/* 알림 설정 */}
        <SettingsSection title="알림 설정">
          <MenuItem
            title="푸시 알림"
            icon="bell"
            iconColor="#3B82F6"
            rightComponent={
              <ToggleSwitch
                value={notificationSettings.pushNotifications}
                onValueChange={handlePushNotificationsToggle}
              />
            }
            onPress={handlePushNotificationsToggle}
            className="mx-0"
          />
          <MenuItem
            title="이메일 알림"
            icon="mail"
            iconColor="#10B981"
            rightComponent={
              <ToggleSwitch
                value={notificationSettings.emailNotifications}
                onValueChange={handleEmailNotificationsToggle}
              />
            }
            onPress={handleEmailNotificationsToggle}
            className="mx-0"
          />
          <MenuItem
            title="마케팅 수신 동의"
            icon="inbox"
            iconColor={COLORS.mainOrange}
            rightComponent={
              <ToggleSwitch
                value={notificationSettings.marketingConsent}
                onValueChange={handleMarketingConsentToggle}
              />
            }
            onPress={handleMarketingConsentToggle}
            className="mx-0"
          />
        </SettingsSection>

        {/* 앱 설정 */}
        <SettingsSection title="앱 설정">
          <MenuItem
            title="언어 설정"
            icon="globe"
            iconColor="#8B5CF6"
            rightComponent={
              <Text className="font-medium text-gray-500">{appSettings.language}</Text>
            }
            onPress={handleLanguageSettings}
            className="mx-0"
          />
          <MenuItem
            title="테마 설정"
            icon="settings"
            iconColor="#EC4899"
            rightComponent={<Text className="font-medium text-gray-500">{appSettings.theme}</Text>}
            onPress={handleThemeSettings}
            className="mx-0"
          />
          <MenuItem
            title="폰트 크기"
            icon="type"
            iconColor="#06B6D4"
            rightComponent={
              <Text className="font-medium text-gray-500">{appSettings.fontSize}</Text>
            }
            onPress={handleFontSizeSettings}
            className="mx-0"
          />
        </SettingsSection>

        {/* 기타 */}
        <SettingsSection title="기타">
          <MenuItem
            title="앱 정보"
            icon="info"
            iconColor="#6B7280"
            rightComponent={
              <Text className="font-medium text-gray-500">{otherSettings.appVersion}</Text>
            }
            onPress={handleAppInformation}
            className="mx-0"
          />
          <MenuItem
            title="이용약관"
            icon="file-text"
            iconColor="#3B82F6"
            onPress={handleTermsOfService}
            className="mx-0"
          />
          <MenuItem
            title="개인정보처리방침"
            icon="shield"
            iconColor="#10B981"
            onPress={handlePrivacyPolicy}
            className="mx-0"
          />
          <MenuItem
            title="오픈소스 라이선스"
            icon="code"
            iconColor="#8B5CF6"
            onPress={handleOpenSourceLicense}
            className="mx-0"
          />
        </SettingsSection>

        {/* 고객지원 */}
        <SettingsSection title="고객지원">
          <MenuItem
            title="고객센터"
            icon="headphones"
            iconColor="#10B981"
            onPress={handleCustomerCenter}
            className="mx-0"
          />
          <MenuItem
            title="자주 묻는 질문"
            icon="help-circle"
            iconColor="#F59E0B"
            onPress={handleFAQ}
            className="mx-0"
          />
          <MenuItem
            title="의견 보내기"
            icon="message-circle"
            iconColor="#3B82F6"
            onPress={handleSendFeedback}
            className="mx-0"
          />
        </SettingsSection>

        {/* 하단 액션 버튼들 */}
        <View className="mt-6 mb-8">
          <TouchableOpacity className="items-center mx-4 mb-4" onPress={handleLogoutPress}>
            <Text className="font-medium text-red-500">로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mx-4" onPress={handleWithdrawPress}>
            <Text className="font-medium text-gray-500">회원탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
