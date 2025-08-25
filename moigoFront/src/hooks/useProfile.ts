import { useState, useEffect } from 'react';
import { useMyStore } from '@/store/myStore';
import type { ProfileFormData } from '@/types/profile';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { useUpdateProfile } from '@/hooks/queries/useUserQueries';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useGetMyInfo } from '@/hooks/queries/useUserQueries';
import { useQueryClient } from '@tanstack/react-query';

export function useProfile() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userProfile, isLoading, updateUserProfile, updateProfileImage, setLoading } = useMyStore();
  const { image, pickImage, setImage } = useImagePicker();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: 'female',
    bio: '',
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // React Query mutation
  const updateProfileMutation = useUpdateProfile();
  
  // 프로필 정보 조회 훅
  const { refetch: refetchMyInfo, data: myInfo } = useGetMyInfo();
  
  // Query Client로 다른 쿼리들 무효화
  const queryClient = useQueryClient();

  // userProfile 데이터가 변경될 때 formData 업데이트
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        phone: userProfile.phone || '',
        email: userProfile.email,
        birthDate: userProfile.birthDate || '',
        gender: userProfile.gender,
        bio: userProfile.bio || '',
      });
    }
  }, [userProfile]);

  // API에서 최신 데이터를 가져와서 profileData 업데이트
  useEffect(() => {
    if (myInfo?.data) {
      // 새로운 썸네일이 있으면 즉시 교체
      if (myInfo.data.user_thumbnail && myInfo.data.user_thumbnail !== userProfile?.profileImage) {
        updateProfileImage(myInfo.data.user_thumbnail);
        
        // 로컬 선택 이미지도 초기화 (서버 이미지로 교체됨)
        if (image && image !== myInfo.data.user_thumbnail) {
          setImage(null);
        }
      }
      
      // formData도 최신 데이터로 업데이트
      setFormData(prev => ({
        ...prev,
        name: myInfo.data.user_name || prev.name,
        phone: myInfo.data.user_phone_number || prev.phone,
        email: myInfo.data.user_email || prev.email,
        gender: (myInfo.data.user_gender === 1 ? 'male' : 'female') as 'male' | 'female',
      }));
    }
  }, [myInfo, userProfile?.profileImage, updateProfileImage, image]);

  // 편집 모드 시작
  const startEditing = () => {
    setIsEditing(true);
  };

  // 편집 모드 종료
  const cancelEditing = () => {
    setIsEditing(false);
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        phone: userProfile.phone || '',
        email: userProfile.email,
        birthDate: userProfile.birthDate || '',
        gender: userProfile.gender,
        bio: userProfile.bio || '',
      });
    }
  };

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 프로필 새로고침
  const refreshProfile = async () => {
    try {
      await refetchMyInfo();
    } catch (error) {
      throw error;
    }
  };

  // 프로필 이미지 변경
  const handleImageChange = (imageUri: string) => {
    if (!userProfile) return;
    
    // 즉시 로컬에 저장하고 myStore에 반영 (즉시 표시)
    updateProfileImage(imageUri);
    setImage(imageUri);
  };

  // 프로필 저장
  const handleSave = async () => {
    if (!userProfile || !formData.name || !formData.phone || !formData.email || !formData.gender) return;
  
    setLoading(true);
    try {
      const form = new FormData();
  
      form.append('user_name', formData.name);
      form.append('user_phone_number', formData.phone);
      form.append('user_region', userProfile.region || '서울');
      form.append('user_email', formData.email);
  
      if (image) {
        const filename = image.split('/').pop() ?? 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
  
        form.append('thumbnail', {
          uri: image,
          name: filename,
          type,
        } as any);
      }
  
      await updateProfileMutation.mutateAsync(form);
  
      // myStore 업데이트 (로컬 이미지 유지)
      updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        birthDate: formData.birthDate,
        gender: formData.gender,
        bio: formData.bio,
        profileImage: image || userProfile.profileImage,
      });
      
      // 관련된 모든 쿼리 무효화 (마이 탭 데이터도 새로고침)
      await queryClient.invalidateQueries({ queryKey: ['my-info'] });
      await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['matching-history'] });
      
      // 현재 프로필 데이터도 새로고침
      await refetchMyInfo();
      
      // 서버 응답이 오면 로컬 이미지를 서버 이미지로 교체
      if (myInfo?.data?.user_thumbnail && myInfo.data.user_thumbnail !== image) {
        // 서버 이미지 URL에 캐시 방지 쿼리 파라미터 추가
        let serverImageUrl = myInfo.data.user_thumbnail;
        if (serverImageUrl.startsWith('/')) {
          serverImageUrl = `http://spotple.kr:3001${serverImageUrl}?t=${Date.now()}`;
        } else {
          serverImageUrl = `${serverImageUrl}?t=${Date.now()}`;
        }
        
        updateProfileImage(serverImageUrl);
        setImage(null); // 선택된 이미지 초기화
      }
  
      setIsModalOpen(true);
      setIsEditing(false);
    } catch (error) {
      // 실패 시 로컬 이미지도 롤백
      if (image) {
        updateProfileImage(userProfile.profileImage || '');
        setImage(null);
      }
    } finally {
      setLoading(false);
    }
  };  

  // 성별 변경
  const handleGenderChange = (gender: 'male' | 'female') => {
    updateFormData('gender', gender);
  };

  // 전화번호 형식 검증
  const validatePhone = (phone: string) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  // 이메일 형식 검증
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 필드별 오류 메시지
  function getFieldError(field: keyof ProfileFormData) {
    const value = formData[field];

    switch (field) {
      case 'name':
        if (!value?.trim()) return '이름을 입력해주세요.';
        return '';
      case 'phone':
        if (!value?.trim()) return '전화번호를 입력해주세요.';
        if (!validatePhone(value)) return '010-XXXX-XXXX 형식으로 입력해주세요.';
        return '';
      case 'email':
        if (!value?.trim()) return '이메일을 입력해주세요.';
        if (!validateEmail(value)) return '올바른 이메일 형식을 입력해주세요.';
        return '';
      case 'gender':
        if (!value) return '성별을 선택해주세요.';
        return '';
      default:
        return '';
    }
  }

  // 필수 필드 검증
  function isFormValid() {
    return !!(
      formData.name?.trim() &&
      formData.phone?.trim() &&
      validatePhone(formData.phone) &&
      formData.email?.trim() &&
      validateEmail(formData.email) &&
      formData.gender
    );
  }

  // 모달에서 확인 클릭
  function handleModalClick() {
    setIsModalOpen(false);
    
    // My 탭으로 이동하기 전에 쿼리 캐시 무효화
    queryClient.invalidateQueries({ queryKey: ['my-info'] });
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    
    (navigation as any).navigate('Main', { screen: 'My' });
  }

  const handleImagePress = () => {
    pickImage();
  };
  
  return {
    // 상태
    profileData: userProfile || {
      id: '',
      email: '',
      name: '',
      phone: '',
      birthDate: '',
      gender: 'female',
      bio: '',
      userType: 'sports_fan',
      profileImage: undefined,
      grade: 'BRONZE',
      progressToNextGrade: 0,
      coupons: 0,
      participatedMatches: 0,
      writtenReviews: 0,
      preferredSports: [],
    },
    image,
    formData,
    isLoading,
    isEditing,
    isModalOpen,
    isFormValid: isFormValid(),
    getFieldError,

    // 액션
    startEditing,
    cancelEditing,
    updateFormData,
    handleSave,
    handleImageChange,
    handleGenderChange,
    handleModalClick,
    handleImagePress,
    refreshProfile,
    
    // API 데이터
    myInfo,
    refetchMyInfo,
  };
}
