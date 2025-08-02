import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface StoreShareMessageProps {
  isMyMessage: boolean;
  senderName?: string;
  senderAvatar?: string;
  storeInfo: {
    storeName: string;
    rating: number;
    reviewCount: number;
    imageUrl: string;
  };
}

const StoreShareMessage: React.FC<StoreShareMessageProps> = ({
  isMyMessage,
  senderName,
  senderAvatar,
  storeInfo
}) => {
  return (
    <View className={`${isMyMessage ? 'self-end' : 'self-start'}`}>
      {!isMyMessage ? (
            
            <View className="rounded-2xl w-[240px] shadow-sm overflow-hidden bg-white">
              {/* 가게 대표 사진 */}
              <View className="w-full h-32">
                <Image
                  source={{ uri: storeInfo.imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              
              {/* 가게 정보 */}
              <View className="px-4 py-3">
                {/* 가게 이름 */}
                <Text className="text-sm font-bold text-gray-900 mb-1">
                  {storeInfo.storeName}
                </Text>
                
                {/* 별점 및 리뷰 */}
                <View className="flex-row items-center">
                  <Feather name="star" size={12} color="#FBBF24" />
                  <Text className="text-xs font-semibold text-gray-900 ml-1">
                    {storeInfo.rating}
                  </Text>
                  <Text className="text-xs text-gray-600 ml-1">
                    (리뷰 {storeInfo.reviewCount})
                  </Text>
                </View>
              </View>
            </View>
      ) : (
        /* 내 메시지 */
        <View className="bg-white w-[240px] rounded-2xl shadow-sm overflow-hidden">
          {/* 가게 대표 사진 */}
          <View className="w-full h-32">
            <Image
              source={{ uri: storeInfo.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          
            {/* 가게 정보 */}
            <View className="px-4 py-3">
              {/* 가게 이름 */}
              <Text className="text-sm font-bold text-gray-900 mb-1">
                {storeInfo.storeName}
              </Text>
              
              {/* 별점 및 리뷰 */}
              <View className="flex-row items-center">
                <Feather name="star" size={12} color="#FBBF24" />
                <Text className="text-xs font-semibold text-gray-900 ml-1">
                  {storeInfo.rating}
                </Text>
                <Text className="text-xs text-gray-600 ml-1">
                  (리뷰 {storeInfo.reviewCount})
                </Text>
              </View>
            </View>
        </View>
      )}
    </View>
  );
};

export default StoreShareMessage; 