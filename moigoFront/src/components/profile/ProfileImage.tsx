import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileImageProps {
  imageUri: string | null;
  onImageChange: () => void;
  thumbnailUrl?: string;
}

export default function ProfileImage({ imageUri, onImageChange, thumbnailUrl }: ProfileImageProps) {
  const [imageKey, setImageKey] = useState(0); // 이미지 강제 리로드를 위한 키
  
  // thumbnailUrl이 변경될 때마다 이미지 강제 리로드
  useEffect(() => {
    // 타임스탬프로 고유 키 생성하여 강제 리로드
    setImageKey(Date.now());
  }, [thumbnailUrl]);

  // 썸네일 URL이 상대경로인 경우 절대 URL로 변환
  const getImageSource = () => {
    // 로컬 이미지가 있으면 우선 사용 (즉시 반영)
    if (imageUri) {
      return { uri: imageUri };
    }
    
    // 서버 이미지 사용
    if (thumbnailUrl) {
      // 상대경로인 경우 절대 URL로 변환 (개발 환경용 포트 3001 포함)
      if (thumbnailUrl.startsWith('/')) {
        const absoluteUrl = `http://spotple.kr:3001${thumbnailUrl}`;
        // 캐시 방지를 위해 타임스탬프 쿼리 파라미터 추가
        const cacheBustUrl = `${absoluteUrl}?t=${Date.now()}`;
        return { uri: cacheBustUrl };
      }
      // 절대 URL에도 캐시 방지 쿼리 파라미터 추가
      const cacheBustUrl = `${thumbnailUrl}?t=${Date.now()}`;
      return { uri: cacheBustUrl };
    }
    
    return null;
  };

  const imageSource = getImageSource();

  return (
    <View className="items-center mb-6">
      <View className="relative">
        <View className="overflow-hidden justify-center items-center w-24 h-24 bg-gray-200 rounded-full">
          {imageSource ? (
            <Image 
              key={imageKey} // 타임스탬프 키로 강제 리로드
              source={imageSource} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={48} color="#9CA3AF" />
          )}
        </View>

        <TouchableOpacity
          className="absolute right-0 bottom-0 justify-center items-center w-8 h-8 rounded-full bg-mainOrange"
          onPress={onImageChange}
        >
          <Ionicons name="camera" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onImageChange}>
        <Text className="mt-2 text-sm font-medium text-mainOrange">사진 변경</Text>
      </TouchableOpacity>
    </View>
  );
}
