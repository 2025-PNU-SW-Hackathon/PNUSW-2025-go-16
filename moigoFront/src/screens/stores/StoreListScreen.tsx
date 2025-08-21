import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import StoreCard from '@/components/stores/StoreCard';
import FilterSection from '@/components/common/FilterSection';
import { useStoreList } from '@/hooks/queries/useStoreQueries';
import type { StoreListItemDTO } from '@/types/DTO/stores';
import Feather from 'react-native-vector-icons/Feather';
import { RouteProp } from '@react-navigation/native';

type StoreListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreList'>;

export default function StoreListScreen() {
  const navigation = useNavigation<StoreListScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'StoreList'>>();
  const { chatRoom, isHost } = route.params || {};
  
  const [filterParams, setFilterParams] = useState({
    region: '',
    date: '',
    category: '',
    keyword: '',
  });

  // 가게 목록 조회
  const { data: storeListData, isLoading, error, refetch } = useStoreList(filterParams);

  // 디버깅용 로그
  console.log('=== StoreListScreen 데이터 상태 ===');
  console.log('isLoading:', isLoading);
  console.log('error:', error);
  console.log('storeListData:', storeListData);
  console.log('storeListData?.data:', storeListData?.data);
  console.log('storeListData?.data?.length:', storeListData?.data?.length);
  
  // 썸네일 URL 상세 로그
  if (storeListData?.data && storeListData.data.length > 0) {
    console.log('🖼️ === 가게 썸네일 URL 분석 ===');
    storeListData.data.forEach((store, index) => {
      console.log(`가게 ${index + 1}:`, {
        store_id: store.store_id,
        store_name: store.store_name,
        store_thumbnail: store.store_thumbnail,
        thumbnail_type: typeof store.store_thumbnail,
        thumbnail_length: store.store_thumbnail?.length || 0,
        is_valid_url: store.store_thumbnail && store.store_thumbnail.startsWith('http')
      });
    });
  }
  
  // Key 중복 체크
  if (storeListData?.data) {
    const storeIds = storeListData.data.map(store => store.store_id);
    const duplicateIds = storeIds.filter((id, index) => storeIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.warn('🚨 중복된 store_id 발견:', duplicateIds);
    }
    
    console.log('📊 Store IDs:', storeIds);
    console.log('📊 Store ID 타입들:', storeIds.map(id => typeof id));
  }

  // 가게 카드 클릭 핸들러
  const handleStorePress = (store: StoreListItemDTO) => {
    console.log('=== StoreCard 클릭됨 ===');
    console.log('store:', store);
    console.log('store.store_id 원본값:', store?.store_id);
    console.log('store.store_id 타입:', typeof store?.store_id);
    console.log('store.store_id 길이:', String(store?.store_id || 0).length);
    console.log('chatRoom:', chatRoom);
    console.log('isHost:', isHost);
    
    // storeId를 숫자로 변환 (안전하게)
    const numericStoreId = Number(store?.store_id || 0);
    console.log('변환된 storeId:', numericStoreId, '타입:', typeof numericStoreId);
    console.log('isNaN 체크:', isNaN(numericStoreId));
    
    // 유효한 storeId인지 확인
    if (numericStoreId > 0) {
      navigation.navigate('StoreDetail', { 
        storeId: numericStoreId,
        chatRoom: chatRoom || undefined,
        isHost: isHost || false
      });
    } else {
      console.error('유효하지 않은 storeId:', numericStoreId);
    }
  };

  // 필터 버튼 클릭 핸들러
  const handleFilterPress = () => {
    // TODO: 필터 모달 열기
    Alert.alert('필터', '필터 옵션을 선택하세요.');
  };

  // 뒤로가기 핸들러
  const handleBackPress = () => {
    navigation.goBack();
  };

  // 활성 필터 목록 (예시)
  const activeFilters = [];
  if (filterParams.region && filterParams.region.trim()) activeFilters.push('지역');
  if (filterParams.category && filterParams.category.trim()) activeFilters.push('카테고리');
  if (filterParams.date && filterParams.date.trim()) activeFilters.push('날짜');
  if (filterParams.keyword && filterParams.keyword.trim()) activeFilters.push('키워드');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white shadow-sm">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">가게 정하기</Text>
        <View className="w-10" />
      </View>

      {/* 필터 섹션 */}
      <FilterSection 
        onFilterPress={handleFilterPress}
        activeFilters={activeFilters}
      />

      {/* 가게 목록 */}
      <ScrollView 
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text className="mt-4 text-gray-600">가게 목록을 불러오는 중...</Text>
          </View>
        ) : (storeListData?.data && Array.isArray(storeListData.data) && storeListData.data.length > 0) ? (
          <>
            {storeListData.data.map((store, index) => (
              <StoreCard
                key={`store-${store?.store_id || 'unknown'}-${index}-${store?.store_name || 'noname'}`}
                store={store}
                onPress={handleStorePress}
              />
            ))}
          </>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-20">
            <Feather name="alert-circle" size={48} color="#EF4444" />
            <Text className="mt-4 text-gray-600 text-center">가게 목록을 불러오는데 실패했습니다.</Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              {error instanceof Error ? (error.message || '오류가 발생했습니다.') : '네트워크 연결을 확인해주세요.'}
            </Text>
            <TouchableOpacity 
              className="bg-mainOrange px-6 py-3 rounded-lg"
              onPress={() => refetch()}
            >
              <Text className="text-white font-semibold">다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Feather name="search" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-gray-600">조건에 맞는 가게가 없습니다.</Text>
            <Text className="text-sm text-gray-500">다른 조건으로 검색해보세요.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
