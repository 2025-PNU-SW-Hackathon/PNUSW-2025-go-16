// src/screens/HomeScreen.tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';

import TagChip from '@/components/common/TagChip';
import SearchBar from '@/components/common/SearchBar';
import Toast from '@/components/common/Toast';

import EventCard from '@/screens/user/Home/EventCard';
import FilterModal from '@/screens/user/Home/FilterModal';
import EnterModal from '@/screens/user/Home/EnterModal';
import FilterBtn from '@/screens/user/Home/FilterBtn';
import PlusMeetingBtn from '@/screens/user/Home/PlusMeetingBtn';

import { useHomeScreen } from '@/hooks/useHomeScreen';

export default function HomeScreen() {
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
  } = useHomeScreen();

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

      <ScrollView className="flex-3">
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
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-lg text-gray-500 mb-2">
                {isLoading ? '데이터를 불러오는 중...' : '매칭이 없습니다'}
              </Text>
              <Text className="text-sm text-gray-400 text-center">
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
