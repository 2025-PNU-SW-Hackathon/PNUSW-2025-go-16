import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
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
  storeId?: number; // 가게 ID 추가
  chatRoom?: any; // 채팅방 정보 (선택사항)
  isHost?: boolean; // 방장 여부 (선택사항)
}

type StoreShareNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StoreShareMessage: React.FC<StoreShareMessageProps> = ({
  isMyMessage,
  senderName,
  senderAvatar,
  storeInfo,
  storeId,
  chatRoom,
  isHost
}) => {
  const navigation = useNavigation<StoreShareNavigationProp>();

  // 썸네일 로그 제거

  // 가게 상세로 이동하는 핸들러
  const handleStorePress = () => {
    if (!storeId) {
      console.warn('⚠️ [StoreShareMessage] storeId가 없어서 이동할 수 없습니다.');
      return;
    }

    console.log('🏪 [StoreShareMessage] 가게 상세로 이동:', {
      storeId,
      storeName: storeInfo.storeName,
      chatRoom,
      isHost
    });

    // StoreList를 거쳐서 StoreDetail로 이동
    navigation.navigate('StoreList', { 
      chatRoom: chatRoom || undefined,
      isHost: isHost || false
    });

    // 약간의 지연 후 StoreDetail로 이동 (StoreList 화면이 로드된 후)
    setTimeout(() => {
      navigation.navigate('StoreDetail', {
        storeId: storeId,
        chatRoom: chatRoom || undefined,
        isHost: isHost || false
      });
    }, 100);
  };

  return (
    <View className={`${isMyMessage ? 'self-end' : 'self-start'}`}>
      {!isMyMessage ? (
        <TouchableOpacity 
          onPress={handleStorePress}
          activeOpacity={0.8}
          className="rounded-2xl w-[240px] shadow-sm overflow-hidden bg-white"
        >
              {/* 가게 대표 사진 */}
              <View className="w-full h-32">
                {storeInfo.imageUrl ? (
                  <Image
                    source={{ uri: storeInfo.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onLoad={() => {}}
                    onError={() => {}}
                  />
                ) : (
                  <View className="w-full h-full bg-gray-300 justify-center items-center">
                    <Text className="text-gray-500 text-xs">이미지 없음</Text>
                  </View>
                )}
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
        </TouchableOpacity>
      ) : (
        /* 내 메시지 */
        <TouchableOpacity 
          onPress={handleStorePress}
          activeOpacity={0.8}
          className="bg-white w-[240px] rounded-2xl shadow-sm overflow-hidden"
        >
          {/* 가게 대표 사진 */}
          <View className="w-full h-32">
            {storeInfo.imageUrl ? (
              <Image
                source={{ uri: storeInfo.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
                onLoad={() => {
                  console.log('✅ [StoreShareMessage-내메시지] 이미지 로드 성공:', {
                    storeName: storeInfo.storeName,
                    imageUrl: storeInfo.imageUrl
                  });
                }}
                onError={(error) => {
                  console.log('❌ [StoreShareMessage-내메시지] 이미지 로드 실패:', {
                    storeName: storeInfo.storeName,
                    imageUrl: storeInfo.imageUrl,
                    error: error.nativeEvent
                  });
                }}
              />
            ) : (
              <View className="w-full h-full bg-gray-300 justify-center items-center">
                <Text className="text-gray-500 text-xs">이미지 없음</Text>
              </View>
            )}
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
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StoreShareMessage; 