import React from 'react';
import { View, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useCreateMeeting } from '@/hooks/CreateMeeting/index';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS } from '@/constants/colors';

import FilterModal from '@/screens/user/Home/FilterModal';
import CreateModal from '@/screens/user/CreateMeeting/CreateModal/index';

import CreateMeetingHeader from './CreateMeetingHeader';
import SearchAndFilter from './SearchAndFilter';
import EventList from './EventList';
import MeetingForm from './MeetingForm';
import InfoSection from './InfoSection';

// 메인 컴포넌트
export default function CreateMeeting() {
  const navigation = useNavigation();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = React.useState(false);

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
    watch,
    setValue,
    errors,
    isFormValid,
    // API 관련
    isCreating,
    createError,
    onSubmit,
  } = useCreateMeeting();

  // 폼 값들
  const meetingName = watch('meetingName');
  const maxPeople = watch('maxPeople');
  const description = watch('description');

  // 등록 확인 핸들러
  const handleConfirmRegistration = async () => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isCreating) {
      console.log('이미 모임 생성 중입니다. 중복 요청 방지');
      return;
    }

    try {
      console.log('모임 등록 확인:', { selectedEventId, meetingName, maxPeople, description });
      
      const formData = {
        meetingName,
        maxPeople,
        description,
      };
      
      await onSubmit(formData);
      
      // 성공 시 모달 닫고 홈으로 이동
      setIsConfirmModalVisible(false);
      Alert.alert('성공', '모임이 성공적으로 생성되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            // 홈 화면으로 이동
            navigation.navigate('Main' as never);
          }
        }
      ]);
    } catch (error) {
      console.error('모임 등록 실패:', error);
      Alert.alert('실패', '모임 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 모임 생성 취소 핸들러
  const handleCancelRegistration = () => {
    Alert.alert(
      '모임 생성 취소',
      '모임 생성을 취소하시겠습니까?',
      [
        {
          text: '계속 작성',
          style: 'cancel'
        },
        {
          text: '취소',
          style: 'destructive',
          onPress: () => {
            // 모달 닫고 이전 화면으로 이동
            setIsConfirmModalVisible(false);
            navigation.goBack();
          }
        }
      ]
    );
  };

  // 디버깅 로그
  console.log('CreateMeeting 상태:', {
    selectedEventId,
    eventsLength: events.length,
    isConfirmModalVisible,
    isFormValid,
    isCreating,
    createError,
  });

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
      <CreateMeetingHeader onBack={() => navigation.goBack()} />

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

      {/* 등록 확인 모달 */}
      {selectedEventId && (
        <CreateModal
          isConfirmModalVisible={isConfirmModalVisible}
          setIsConfirmModalVisible={setIsConfirmModalVisible}
          selectedEventId={selectedEventId}
          maxPeople={maxPeople}
          meetingName={meetingName}
          description={description}
          handleConfirmRegistration={handleConfirmRegistration}
          handleCancelRegistration={handleCancelRegistration}
          events={events}
          isLoading={isCreating}
        />
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 검색 및 필터 */}
        <SearchAndFilter
          searchText={searchText}
          setSearchText={setSearchText}
          onFilterPress={() => setIsFilterModalVisible(true)}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedLocations={selectedLocations}
          toggleLocation={toggleLocation}
        />

        {/* 경기 리스트 */}
        <EventList
          groupedEvents={groupedEvents}
          selectedEventId={selectedEventId}
          handleSelectEvent={handleSelectEvent}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* 폼 */}
        <MeetingForm
          meetingName={meetingName}
          setMeetingName={(text) => setValue('meetingName', text)}
          maxPeople={maxPeople}
          setMaxPeople={(value) => setValue('maxPeople', value)}
          description={description}
          setDescription={(text) => setValue('description', text)}
          errors={errors}
        />

        {/* 안내문구 */}
        <InfoSection />

        {/* 스크롤 끝 여백 */}
        <View className="h-24" />
      </ScrollView>

      {/* 고정된 등록하기 버튼 */}
      <View className="absolute right-0 bottom-0 left-0 p-4 pb-10 bg-white border-t border-gray-200">
        <PrimaryButton
          title="등록하기"
          onPress={() => setIsConfirmModalVisible(true)}
          disabled={!isFormValid}
          color={isFormValid ? COLORS.mainOrange : '#ccc'}
        />
      </View>
    </SafeAreaView>
  );
}
