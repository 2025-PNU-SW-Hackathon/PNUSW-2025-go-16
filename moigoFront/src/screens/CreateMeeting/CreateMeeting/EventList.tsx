import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface EventListProps {
  groupedEvents: any[][];
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
  const renderEventGroup = ({ item: events, index }: { item: any[]; index: number }) => (
    <View style={{ width: screenWidth - 32, paddingHorizontal: 16 }}>
      {events.map((event: any) => (
        <View
          key={event.id}
          className={`mb-4 border rounded-lg p-3 ${
            selectedEventId === event.id ? 'border-mainOrange' : 'border-gray-200'
          }`}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold text-mainOrange">{event.league}</Text>
            <Text className="text-gray-500">{event.time}</Text>
          </View>

          <View className="flex-row items-center justify-between my-4">
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
        <View className="flex-row items-center justify-center py-4">
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
