import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileImageProps {
  imageUri: string | null;
  onImageChange: () => void;
  thumbnailUrl?: string;
}

export default function ProfileImage({ imageUri, onImageChange, thumbnailUrl }: ProfileImageProps) {
  // 썸네일 URL이 상대경로인 경우 절대 URL로 변환
  const getImageSource = () => {
    // 로컬 이미지가 있으면 우선 사용 (즉시 반영)
    if (imageUri) {
      return { uri: imageUri };
    }
    
    // 서버 이미지 사용
    if (thumbnailUrl) {
      // 상대경로인 경우 절대 URL로 변환
      if (thumbnailUrl.startsWith('/')) {
        const absoluteUrl = `http://spotple.kr:3001${thumbnailUrl}`;
        return { uri: absoluteUrl };
      }
      // 절대 URL인 경우 그대로 사용
      return { uri: thumbnailUrl };
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
