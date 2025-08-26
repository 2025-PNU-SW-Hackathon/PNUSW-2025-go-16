import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { StoreListItemDTO } from '@/types/DTO/stores';

interface StoreCardProps {
  store: StoreListItemDTO;
  onPress: (store: StoreListItemDTO) => void;
}

export default function StoreCard({ store, onPress }: StoreCardProps) {
  // 썸네일 로그 제거

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
  const getScreenInfo = (storeId: string) => {
    const screenInfo = {
      '1': '대형 스크린 4개',
      '2': '프로젝터 스크린 2개',
      '3': '스크린 골프 시설',
      '4': 'TV 8대',
    };
    return screenInfo[storeId as keyof typeof screenInfo] || 'TV 4대';
  };

  // 오늘 경기 여부 (임시 데이터)
  const hasGameToday = (storeId: string) => {
    return ['1', '2', '4'].includes(storeId);
  };

  // 스포츠 종목 (임시 데이터)
  const getSportType = (storeId: string) => {
    const sportTypes = {
      '1': '축구',
      '2': '야구',
      '3': '야구',
      '4': '농구',
    };
    return sportTypes[storeId as keyof typeof sportTypes] || '축구';
  };

  // 가게 썸네일 URL 처리 (포트 3001 포함)
  const getThumbnailUrl = (thumbnailUrl: string | null | undefined) => {
    if (!thumbnailUrl) return null;
    
    // 상대경로인 경우 포트 3001을 포함한 절대 URL로 변환
    if (thumbnailUrl.startsWith('/')) {
      return `http://spotple.kr:3001${thumbnailUrl}`;
    }
    
    // 절대 URL인 경우 그대로 사용
    return thumbnailUrl;
  };

  const thumbnailUrl = getThumbnailUrl(store.store_thumbnail);

  return (
    <TouchableOpacity
      onPress={() => onPress(store)}
      className="overflow-hidden mb-4 bg-white rounded-lg shadow-sm"
      activeOpacity={0.8}
    >
      {/* 가게 이미지 */}
      <View className="w-full h-48 bg-gray-200">
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onLoad={() => {}}
            onError={() => {}}
          />
        ) : (
          <View className="justify-center items-center w-full h-full bg-gray-300">
            <Text className="text-sm text-gray-500">이미지 없음</Text>
          </View>
        )}
      </View>

      {/* 가게 정보 */}
      <View className="p-4">
        {/* 가게명 */}
        <Text className="mb-1 text-lg font-bold text-gray-900">
          {store.store_name || '가게명 없음'}
        </Text>

        {/* 평점 */}
        <View className="flex-row items-center mb-2">
          <Text className="mr-1 text-base text-yellow-400">
            {renderStars(store.store_rating || 0)}
          </Text>
          <Text className="text-sm text-gray-600">
            {(store.store_rating || 0).toString()} (리뷰 {(Math.floor(Math.random() * 200) + 50).toString()})
          </Text>
        </View>

        {/* 위치 정보 */}
        <Text className="mb-2 text-sm text-gray-600">
          📍 {extractLocationInfo(store.store_address || '')}
        </Text>

        {/* 스크린 정보 */}
        <Text className="mb-3 text-sm text-gray-600">
          📺 {getScreenInfo(store.store_id || '1')}
        </Text>

        {/* 상태 태그 */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row">
            {hasGameToday(store.store_id || '1') ? (
              <View className="px-3 py-1 mr-2 bg-green-100 rounded-full">
                <Text className="text-xs font-medium text-green-700">
                  오늘 경기 있음
                </Text>
              </View>
            ) : (
              <View className="px-3 py-1 mr-2 bg-yellow-100 rounded-full">
                <Text className="text-xs font-medium text-yellow-700">
                  {getSportType(store.store_id || '1')} 전문
                </Text>
              </View>
            )}
          </View>

          {/* 상세보기 버튼 */}
          <View className="px-4 py-2 rounded-lg bg-mainOrange">
            <Text className="text-sm font-medium text-white">상세보기</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
