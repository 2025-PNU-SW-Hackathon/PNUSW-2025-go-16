// src/screens/HomeScreen.tsx
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useCallback, useState } from 'react';

import TagChip from '@/components/common/TagChip';
import SearchBar from '@/components/common/SearchBar';
import Toast from '@/components/common/Toast';

import EventCard from '@/screens/user/Home/EventCard';
import FilterModal from '@/screens/user/Home/FilterModal';
import EnterModal from '@/screens/user/Home/EnterModal';
import FilterBtn from '@/screens/user/Home/FilterBtn';
import PlusMeetingBtn from '@/screens/user/Home/PlusMeetingBtn';

import { useUserHomeScreen } from '@/hooks/useHomeScreen';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    filterOptions,
    filterLocations,
    selectedFilter,
    selectedLocations,
    searchText,
    isFilterModalVisible,
    isEnterModalVisible,
    selectedEvent,
    filteredEvents,
    isLoading,
    setSelectedFilter,
    setSearchText,
    toggleLocation,
    resetFilters,
    handleParticipate,
    setIsFilterModalVisible,
    closeFilterModal,
    closeEnterModal,
    showToast,
    toastMessage,
    toastType,
    hideToast,
    showSuccessToast,
    showErrorToast,
    handleRefresh,
  } = useUserHomeScreen();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 모임 목록 새로고침
      await handleRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [handleRefresh]);

  return (
    <View className="flex-1 bg-white">
      {/* 필터 모달과 참여 모달 */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={closeFilterModal}
        filterOptions={filterOptions}
        filterLocations={filterLocations}
        selectedFilter={selectedFilter}
        selectedLocations={selectedLocations}
        setSelectedFilter={setSelectedFilter}
        toggleLocation={toggleLocation}
        resetFilters={resetFilters}
      />
      <EnterModal 
        visible={isEnterModalVisible} 
        onClose={closeEnterModal} 
        event={selectedEvent}
        showSuccessToast={showSuccessToast}
        showErrorToast={showErrorToast}
      />
      
      {/* 토스트 메시지 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
      />

      <ScrollView 
        className="flex-3"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']} // iOS - 메인 오렌지 색상
            tintColor="#FF6B35"  // iOS
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {/* 검색바 */}
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          onFilterPress={() => setIsFilterModalVisible(true)}
        />

        {/* 필터 버튼들 */}
        <FilterBtn
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />

        {/* 선택된 위치 표시 */}
        {selectedLocations.length > 0 && (
          <View className="px-4 py-2 bg-white border-b border-gray-200">
            <View className="flex-row items-center">
              {selectedLocations.map((location, index) => (
                <TouchableOpacity key={location} onPress={() => toggleLocation(location)} className={index > 0 ? "ml-2" : ""}>
                  <TagChip
                    label={`${location}   x`}
                    color={`${COLORS.mainOrange}20`}
                    textColor={`${COLORS.mainOrange}`}
                    classNameView="p-2 w-16 items-center justify-center"
                    classNameText="text-sm"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 매칭 목록 헤더 */}
        <View className="flex-row justify-between items-center px-4 py-3 bg-white">
          <Text className="text-2xl font-bold text-gray-800">매칭 목록</Text>
          <Text className="text-sm text-gray-600">총 {filteredEvents.length}개</Text>
        </View>

        {/* 매칭 목록 */}
        <View className="px-4 pb-20">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event: any, index) => (
              <EventCard
                key={event.id || event.reservation_id || index}
                event={event}
                onParticipate={() => handleParticipate(event)}
              />
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="mb-2 text-lg text-gray-500">
                {isLoading ? '데이터를 불러오는 중...' : '매칭이 없습니다'}
              </Text>
              <Text className="text-sm text-center text-gray-400">
                {isLoading 
                  ? '잠시만 기다려주세요' 
                  : '다른 조건으로 검색해보세요'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <PlusMeetingBtn />
    </View>
  );
}
