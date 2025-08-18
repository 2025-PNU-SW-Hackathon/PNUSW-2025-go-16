// src/screens/HomeScreen.tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';

import TagChip from '@/components/common/TagChip';
import SearchBar from '@/components/common/SearchBar';

import EventCard from '@/screens/Home/EventCard';
import FilterModal from '@/screens/Home/FilterModal';
import EnterModal from '@/screens/Home/EnterModal';
import FilterBtn from '@/screens/Home/FilterBtn';
import PlusMeetingBtn from '@/screens/Home/PlusMeetingBtn';

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
    setSelectedFilter,
    setSearchText,
    toggleLocation,
    resetFilters,
    handleParticipate,
    setIsFilterModalVisible,
    closeFilterModal,
    closeEnterModal,
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
      <EnterModal visible={isEnterModalVisible} onClose={closeEnterModal} event={selectedEvent} />

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
          <Text className="text-gray-600 text-sm">총 {filteredEvents.length}개</Text>
        </View>

        {/* 매칭 목록 */}
        <View className="px-4 pb-20">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onParticipate={() => handleParticipate(event)}
            />
          ))}
        </View>
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <PlusMeetingBtn />
    </View>
  );
}
