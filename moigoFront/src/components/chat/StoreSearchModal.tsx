import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatStoreList } from '@/hooks/queries/useStoreQueries';
import type { ChatStoreListItemDTO } from '@/types/DTO/stores';
import Feather from 'react-native-vector-icons/Feather';

interface StoreSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectStore: (store: ChatStoreListItemDTO) => void;
}

export default function StoreSearchModal({ isVisible, onClose, onSelectStore }: StoreSearchModalProps) {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 가게 목록 조회
  const { data: storeListData, isLoading, error, refetch } = useChatStoreList({
    keyword: searchKeyword,
    limit: 20
  });

  const handleSearch = () => {
    setSearchKeyword(keyword);
  };

  const handleSelectStore = (store: ChatStoreListItemDTO) => {
    onSelectStore(store);
    onClose();
  };

  const renderStoreItem = ({ item }: { item: ChatStoreListItemDTO }) => {
    // 가게 썸네일 URL 처리 (HTTPS)
    const getThumbnailUrl = (thumbnailUrl: string | null | undefined) => {
      if (!thumbnailUrl) return null;
      
      // 상대경로인 경우 HTTPS 절대 URL로 변환
      if (thumbnailUrl.startsWith('/')) {
        return `https://spotple.kr${thumbnailUrl}`;
      }
      
      // 절대 URL인 경우 그대로 사용
      return thumbnailUrl;
    };

    const thumbnailUrl = getThumbnailUrl(item.store_thumbnail);

    return (
      <TouchableOpacity
        onPress={() => handleSelectStore(item)}
        className="flex-row items-center p-4 bg-white border-b border-gray-100"
        activeOpacity={0.7}
      >
        {/* 가게 이미지 */}
        <View className="overflow-hidden mr-3 w-16 h-16 bg-gray-200 rounded-lg">
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="justify-center items-center w-full h-full bg-gray-300">
              <Feather name="image" size={20} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* 가게 정보 */}
        <View className="flex-1">
          <Text className="mb-1 text-base font-semibold text-gray-900">
            {item.store_name}
          </Text>
          
          <View className="flex-row items-center mb-1">
            <Text className="mr-1 text-sm text-yellow-400">
              {'★'.repeat(Math.floor(item.store_rating))}
              {'☆'.repeat(5 - Math.floor(item.store_rating))}
            </Text>
            <Text className="text-sm text-gray-600">
              {item.store_rating.toString()}
            </Text>
          </View>

          <Text className="text-sm text-gray-600" numberOfLines={1}>
            📍 {item.store_address}
          </Text>
        </View>

        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Feather name="x" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">가게 검색</Text>
          <View className="w-10" />
        </View>

        {/* 검색 입력 */}
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <View className="flex-row flex-1 items-center px-3 py-2 mr-2 bg-gray-100 rounded-lg">
              <Feather name="search" size={20} color="#6B7280" />
              <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder="가게명 또는 주소로 검색"
                className="flex-1 ml-2 text-base"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              onPress={handleSearch}
              className="px-4 py-2 rounded-lg bg-mainOrange"
              activeOpacity={0.8}
            >
              <Text className="font-medium text-white">검색</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 가게 목록 */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text className="mt-4 text-gray-600">가게를 검색하는 중...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-4">
            <Feather name="alert-circle" size={48} color="#EF4444" />
            <Text className="mt-4 text-center text-gray-600">가게 검색에 실패했습니다.</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="px-6 py-3 mt-4 rounded-lg bg-mainOrange"
            >
              <Text className="font-semibold text-white">다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : storeListData?.data && storeListData.data.length > 0 ? (
          <FlatList
            data={storeListData.data}
            renderItem={renderStoreItem}
            keyExtractor={(item) => item.store_id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : searchKeyword ? (
          <View className="flex-1 justify-center items-center px-4">
            <Feather name="search" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-center text-gray-600">
              "{searchKeyword}"에 대한 검색 결과가 없습니다.
            </Text>
            <Text className="mt-2 text-sm text-center text-gray-500">
              다른 키워드로 검색해보세요.
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center px-4">
            <Feather name="map-pin" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-center text-gray-600">
              가게명이나 주소를 입력하여 검색해보세요.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}






