// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useMyScreen } from '@/hooks/useMyScreen';
import { COLORS } from '@/constants/colors';

// 컴포넌트들
import GradeCard from '@/components/my/GradeCard';
import ProfileCard from '@/components/my/ProfileCard';
import StatsCard from '@/components/my/StatsCard';
import MenuItem from '@/components/my/MenuItem';
import ToggleSwitch from '@/components/common/ToggleSwitch';

export default function MyScreen() {
  const {
    userProfile,
    settings,
    isLoading,
    handleLogout,
    handleViewGradeBenefits,
    handleEditProfile,
    handleViewMatchHistory,
    handleViewFavoritePlaces,
    handleContactCustomerService,
    toggleNotifications,
  } = useMyScreen();

  const handleLogoutPress = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: handleLogout },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // 사용자 정보가 없으면 로딩 화면 표시
  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text>사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 pt-4">
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
          title="개인정보 수정"
          icon="user"
          iconColor="#6B7280"
          onPress={handleEditProfile}
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
          className="mb-4 rounded-b-2xl border-2 border-t-0 border-mainGray"
          rightComponent={<Text className="font-medium text-gray-500">{settings.appVersion}</Text>}
        />

        {/* 로그아웃 버튼 */}
        <TouchableOpacity className="items-center mx-4 mt-4 mb-8" onPress={handleLogoutPress}>
          <Text className="font-medium text-red-500">로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
