import { useMyStore } from '@/store/myStore';
import { useAuthStore } from '@/store/authStore';

export function useMyScreen() {
  const {
    userProfile,
    settings,
    isLoading,
    toggleNotifications,
    setLoading,
  } = useMyStore();

  const { logout: authLogout } = useAuthStore();

  // 로그아웃 처리
  const handleLogout = () => {
    setLoading(true);
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

  // 참여한 매칭 이력
  const handleViewMatchHistory = () => {
    // 매칭 이력 페이지로 이동
    console.log('매칭 이력 보기');
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
  };
} 