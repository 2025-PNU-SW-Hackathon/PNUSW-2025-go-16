import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { useCreateMeeting } from '@/hooks/useCreateMeeting';
import SearchBar from '@/components/common/SearchBar';
import PrimaryButton from '@/components/common/PrimaryButton';
import FilterModal from '@/screens/Home/FilterModal';
import { COLORS } from '@/constants/colors';
import TagChip from '@/components/common/TagChip';

const { width: screenWidth } = Dimensions.get('window');

export default function CreateMeeting() {
  const navigation = useNavigation();
  const {
    events,
    selectedEventId,
    handleSelectEvent,
    searchText,
    setSearchText,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    filteredEvents,
    // 필터 모달 관련
    isFilterModalVisible,
    setIsFilterModalVisible,
    filterLocations,
    selectedLocations,
    toggleLocation,
    resetFilters,
    // 페이지네이션 관련
    currentPage,
    setCurrentPage,
    // 폼 관련
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    onSubmit,
    isFormValid,
  } = useCreateMeeting();

  // 폼 값들
  const meetingName = watch('meetingName');
  const maxPeople = watch('maxPeople');
  const description = watch('description');

  // FlatList 렌더링 함수 - 3개씩 그룹으로 렌더링
  const renderEventGroup = ({ item: events, index }: { item: any[]; index: number }) => (
    <View style={{ width: screenWidth - 32, paddingHorizontal: 16 }}>
      {events.map((event: any) => (
        <View
          key={event.id}
          className={`mb-4 border rounded-lg p-3 ${
            selectedEventId === event.id ? 'border-mainOrange' : 'border-gray-200'
          }`}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-mainOrange">{event.league}</Text>
            <Text className="text-gray-500">{event.time}</Text>
          </View>
          
          <View className="flex-row justify-between items-center my-4">
            <Text className="">{event.home}</Text>
            <Text className="text-gray-500">vs</Text>
            <Text className="">{event.away}</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleSelectEvent(event.id)}
            className={`mt-2 p-2 rounded ${
              selectedEventId === event.id ? 'bg-mainOrange' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center ${
                selectedEventId === event.id ? 'text-white' : 'text-mainOrange'
              }`}
            >
              {selectedEventId === event.id ? '선택됨' : '선택하기'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  // 3개씩 그룹으로 데이터 분할
  const groupedEvents = [];
  for (let i = 0; i < filteredEvents.length; i += 3) {
    groupedEvents.push(filteredEvents.slice(i, i + 3));
  }

  // 스와이프 핸들러
  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">모임 만들기</Text>
      </View>

      {/* 필터 모달 */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filterOptions={filterOptions}
        filterLocations={filterLocations}
        selectedFilter={selectedFilter}
        selectedLocations={selectedLocations}
        setSelectedFilter={setSelectedFilter}
        toggleLocation={toggleLocation}
        resetFilters={resetFilters}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 검색바 */}
        <View className="py-1">
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            onFilterPress={() => setIsFilterModalVisible(true)}
          />
        </View>

        <View className="mb-4 border-b border-gray-200">
          {/* 필터 버튼들 */}
          <View className="px-4 mb-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {filterOptions.map((option: string) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setSelectedFilter(option)}
                    className={`px-4 py-2 rounded-full ${
                      selectedFilter === option ? 'bg-mainOrange' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`${
                        selectedFilter === option ? 'text-white font-bold' : 'text-gray-500'
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          {/* 선택된 위치 표시 */}
          {selectedLocations.length > 0 && (
            <View className="px-4 pb-2 bg-white">
              <View className="flex-row gap-2 items-center">
                {selectedLocations.map((location) => (
                  <TouchableOpacity key={location} onPress={() => toggleLocation(location)}>
                    <TagChip
                      label={`${location}   x`}
                      color={`${COLORS.mainOrange}20`}
                      textColor={`${COLORS.mainOrange}`}
                      classNameView="p-1.5 w-16 items-center justify-center"
                      classNameText="text-sm"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 경기 리스트 - FlatList로 변경 */}
        <View className="px-4">
          <FlatList
            data={groupedEvents}
            renderItem={renderEventGroup}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(data, index) => ({
              length: screenWidth - 32, // padding 제외
              offset: (screenWidth - 32) * index,
              index,
            })}
            initialScrollIndex={currentPage}
            windowSize={3}
            maxToRenderPerBatch={6}
            updateCellsBatchingPeriod={100}
          />
        </View>

        {/* 페이지네이션 점 */}
        {groupedEvents.length > 1 && (
          <View className="flex-row justify-center items-center py-4">
            {Array.from({ length: groupedEvents.length }, (_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentPage(index)}
                className={`mx-1 w-2 h-2 rounded-full ${
                  currentPage === index ? 'bg-mainOrange' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        )}

        {/* 모임 이름 */}
        <View className="px-4 mt-4">
          <View className="flex-row gap-2 items-center">
            <Text className="mb-2 font-bold">모임 이름</Text>
            <Text className="text-2xl text-mainRed">*</Text>
          </View>
          <TextInput
            value={meetingName}
            onChangeText={(text) => setValue('meetingName', text)}
            placeholder="예: 토트넘 vs 맨시티 같이 볼 분!"
            maxLength={50}
            className="p-3 rounded-xl border border-gray-200"
          />
          {errors.meetingName && (
            <Text className="mt-1 text-sm text-red-500">{errors.meetingName.message}</Text>
          )}
        </View>

        {/* 최대 인원 수 */}
        <View className="px-4 mt-4">
          <View className="flex-row gap-2 items-center">
            <Text className="mb-2 font-bold">최대 인원 수</Text>
            <Text className="text-2xl text-mainRed">*</Text>
          </View>

          <View className="flex-row justify-between items-center px-2 py-2 rounded-xl border border-gray-200">
            <Text className="text-sm text-mainLightGrayText">최대 인원 수를 선택해주세요.</Text>
            <View className="flex-row items-center pr-4">
              <TouchableOpacity
                onPress={() => setValue('maxPeople', Math.max(1, maxPeople - 1))}
                className="justify-center items-center w-8 h-8 rounded-full bg-mainGray"
              >
                <Text className="text-xl">-</Text>
              </TouchableOpacity>
              <Text className="mx-4 text-md">{maxPeople}</Text>
              <TouchableOpacity
                onPress={() => setValue('maxPeople', Math.min(50, maxPeople + 1))}
                className="justify-center items-center w-8 h-8 rounded-full bg-mainGray"
              >
                <Text className="text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {errors.maxPeople && (
            <Text className="mt-1 text-sm text-mainRed">{errors.maxPeople.message}</Text>
          )}
        </View>

        {/* 모임 설명 */}
        <View className="px-4 mt-4">
          <Text className="mb-2 font-bold">모임 설명</Text>
          <TextInput
            value={description}
            onChangeText={(text) => setValue('description', text)}
            placeholder="모임에 대한 간단한 설명을 작성해주세요"
            maxLength={300}
            multiline
            className="p-3 rounded-xl border border-gray-200 min-h-[80px]"
          />
          {errors.description && (
            <Text className="mt-1 text-sm text-red-500">{errors.description.message}</Text>
          )}
        </View>

        {/* 안내문구 */}
        <View className="p-4 m-4 bg-blue-50 rounded-xl border border-blue-200">
          <View className="flex-row gap-2 items-center">
          <Feather name="info" size={15} color="#2563EB" />
          <Text className="text-lg text-blue-600">모임 생성 안내</Text>
          </View>

          <Text className="pl-6 mt-2 text-sm text-blue-600">
            • 모든 필수 항목(*)을 입력해주세요{'\n'}• 생성된 모임은 다른 사용자들이 참여할 수
            있습니다
          </Text>
        </View>

        {/* 스크롤 끝 여백 */}
        <View className="h-24" />
      </ScrollView>

      {/* 고정된 등록하기 버튼 */}
      <View className="absolute right-0 bottom-0 left-0 p-4 pb-10 bg-white border-t border-gray-200">
        <PrimaryButton
          title="등록하기"
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormValid}
          color={isFormValid ? COLORS.mainOrange : '#ccc'}
        />
      </View>
    </SafeAreaView>
  );
}
