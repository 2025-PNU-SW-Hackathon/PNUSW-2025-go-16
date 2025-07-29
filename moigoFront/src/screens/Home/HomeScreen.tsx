// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';
import TagChip from '@/components/common/TagChip';
import EventCard from '@/screens/Home/EventCard';
import { mockEvents } from '@/mocks/events';

const filterOptions = ['전체', '축구', '야구', '농구', '격투기', '게임'];

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('서울');

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* 검색바 */}
        <View className="px-4 py-3 bg-white">
          <View className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg">
            <Feather name="search" size={20} color={COLORS.mainDarkGray} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="경기명, 장소 검색"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* 필터 버튼들 */}
        <View className="px-4 py-3 bg-white">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  className={`px-4 py-2 rounded-full ${
                    selectedFilter === filter ? 'bg-mainOrange' : 'bg-gray-200'
                  }`}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    className={`font-medium ${
                      selectedFilter === filter ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 위치 필터 */}
        <View className="px-4 py-2 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TagChip
              label={`${locationFilter}   x`}
              color={`${COLORS.mainOrange}20`}
              textColor={`${COLORS.mainOrange}`}
              classNameView="p-2 w-16 items-center justify-center"
              classNameText="text-sm"
            />
          </View>
        </View>

        {/* 매칭 목록 헤더 */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white">
          <Text className="text-xl font-bold text-gray-800">매칭 목록</Text>
          <Text className="text-gray-600 text-md">총 {mockEvents.length}개</Text>
        </View>

        {/* 매칭 목록 */}
        <View className="px-4 pb-20">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity
        className="absolute items-center justify-center rounded-full shadow-lg right-6 bottom-6 w-14 h-14 bg-mainOrange"
        onPress={() => Alert.alert('새 이벤트', '새 이벤트를 만드시겠습니까?')}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
