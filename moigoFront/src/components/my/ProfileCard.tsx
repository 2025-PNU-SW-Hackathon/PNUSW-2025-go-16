import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import TagChip from '@/components/common/TagChip';
import { COLORS } from '@/constants/colors';

interface ProfileCardProps {
  name: string;
  profileImage?: string;
  preferredSports: string[];
  onEdit: () => void;
}

export default function ProfileCard({
  name,
  profileImage,
  preferredSports,
  onEdit,
}: ProfileCardProps) {
  const [imageKey, setImageKey] = useState(0); // 이미지 강제 리로드를 위한 키
  
  // profileImage가 변경될 때마다 이미지 강제 리로드
  useEffect(() => {
    setImageKey(prev => prev + 1);
  }, [profileImage]);

  // 프로필 이미지 소스 생성 (상대경로를 절대 URL로 변환)
  const getImageSource = () => {
    if (!profileImage) {
      return null;
    }
    
    // 상대경로인 경우 절대 URL로 변환 (개발 환경용 포트 3001 포함)
    if (profileImage.startsWith('/')) {
      const absoluteUrl = `http://spotple.kr:3001${profileImage}`;
      // 캐시 방지를 위해 타임스탬프 쿼리 파라미터 추가
      const cacheBustUrl = `${absoluteUrl}?t=${Date.now()}`;
      return { uri: cacheBustUrl };
    }
    
    // 절대 URL에도 캐시 방지 쿼리 파라미터 추가
    const cacheBustUrl = `${profileImage}?t=${Date.now()}`;
    return { uri: cacheBustUrl };
  };

  const imageSource = getImageSource();

  return (
    <View className="px-4 py-8 mx-4 mb-4 bg-white rounded-2xl border-2 border-mainGray">
      <View className="flex-row justify-between items-center">
        <View className="flex-row flex-1 items-center">
          {/* 프로필 이미지 */}
          <View className="overflow-hidden mr-4 w-16 h-16 bg-gray-200 rounded-full">
            {imageSource ? (
              <Image 
                key={imageKey} // 키 변경으로 강제 리로드
                source={imageSource} 
                className="w-full h-full" 
                resizeMode="cover"
              />
            ) : (
              <View className="justify-center items-center w-full h-full">
                <Feather name="user" size={32} color={COLORS.mainDarkGray} />
              </View>
            )}
          </View>

          {/* 사용자 정보 */}
          <View className="flex-1">
            <Text className="mb-2 text-lg font-semibold text-mainDark">{name}</Text>

            <Text className="mb-2 text-sm text-mainLightGrayText">관심 종목</Text>
            {/* 선호 스포츠 태그들 */}
            <View className="flex-row flex-wrap">
              {preferredSports?.map((sport, index) => (
                <TagChip
                  key={sport}
                  label={sport}
                  color={`${COLORS.mainOrange}20`}
                  textColor={COLORS.mainOrange}
                  classNameView="mr-2 mb-1"
                  classNameText="text-xs"
                />
              ))}
            </View>
          </View>
        </View>

        {/* 편집 버튼 */}
        <TouchableOpacity
          onPress={onEdit}
          className="justify-center items-center ml-2 w-12 h-12 rounded-full bg-mainGray"
        >
          <Feather name="edit-3" size={20} color={COLORS.mainDarkGray} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
