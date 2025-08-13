import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreBasicInfo'>;

export default function SettingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showMinReservationModal, setShowMinReservationModal] = useState(false);
  const [showReservationDepositModal, setShowReservationDepositModal] = useState(false);
  const [minReservationCapacity, setMinReservationCapacity] = useState(4);
  const [reservationDeposit, setReservationDeposit] = useState(1000);
  
  const [notificationSettings, setNotificationSettings] = useState({
    reservation: true,
    payment: true,
    system: true,
    marketing: false,
  });

  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => console.log('로그아웃') },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('회원 탈퇴', '정말 회원을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '탈퇴', style: 'destructive', onPress: () => console.log('회원 탈퇴') },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
        {/* 매장 정보 카드 */}
        <StoreInfoCard
          storeName="스포츠 팬 클럽"
          address="강남역 2번 출구 도보 3분"
          businessNumber="123-45-67890"
          iconName="home"
          iconColor="#f97316"
        />

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
            onPress={() => navigation.navigate('BusinessInfoEdit')}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />
          
          <MenuItem
            title="비밀번호 변경"
            icon="lock"
            iconColor="#8B5CF6"
            onPress={() => console.log('비밀번호 변경')}
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
            title="회원 탈퇴"
            icon="user-x"
            iconColor="#EF4444"
            onPress={handleWithdraw}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
            rightComponent={
              <Text className="font-medium text-red-500">회원 탈퇴</Text>
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
        onSave={setMinReservationCapacity}
      />
      <ReservationDepositModal
        visible={showReservationDepositModal}
        currentDeposit={reservationDeposit}
        onClose={() => setShowReservationDepositModal(false)}
        onSave={setReservationDeposit}
      />
    </View>
  );
}
