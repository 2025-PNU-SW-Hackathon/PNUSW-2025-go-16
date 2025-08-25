import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileImageProps {
  imageUri: string | null;
  onImageChange: () => void;
}

export default function ProfileImage({ imageUri, onImageChange }: ProfileImageProps) {
  return (
    <View className="items-center mb-6">
      <View className="relative">
        <View className="overflow-hidden justify-center items-center w-24 h-24 bg-gray-200 rounded-full">
          {imageUri !== null ? (
            <Image source={{ uri: imageUri as string }} className="w-full h-full" resizeMode="cover" />
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
