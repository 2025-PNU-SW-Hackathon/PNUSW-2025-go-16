import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useProfile } from '@/hooks/useProfile';
import { useGetMyInfo } from '@/hooks/queries/useUserQueries';
import ProfileImage from '@/components/profile/ProfileImage';
import ProfileFormField from '@/components/profile/ProfileFormField';
import GenderSelector from '@/components/profile/GenderSelector';
import BioTextArea from '@/components/profile/BioTextArea';
import PrimaryButton from '@/components/common/PrimaryButton';
import CheckModal from '@/components/common/CheckModal';

export default function Profile() {
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    profileData,
    formData,
    image,
    isLoading,
    isEditing,
    isFormValid,
    isModalOpen,
    getFieldError,
    startEditing,
    cancelEditing,
    updateFormData,
    handleSave,
    handleGenderChange,
    handleModalClick,
    handleImagePress,
    myInfo,
    refetchMyInfo,
  } = useProfile();

  // API에서 최신 데이터를 가져와서 profileData 업데이트
  useEffect(() => {
    if (myInfo?.data) {
      console.log('Profile - API에서 최신 데이터 받음:', myInfo.data);
    }
  }, [myInfo]);

  // 디버깅: profileData 값 확인
  console.log('Profile 화면 - profileData:', profileData);
  console.log('Profile 화면 - profileData.profileImage:', profileData.profileImage);
  console.log('Profile 화면 - API 데이터:', myInfo?.data);

  const handleBirthDatePress = () => {
    Alert.alert('날짜 선택', '날짜 선택 기능은 나중에 구현됩니다.');
  };

  // 새로고침 처리 - API 직접 호출
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('Profile - 새로고침 시작');
      await refetchMyInfo();
      console.log('Profile - 새로고침 완료');
    } catch (error) {
      console.error('프로필 새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchMyInfo]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['left', 'right', 'bottom']}>
      <CheckModal visible={isModalOpen} title={''} onClose={handleModalClick}>
        <View className="flex-col gap-4 items-center mb-8">
          <View className="justify-center items-center w-20 h-20 rounded-full bg-mainOrange">
            <Feather name="check" size={30} color="white" />
          </View>
          <Text className="text-2xl font-bold">저장완료</Text>
          <Text className="text-mainDarkGray">개인정보가 성공적으로 수정되었습니다.</Text>
        </View>
        <PrimaryButton
          title="확인"
          onPress={handleModalClick}
          disabled={isLoading || !isFormValid}
        />
      </CheckModal>
      <ScrollView 
        className="flex-1 pt-8"
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
        {/* 프로필 이미지 */}
        <ProfileImage 
          imageUri={image} 
          onImageChange={handleImagePress}
          thumbnailUrl={myInfo?.data?.user_thumbnail || profileData.profileImage}
        />

        {/* 기본 정보 */}
        <View className="mb-2">
          <Text className="mx-4 mb-4 text-lg font-bold text-mainDark">기본 정보</Text>

          <ProfileFormField
            label="이름"
            value={formData.name}
            placeholder="이름을 입력해주세요"
            isRequired
            onValueChange={(value) => updateFormData('name', value)}
            errorMessage={getFieldError('name')}
          />

          <ProfileFormField
            label="전화번호"
            value={formData.phone}
            placeholder="010-XXXX-XXXX"
            isRequired
            onValueChange={(value) => updateFormData('phone', value)}
            errorMessage={getFieldError('phone')}
          />

          <ProfileFormField
            label="이메일"
            value={formData.email}
            placeholder="이메일을 입력해주세요"
            isRequired
            onValueChange={(value) => updateFormData('email', value)}
            errorMessage={getFieldError('email')}
          />

          <ProfileFormField
            label="생년월일"
            value={formData.birthDate}
            isEditable={false}
            onPress={handleBirthDatePress}
            showIcon
            iconName="calendar"
          />
        </View>

        {/* 성별 선택 */}
        <View className="px-4 mb-4 border-b border-mainGray">
          <GenderSelector
            selectedGender={formData.gender}
            onGenderChange={handleGenderChange}
            errorMessage={getFieldError('gender')}
          />
        </View>

        {/* 자기소개 */}
        <View className="px-4 mb-6">
          <BioTextArea
            value={formData.bio}
            onChangeText={(value) => updateFormData('bio', value)}
            maxLength={200}
          />
        </View>

        {/* 저장 버튼 */}
        <View className="px-4 mb-8">
          <PrimaryButton
            title="저장하기"
            onPress={handleSave}
            disabled={isLoading || !isFormValid}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
