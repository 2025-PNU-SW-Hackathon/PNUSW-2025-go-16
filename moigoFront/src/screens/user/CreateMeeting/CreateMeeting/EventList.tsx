import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import TagChip from '@/components/common/TagChip';
import { COLORS } from '@/constants/colors';
import type { MatchDTO } from '@/types/DTO/reservations';

const { width: screenWidth } = Dimensions.get('window');

interface EventListProps {
  groupedEvents: MatchDTO[][];
  selectedEventId: string | null;
  handleSelectEvent: (eventId: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  handleViewableItemsChanged: (info: any) => void;
  viewabilityConfig: any;
}

// 경기 리스트 컴포넌트
export default function EventList({
  groupedEvents,
  selectedEventId,
  handleSelectEvent,
  currentPage,
  setCurrentPage,
  handleViewableItemsChanged,
  viewabilityConfig,
}: EventListProps) {
  const renderEventGroup = ({ item: events, index }: { item: MatchDTO[]; index: number }) => (
    <View style={{ width: screenWidth - 32, paddingHorizontal: 16 }}>
      {events.map((event: MatchDTO) => {
        // MatchDTO에서 id 필드 사용
        let eventId: string;
        
        if (event.id !== undefined && event.id !== null) {
          eventId = event.id.toString();
        } else {
          console.warn('경기 데이터에 유효한 ID가 없습니다:', event);
          eventId = `unknown_${Math.random()}`; // 고유한 문자열 생성
        }
        
        const isSelected = selectedEventId === eventId;
        
        // MatchDTO에서 데이터 추출
        const eventTitle = `${event.home_team} vs ${event.away_team}`;
        const eventTime = new Date(event.match_date).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const eventCategory = event.competition_code;
        
        return (
          <View
            key={eventId}
            className={`mb-4 border rounded-lg p-3 ${
              isSelected ? 'border-mainOrange' : 'border-gray-200'
            }`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <TagChip
                label={eventCategory}
                color={`${COLORS.mainOrange}20`}
                textColor={COLORS.mainOrange}
                classNameView="px-2 py-1"
                classNameText="text-xs font-medium"
              />
              <Text className="text-gray-500">
                {eventTime}
              </Text>
            </View>

            <View className="flex-row justify-between items-center my-4">
              <Text className="flex-1 text-center">
                {eventTitle}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                console.log('경기 선택:', { eventId, event });
                handleSelectEvent(eventId);
              }}
              className={`mt-2 p-2 rounded ${
                isSelected ? 'bg-mainOrange' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center ${
                  isSelected ? 'text-white' : 'text-mainOrange'
                }`}
              >
                {isSelected ? '선택됨' : '선택하기'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );

  return (
    <>
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
            length: screenWidth - 32,
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
    </>
  );
}
