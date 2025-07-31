import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useProfile } from '@/hooks/useProfile';
import ProfileImage from '@/components/profile/ProfileImage';
import ProfileFormField from '@/components/profile/ProfileFormField';
import GenderSelector from '@/components/profile/GenderSelector';
import BioTextArea from '@/components/profile/BioTextArea';
import PrimaryButton from '@/components/common/PrimaryButton';
import CheckModal from '@/components/common/CheckModal';
import { COLORS } from '@/constants/colors';

export default function Profile() {
  const {
    profileData,
    formData,
    isLoading,
    isEditing,
    isFormValid,
    isModalOpen,
    getFieldError,
    startEditing,
    cancelEditing,
    updateFormData,
    handleSave,
    handleImageChange,
    handleGenderChange,
    handleModalClick,
  } = useProfile();

  const handleImagePress = () => {
    // 이미지 선택 로직 (나중에 구현)
    Alert.alert('이미지 선택', '이미지 선택 기능은 나중에 구현됩니다.');
  };

  const handleBirthDatePress = () => {
    // 날짜 선택 로직 (나중에 구현)
    Alert.alert('날짜 선택', '날짜 선택 기능은 나중에 구현됩니다.');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CheckModal visible={isModalOpen} title={''} onClose={handleModalClick}>
        <View className="flex-col items-center gap-4 mb-8">
          <View className="items-center justify-center w-20 h-20 rounded-full bg-mainOrange">
            <Feather name="check" size={30} color="white" />
          </View>
          <Text className="text-2xl font-bold ">저장완료</Text>
          <Text className="text-mainDarkGray">개인정보가 성공적으로 수정되었습니다.</Text>
        </View>
        <PrimaryButton
          title="확인"
          onPress={handleModalClick}
          disabled={isLoading || !isFormValid}
        />
      </CheckModal>
      <ScrollView className="flex-1">
        {/* 프로필 이미지 */}
        <ProfileImage imageUri={profileData.profileImage} onImageChange={handleImagePress} />

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
