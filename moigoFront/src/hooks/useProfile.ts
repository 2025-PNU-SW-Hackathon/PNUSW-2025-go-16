import { useState, useEffect } from 'react';
import { useMyStore } from '@/store/myStore';
import type { ProfileFormData } from '@/types/profile';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';

export function useProfile() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userProfile, isLoading, updateUserProfile, updateProfileImage, setLoading } = useMyStore();
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

  // userProfile 데이터가 변경될 때 formData 업데이트
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        phone: userProfile.phone,
        email: userProfile.email,
        birthDate: userProfile.birthDate,
        gender: userProfile.gender,
        bio: userProfile.bio,
      });
    }
  }, [userProfile]);

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
        phone: userProfile.phone,
        email: userProfile.email,
        birthDate: userProfile.birthDate,
        gender: userProfile.gender,
        bio: userProfile.bio,
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

  // 프로필 저장
  const handleSave = async () => {
    if (!userProfile || !formData.name || !formData.phone || !formData.email || !formData.gender) return;

    setLoading(true);
    try {
      // API 호출 로직 (나중에 구현)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // myStore 업데이트
      updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        birthDate: formData.birthDate,
        gender: formData.gender,
        bio: formData.bio,
      });

      console.log('프로필 저장 완료');
      setIsModalOpen(true);
      // navigation.navigate('Main', { screen: 'My' });
      setIsEditing(false);
    } catch (error) {
      console.error('프로필 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 프로필 이미지 변경
  const handleImageChange = (imageUri: string) => {
    if (!userProfile) return;
    updateProfileImage(imageUri);
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
    navigation.navigate('Main', { screen: 'My' });
  }

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
  };
}
