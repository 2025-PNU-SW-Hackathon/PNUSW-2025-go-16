// src/screens/HomeScreen.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useMyScreen } from '@/hooks/useMyScreen';
import { COLORS } from '@/constants/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// 컴포넌트들
import GradeCard from '@/components/my/GradeCard';
import ProfileCard from '@/components/my/ProfileCard';
import StatsCard from '@/components/my/StatsCard';
import MenuItem from '@/components/my/MenuItem';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import LogoutConfirmModal from '@/components/business/LogoutConfirmModal';

export default function MyScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigation = useNavigation();
  
  const {
    userProfile,
    settings,
    isLoading,
    isRefreshing,
    hasError,
    error,
    handleLogout,
    handleViewGradeBenefits,
    handleEditProfile,
    handleViewMatchHistory,
    handleViewFavoritePlaces,
    handleContactCustomerService,
    toggleNotifications,
    handleEditPassword,
    refreshUserProfile,
  } = useMyScreen();

  // 화면이 포커스될 때마다 프로필 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  // 새로고침 처리
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
    } catch (error) {
      // 에러 처리 (필요시 사용자에게 알림)
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserProfile]);

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  // 🆕 로딩 상태 개선 (첫 로딩시에만 전체 로딩 화면)
  if (isLoading && !userProfile && !hasError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-600">사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // 🆕 에러 상태 처리
  if (hasError && !userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-4">
        <Text className="text-red-600 text-center mb-4">
          사용자 정보를 불러오는데 실패했습니다.
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          {error?.message || '네트워크 연결을 확인해주세요.'}
        </Text>
        <TouchableOpacity 
          className="bg-mainOrange px-6 py-3 rounded-lg"
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          <Text className="text-white font-medium">
            {isRefreshing ? '다시 시도 중...' : '다시 시도'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']} // 메인 오렌지 색상
            tintColor="#FF6B35"
            title="새로고침 중..."
            titleColor="#FF6B35"
          />
        }
      >
        {/* 등급 카드 */}
        <GradeCard
          grade={userProfile?.grade || 'BRONZE'}
          name={userProfile?.name || '사용자'}
          progressToNextGrade={userProfile?.progressToNextGrade || 0}
          coupons={userProfile?.coupons || 0}
          onViewBenefits={handleViewGradeBenefits}
        />

        {/* 프로필 카드 */}
        <ProfileCard
          name={userProfile?.name || '사용자'}
          profileImage={userProfile?.profileImage}
          preferredSports={userProfile?.preferredSports || []}
          onEdit={handleEditProfile}
        />

        {/* 🆕 에러가 있지만 캐시된 데이터가 있는 경우 경고 메시지 */}
        {hasError && userProfile && (
          <View className="mx-4 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 text-sm text-center">
              ⚠️ 최신 정보를 가져오는데 실패했습니다. 아래로 당겨서 새로고침해주세요.
            </Text>
          </View>
        )}

        {/* 통계 카드들 */}
        <View className="flex-row mx-4 mb-4">
          <StatsCard
            title="참여 매칭"
            value={`${userProfile?.participatedMatches || 0}회`}
            icon="users"
            color="#3B82F6"
          />
          <View className="w-4" />
          <StatsCard
            title="작성 리뷰"
            value={`${userProfile?.writtenReviews || 0}개`}
            icon="message-circle"
            color="#10B981"
          />
        </View>

        <View className="flex-col mx-4 mb-4">
          {/* 메뉴 아이템들 */}
          <MenuItem
            title="참여한 매칭 이력"
            icon="clock"
            iconColor="#3B82F6"
            onPress={handleViewMatchHistory}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />

          <MenuItem
            title="즐겨찾는 장소"
            icon="heart"
            iconColor="#EF4444"
            onPress={handleViewFavoritePlaces}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          />

          <MenuItem
            title="알림 설정"
            icon="bell"
            iconColor="#3B82F6"
            onPress={() => {}}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
            rightComponent={
              <ToggleSwitch value={settings.notifications} onValueChange={toggleNotifications} />
            }
          />

          <MenuItem
            title="비밀번호 수정"
            icon="user"
            iconColor="#6B7280"
            onPress={handleEditPassword}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          />

          <MenuItem
            title="고객센터"
            icon="headphones"
            iconColor="#10B981"
            onPress={handleContactCustomerService}
            className="mb-0 rounded-t-2xl border-2 border-mainGray"
          />

          <MenuItem
            title="앱 버전"
            icon="info"
            iconColor="#6B7280"
            onPress={() => {}}
            className="border-2 border-t-0 border-mainGray"
            rightComponent={
              <Text className="font-medium text-gray-500">{settings.appVersion}</Text>
            }
          />
          <MenuItem
            title="로그아웃"
            icon="log-out"
            iconColor="#EF4444"
            onPress={handleLogoutPress}
            className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          />
        </View>

      </ScrollView>
      <LogoutConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </View>
  );
}
