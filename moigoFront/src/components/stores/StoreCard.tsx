import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { StoreListItemDTO } from '@/types/DTO/stores';

interface StoreCardProps {
  store: StoreListItemDTO;
  onPress: (store: StoreListItemDTO) => void;
}

export default function StoreCard({ store, onPress }: StoreCardProps) {
  // 평점을 별점으로 변환
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };

  // 주소에서 역 정보 추출 (예: "홍대입구역 인근 200m")
  const extractLocationInfo = (address: string) => {
    // 실제로는 주소 파싱 로직이 필요하지만, 임시로 하드코딩
    const locations = [
      { address: '홍대입구역', distance: '200m' },
      { address: '강남역 2번 출구', distance: '도보 3분' },
      { address: '선릉역 5번 출구', distance: '도보 5분' },
      { address: '신촌역 1번 출구', distance: '도보 2분' },
    ];
    
    const location = locations.find(loc => address.includes(loc.address.split('역')[0]));
    return location ? `${location.address} ${location.distance}` : address;
  };

  // 스크린 정보 (임시 데이터)
  const getScreenInfo = (storeId: number) => {
    const screenInfo = {
      1: '대형 스크린 4개',
      2: '프로젝터 스크린 2개',
      3: '스크린 골프 시설',
      4: 'TV 8대',
    };
    return screenInfo[storeId as keyof typeof screenInfo] || 'TV 4대';
  };

  // 오늘 경기 여부 (임시 데이터)
  const hasGameToday = (storeId: number) => {
    return [1, 2, 4].includes(storeId);
  };

  // 스포츠 종목 (임시 데이터)
  const getSportType = (storeId: number) => {
    const sportTypes = {
      1: '축구',
      2: '야구',
      3: '야구',
      4: '농구',
    };
    return sportTypes[storeId as keyof typeof sportTypes] || '축구';
  };

  return (
    <TouchableOpacity
      onPress={() => {
        console.log('=== StoreCard TouchableOpacity 클릭됨 ===');
        console.log('store:', store);
        onPress(store);
      }}
      className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
      activeOpacity={0.8}
    >
      {/* 가게 이미지 */}
      <View className="w-full h-48 bg-gray-200">
        {store.store_thumbnail ? (
          <Image
            source={{ uri: store.store_thumbnail }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-300 justify-center items-center">
            <Text className="text-gray-500 text-sm">이미지 없음</Text>
          </View>
        )}
      </View>

      {/* 가게 정보 */}
      <View className="p-4">
        {/* 가게명 */}
        <Text className="text-lg font-bold text-gray-900 mb-1">
          {store.store_name}
        </Text>

        {/* 평점 */}
        <View className="flex-row items-center mb-2">
          <Text className="text-yellow-400 text-base mr-1">
            {renderStars(store.store_rating)}
          </Text>
          <Text className="text-sm text-gray-600">
            {store.store_rating.toString()} (리뷰 {(Math.floor(Math.random() * 200) + 50).toString()})
          </Text>
        </View>

        {/* 위치 정보 */}
        <Text className="text-sm text-gray-600 mb-2">
          <Text>📍 </Text>
          <Text>{extractLocationInfo(store.store_address)}</Text>
        </Text>

        {/* 스크린 정보 */}
        <Text className="text-sm text-gray-600 mb-3">
          <Text>📺 </Text>
          <Text>{getScreenInfo(store.store_id)}</Text>
        </Text>

        {/* 상태 태그 */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row">
            {hasGameToday(store.store_id) ? (
              <View className="px-3 py-1 bg-green-100 rounded-full mr-2">
                <Text className="text-green-700 text-xs font-medium">
                  오늘 경기 있음
                </Text>
              </View>
            ) : (
              <View className="px-3 py-1 bg-yellow-100 rounded-full mr-2">
                <Text className="text-yellow-700 text-xs font-medium">
                  {getSportType(store.store_id)} 전문
                </Text>
              </View>
            )}
          </View>

          {/* 상세보기 버튼 */}
          <TouchableOpacity
            onPress={() => onPress(store)}
            className="px-4 py-2 bg-mainOrange rounded-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-medium">상세보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
