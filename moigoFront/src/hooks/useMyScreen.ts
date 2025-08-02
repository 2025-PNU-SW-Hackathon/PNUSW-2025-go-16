import { useMyStore } from '@/store/myStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';

export function useMyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    userProfile,
    settings,
    isLoading,
    initializeUserProfile,
    resetUserProfile,
    toggleNotifications,
    setLoading,
  } = useMyStore();

  const { user: authUser, logout: authLogout } = useAuthStore();
  // authStore의 사용자 정보가 있으면 myStore의 사용자 정보 초기화
  useEffect(() => {
    if (authUser && !userProfile) {
      initializeUserProfile({
        id: authUser.id,
        email: authUser.email,
      });
    }
  }, [authUser, userProfile, initializeUserProfile]);

  // 로그아웃 처리
  const handleLogout = () => {
    setLoading(true);
    // myStore의 사용자 정보 초기화
    resetUserProfile();
    // 실제 로그아웃 로직
    authLogout();
    setLoading(false);
  };

  // 등급별 혜택 보기
  const handleViewGradeBenefits = () => {
    // 등급별 혜택 페이지로 이동
    console.log('등급별 혜택 보기');
  };

  // 프로필 편집
  const handleEditProfile = () => {
    // 프로필 편집 페이지로 이동
    console.log('프로필 편집');
  };

  // 비밀번호 편집
  const handleEditPassword = () => {
    // 비밀번호 편집 페이지로 이동
    navigation.navigate('ChangePassword');
  };

  // 참여한 매칭 이력
  const handleViewMatchHistory = () => {
    // 매칭 이력 페이지로 이동
    navigation.navigate('ParticipatedMatches');
  };

  // 즐겨찾는 장소
  const handleViewFavoritePlaces = () => {
    // 즐겨찾는 장소 페이지로 이동
    console.log('즐겨찾는 장소 보기');
  };

  // 고객센터
  const handleContactCustomerService = () => {
    // 고객센터 페이지로 이동
    console.log('고객센터');
  };

  return {
    // 상태
    userProfile,
    settings,
    isLoading,

    // 액션
    toggleNotifications,
    handleLogout,
    handleViewGradeBenefits,
    handleEditProfile,
    handleViewMatchHistory,
    handleViewFavoritePlaces,
    handleContactCustomerService,
    handleEditPassword,
  };
}
