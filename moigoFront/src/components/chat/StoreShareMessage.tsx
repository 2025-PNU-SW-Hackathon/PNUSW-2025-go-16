import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import Feather from 'react-native-vector-icons/Feather';
import { useStoreDetail } from '@/hooks/queries/useStoreQueries';

interface StoreShareMessageProps {
  isMyMessage: boolean;
  senderName?: string;
  senderAvatar?: string;
  storeInfo: {
    storeName: string;
    rating: number;
    reviewCount: number;
    imageUrl?: string; // 선택사항으로 변경
    store_thumbnail?: string; // 추가
  };
  storeId?: string; // 가게 ID 추가
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
  
  // 가게 상세 정보 조회 (storeId가 있을 때)
  const { data: storeDetailData } = useStoreDetail(storeId || '');
  
  // 가게 이미지 URL 처리 (포트 3001 포함)
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return null;
    
    // 로컬 파일 경로인 경우 (file://로 시작하는 경우) 처리
    if (imageUrl.startsWith('file://')) {
      // 콤마로 구분된 여러 파일이 있는 경우 첫 번째 파일만 사용
      const firstImage = imageUrl.split(',')[0];
      return firstImage;
    }
    
    // 상대경로인 경우 HTTPS 절대 URL로 변환
    if (imageUrl.startsWith('/')) {
      return `https://spotple.kr${imageUrl}`;
    }
    
    // 절대 URL인 경우 그대로 사용
    return imageUrl;
  };

  // 이미지 URL 우선순위: 1. storeInfo.imageUrl, 2. storeDetail.store_thumbnail, 3. storeInfo.store_thumbnail
  const processedImageUrl = getImageUrl(
    storeInfo?.imageUrl || 
    storeDetailData?.data?.store_thumbnail || 
    storeInfo?.store_thumbnail
  );
  
  // 디버깅을 위한 로그 추가
  console.log('🔍 [StoreShareMessage] 이미지 정보:', {
    storeName: storeInfo?.storeName,
    imageUrl: storeInfo?.imageUrl,
    store_thumbnail: storeInfo?.store_thumbnail,
    storeDetailThumbnail: storeDetailData?.data?.store_thumbnail,
    processedImageUrl,
    storeInfoKeys: Object.keys(storeInfo || {})
  });

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

  if (isMyMessage) {
    return (
      <View className="flex-row justify-end mb-4">
        <View className="flex-row items-end">
          {/* 내 메시지 */}
          <TouchableOpacity 
            onPress={handleStorePress}
            activeOpacity={0.8}
            className="bg-white w-[240px] rounded-2xl shadow-sm overflow-hidden"
          >
            {/* 가게 대표 사진 */}
            <View className="w-full h-32">
              {processedImageUrl ? (
                <Image
                  source={{ uri: processedImageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onLoad={() => {
                    console.log('✅ [StoreShareMessage-내메시지] 이미지 로드 성공:', {
                      storeName: storeInfo?.storeName,
                      imageUrl: processedImageUrl
                    });
                  }}
                  onError={(error) => {
                    console.log('❌ [StoreShareMessage-내메시지] 이미지 로드 실패:', {
                      storeName: storeInfo?.storeName,
                      imageUrl: processedImageUrl,
                      error: error.nativeEvent
                    });
                  }}
                />
              ) : (
                <View className="justify-center items-center w-full h-full bg-gray-300">
                  <Text className="text-xs text-gray-500">이미지 없음</Text>
                </View>
              )}
            </View>
            
            {/* 가게 정보 */}
            <View className="px-4 py-3">
              {/* 가게 이름 */}
              <Text className="mb-1 text-sm font-bold text-gray-900">
                {storeInfo.storeName}
              </Text>
              
              {/* 별점 및 리뷰 */}
              <View className="flex-row items-center">
                <Feather name="star" size={12} color="#FBBF24" />
                <Text className="ml-1 text-xs font-semibold text-gray-900">
                  {storeInfo.rating}
                </Text>
                <Text className="ml-1 text-xs text-gray-600">
                  (리뷰 {storeInfo.reviewCount})
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    return (
      <View className={`${isMyMessage ? 'self-end' : 'self-start'}`}>
        <TouchableOpacity 
          onPress={handleStorePress}
          activeOpacity={0.8}
          className="rounded-2xl w-[240px] shadow-sm overflow-hidden bg-white"
        >
              {/* 가게 대표 사진 */}
              <View className="w-full h-32">
                {processedImageUrl ? (
                  <Image
                    source={{ uri: processedImageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onLoad={() => {
                      console.log('✅ [StoreShareMessage-상대방메시지] 이미지 로드 성공:', {
                        storeName: storeInfo?.storeName,
                        imageUrl: processedImageUrl
                      });
                    }}
                    onError={(error) => {
                      console.log('❌ [StoreShareMessage-상대방메시지] 이미지 로드 실패:', {
                        storeName: storeInfo?.storeName,
                        imageUrl: processedImageUrl,
                        error: error.nativeEvent
                      });
                    }}
                  />
                ) : (
                  <View className="justify-center items-center w-full h-full bg-gray-300">
                    <Text className="text-xs text-gray-500">이미지 없음</Text>
                  </View>
                )}
              </View>
              
              {/* 가게 정보 */}
              <View className="px-4 py-3">
                {/* 가게 이름 */}
                <Text className="mb-1 text-sm font-bold text-gray-900">
                  {storeInfo.storeName}
                </Text>
                
                {/* 별점 및 리뷰 */}
                <View className="flex-row items-center">
                  <Feather name="star" size={12} color="#FBBF24" />
                  <Text className="ml-1 text-xs font-semibold text-gray-900">
                    {storeInfo.rating}
                  </Text>
                  <Text className="ml-1 text-xs text-gray-600">
                    (리뷰 {storeInfo.reviewCount})
                  </Text>
                </View>
              </View>
        </TouchableOpacity>
      </View>
    );
  }
};

export default StoreShareMessage; 