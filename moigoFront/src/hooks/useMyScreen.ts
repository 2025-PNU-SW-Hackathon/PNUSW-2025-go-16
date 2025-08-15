import { useMyStore } from '@/store/myStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useGetMyInfo } from '@/hooks/queries/useUserQueries';

export function useMyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    userProfile,
    settings,
    isLoading,
    initializeUserProfile,
    updateUserProfile,
    resetUserProfile,
    toggleNotifications,
    setLoading,
  } = useMyStore();

  const { user: authUser, logout: authLogout } = useAuthStore();
  
  // users/me API 호출
  const { data: myInfo, isLoading: isMyInfoLoading, error: myInfoError } = useGetMyInfo();
  
  // 디버깅 로그
  console.log('useMyScreen API 상태:', {
    myInfo,
    isMyInfoLoading,
    myInfoError,
    userProfile,
    authUser
  });
  
  // API 데이터가 있으면 store에 저장
  useEffect(() => {
    if (myInfo?.data) {
      console.log('사용자 정보 저장:', myInfo.data);
      const userProfile = {
        id: myInfo.data.user_id,
        name: myInfo.data.user_name,
        email: myInfo.data.user_email,
        phone: myInfo.data.user_phone_number || '',
        gender: (myInfo.data.user_gender === 1 ? 'male' : 'female') as 'male' | 'female',
        profileImage: myInfo.data.user_thumbnail || undefined,
        grade: 'BRONZE' as const,
        progressToNextGrade: 0,
        coupons: 0,
        participatedMatches: 0,
        writtenReviews: 0,
        preferredSports: [],
      };
      console.log('완전한 userProfile:', userProfile);
      updateUserProfile(userProfile);
    }
  }, [myInfo, updateUserProfile]);

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
    navigation.navigate('Profile');
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
    isLoading: isLoading || isMyInfoLoading,

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
