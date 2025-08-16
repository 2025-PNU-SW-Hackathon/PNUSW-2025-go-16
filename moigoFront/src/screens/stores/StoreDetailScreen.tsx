import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useStoreDetail } from '@/hooks/queries/useStoreQueries';
import { useAuthStore } from '@/store/authStore';
import Feather from 'react-native-vector-icons/Feather';

type StoreDetailScreenRouteProp = RouteProp<RootStackParamList, 'StoreDetail'>;
type StoreDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreDetail'>;

export default function StoreDetailScreen() {
  const navigation = useNavigation<StoreDetailScreenNavigationProp>();
  const route = useRoute<StoreDetailScreenRouteProp>();
  const { storeId, chatRoom, isHost } = route.params;
  const { user } = useAuthStore();

  // 실제 방장 여부 사용
  const actualIsHost = isHost || false;

  // 가게 상세 정보 조회
  const { data: storeDetailData, isLoading, error, refetch } = useStoreDetail(storeId);

  // 실제 데이터 사용 (API 데이터가 없으면 기본값 사용)
  const storeDetail = storeDetailData?.data || {
    store_id: storeId,
    store_name: '가게 정보를 불러오는 중...',
    store_address: '',
    store_bio: '',
    store_open_hour: '',
    store_close_hour: '',
    store_holiday: '',
    store_max_people_cnt: 0,
    store_max_table_cnt: 0,
    store_max_parking_cnt: 0,
    store_max_screen_cnt: 0,
    store_phonenumber: '',
    store_thumbnail: '',
    store_review_cnt: 0,
    store_rating: 0,
    bank_code: '',
    account_number: '',
    account_holder_name: '',
    business_number: '',
  };

  // 평점을 별점으로 변환
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };

  // 영업 시간 포맷팅
  const formatBusinessHours = () => {
    if (storeDetail.store_open_hour && storeDetail.store_close_hour) {
      return `${storeDetail.store_open_hour} - ${storeDetail.store_close_hour}`;
    }
    return '영업시간 정보 없음';
  };

  // 오늘의 경기 일정 (실제 데이터가 있을 때만 표시)
  const todayGames = storeDetailData?.data ? [
    {
      id: 1,
      sport: '축구',
      teams: '토트넘 vs 맨시티',
      time: '오늘 19:30',
      status: '좌석 가능',
      statusColor: '#4ADE80',
    },
    {
      id: 2,
      sport: '농구',
      teams: 'LA 레이커스 vs 보스턴',
      time: '오늘 21:00',
      status: '좌석 임박',
      statusColor: '#FBBF24',
    },
  ] : [];

  // 시설 정보 (실제 데이터 기반)
  const facilities = [];
  
  if (storeDetail.store_max_screen_cnt > 0) {
    facilities.push({ icon: 'monitor', text: `대형 스크린 ${storeDetail.store_max_screen_cnt.toString()}개` });
  }
  
  if (storeDetail.store_max_parking_cnt > 0) {
    facilities.push({ icon: 'map-pin', text: `주차 ${storeDetail.store_max_parking_cnt.toString()}대 가능` });
  }
  
  if (storeDetail.store_max_people_cnt > 0) {
    facilities.push({ icon: 'users', text: `최대 ${storeDetail.store_max_people_cnt.toString()}명 수용` });
  }
  
  if (storeDetail.store_max_table_cnt > 0) {
    facilities.push({ icon: 'grid', text: `테이블 ${storeDetail.store_max_table_cnt.toString()}개` });
  }

  // 태그 정보 (실제 데이터 기반)
  const tags = [];
  
  if (storeDetail.store_rating >= 4.0) {
    tags.push({ label: '높은 평점', color: '#10B981' });
  }
  
  if (storeDetail.store_max_parking_cnt > 0) {
    tags.push({ label: '주차 가능', color: '#3B82F6' });
  }
  
  if (storeDetail.store_max_people_cnt >= 20) {
    tags.push({ label: '단체석 있음', color: '#8B5CF6' });
  }
  
  if (storeDetail.store_max_screen_cnt > 0) {
    tags.push({ label: '대형 스크린', color: '#F59E0B' });
  }

  // 뒤로가기 핸들러
  const handleBackPress = () => {
    navigation.goBack();
  };

  // 공유하기 핸들러
  const handleSharePress = () => {
    Alert.alert('공유하기', `${storeDetail.store_name}을 공유합니다.`);
  };

  // 선택하기 핸들러 (방장만)
  const handleSelectPress = () => {
    Alert.alert('선택하기', `${storeDetail.store_name}을 선택했습니다.`);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white shadow-sm">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">장소 상세</Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text className="mt-4 text-gray-600">가게 정보를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text className="mt-4 text-gray-600 text-center">가게 정보를 불러오는데 실패했습니다.</Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            {error instanceof Error ? error.message : '네트워크 연결을 확인해주세요.'}
          </Text>
          <TouchableOpacity 
            className="bg-mainOrange px-6 py-3 rounded-lg"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* 가게 이미지 */}
            <View className="w-full h-64 bg-gray-200">
              {storeDetail.store_thumbnail ? (
                <Image
                  source={{ uri: storeDetail.store_thumbnail }}
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
            <View className="px-4 py-4">
              {/* 가게명 */}
              <Text className="text-xl font-bold text-gray-900 mb-2">
                {storeDetail.store_name}
              </Text>

              {/* 평점과 위치 */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Text className="text-yellow-400 text-lg mr-1">
                    {renderStars(storeDetail.store_rating)}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {storeDetail.store_rating > 0 ? `${storeDetail.store_rating.toString()} (리뷰 ${storeDetail.store_review_cnt.toString()})` : '평점 없음'}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600">
                  {storeDetail.store_address ? storeDetail.store_address.split(' ').slice(0, 2).join(' ') : '위치 정보 없음'}
                </Text>
              </View>

              {/* 가게 소개 */}
              {storeDetail.store_bio && (
                <View className="mb-4">
                  <Text className="text-gray-700 leading-5">{storeDetail.store_bio}</Text>
                </View>
              )}

              {/* 태그 */}
              {tags.length > 0 && (
                <View className="flex-row flex-wrap mb-4">
                  {tags.map((tag, index) => (
                    <View
                      key={index.toString()}
                      className="px-3 py-1 rounded-full mr-2 mb-2"
                      style={{ backgroundColor: tag.color + '20' }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: tag.color }}
                      >
                        {tag.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 영업 정보 */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  영업 정보
                </Text>
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Feather name="clock" size={20} color="#6B7280" />
                    <Text className="ml-3 text-gray-700">{formatBusinessHours()}</Text>
                  </View>
                  {storeDetail.store_holiday && (
                    <View className="flex-row items-center">
                      <Feather name="calendar" size={20} color="#6B7280" />
                      <Text className="ml-3 text-gray-700">휴무일: {storeDetail.store_holiday}</Text>
                    </View>
                  )}
                  {storeDetail.store_phonenumber && (
                    <View className="flex-row items-center">
                      <Feather name="phone" size={20} color="#6B7280" />
                      <Text className="ml-3 text-gray-700">{storeDetail.store_phonenumber}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 오늘의 경기 일정 */}
              {todayGames.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">
                    오늘의 경기 일정
                  </Text>
                  {todayGames.map((game) => (
                    <View
                      key={game.id.toString()}
                      className="flex-row items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-8 h-8 bg-mainOrange rounded-lg justify-center items-center mr-3">
                          <Text className="text-white text-xs font-bold">
                            <Text>{game.sport === '축구' ? '⚽' : '🏀'}</Text>
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-gray-900">{game.teams}</Text>
                          <Text className="text-sm text-gray-600">{game.time}</Text>
                        </View>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: game.statusColor + '20' }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: game.statusColor }}
                        >
                          {game.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* 시설 정보 */}
              {facilities.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">
                    시설 정보
                  </Text>
                  <View className="space-y-2">
                    {facilities.map((facility, index) => (
                      <View key={index.toString()} className="flex-row items-center">
                        <Feather name={facility.icon as any} size={20} color="#6B7280" />
                        <Text className="ml-3 text-gray-700">{facility.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 주소 */}
              {storeDetail.store_address && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">
                    주소
                  </Text>
                  <Text className="text-gray-700 mb-3">{storeDetail.store_address}</Text>
                  <View className="w-full h-32 bg-gray-200 rounded-lg justify-center items-center">
                    <Feather name="map-pin" size={24} color="#9CA3AF" />
                    <Text className="text-gray-500 mt-2">지도 이미지</Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* 하단 액션 버튼 */}
          <View className="px-4 py-4 bg-white border-t border-gray-200">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleSharePress}
                className="flex-1 py-3 bg-mainOrange rounded-lg"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-medium">공유하기</Text>
              </TouchableOpacity>
              
              {actualIsHost && (
                <TouchableOpacity
                  onPress={handleSelectPress}
                  className="flex-1 py-3 bg-mainOrange rounded-lg"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-center font-medium">선택하기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
