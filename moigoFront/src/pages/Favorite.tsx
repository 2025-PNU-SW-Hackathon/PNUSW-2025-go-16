// src/pages/Favorite.tsx

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TagChip from '@/components/common/TagChip';
import PrimaryButton from '@/components/common/PrimaryButton';
import Feather from 'react-native-vector-icons/Feather';

const places = [
  {
    id: 1,
    name: '챔피언 스포츠 펍',
    tags: [
      { label: '축구 중계', color: '#FF6B00', textColor: '#fff' },
      { label: '맥주', color: '#4F8CFF', textColor: '#fff' },
    ],
    address: '서울특별시 강남구 역삼로 123',
    distance: '2.3km',
    rating: 4.8,
    time: '17:00 - 03:00',
  },
  {
    id: 2,
    name: '스포츠 올스타 호프',
    tags: [
      { label: '야구 중계', color: '#FFB800', textColor: '#fff' },
      { label: '치킨', color: '#4FC37F', textColor: '#fff' },
    ],
    address: '서울특별시 마포구 홍대로 456',
    distance: '1.8km',
    rating: 4.6,
    time: '16:00 - 02:00',
  },
  {
    id: 3,
    name: '더 게임 스포츠 바',
    tags: [
      { label: 'NBA 중계', color: '#FF6B00', textColor: '#fff' },
      { label: '수제맥주', color: '#B36BFF', textColor: '#fff' },
    ],
    address: '서울특별시 서초구 서초대로 789',
    distance: '4.2km',
    rating: 4.5,
    time: '18:00 - 04:00',
  },
  {
    id: 4,
    name: '골든 스포츠 펍',
    tags: [
      { label: 'EPL 중계', color: '#FF6B00', textColor: '#fff' },
      { label: '피자', color: '#4FC37F', textColor: '#fff' },
      { label: '와인', color: '#FFB8B8', textColor: '#fff' },
    ],
    address: '서울특별시 용산구 이태원로 321',
    distance: '5.7km',
    rating: 4.9,
    time: '17:00 - 05:00',
  },
  {
    id: 5,
    name: '스포츠 팬 브루어리',
    tags: [
      { label: 'UFC 중계', color: '#FF6B00', textColor: '#fff' },
      { label: '수제버거', color: '#4FC37F', textColor: '#fff' },
    ],
    address: '서울특별시 성수동 서울숲길 567',
    distance: '8.1km',
    rating: 4.7,
    time: '15:00 - 03:00',
  },
];

export default function Favorite() {
  return (
    <SafeAreaView className="flex-1 bg-white " edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white shadow-sm">
        <Text className="text-lg font-bold text-gray-900">즐겨찾는 장소</Text>
        <TouchableOpacity className="p-2 rounded-full bg-mainGray">
          <Feather name="search" size={18} color="#6B7280" style={{ marginTop: 2 }} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="px-4 mt-4 "
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 py-2 ">
          <PrimaryButton title="+ 새로운 장소 추가" onPress={() => {}} color="#FF6B00" />
        </View>
        {places.map((place) => (
          <View key={place.id} className="p-4 mb-4 bg-white shadow-sm rounded-2xl">
            <View className="flex-row items-start justify-between">
              <Text className="text-base font-bold text-gray-900 mb-0.5">{place.name}</Text>
              <TouchableOpacity className="p-1 rounded-full bg-payInfoBg">
                <Feather name="x" size={18} color="#FF6B00" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap my-1">
              {place.tags.map((tag, idx) => (
                <TagChip key={idx} label={tag.label} color={tag.color} textColor={tag.textColor} />
              ))}
            </View>
            <Text className="mt-1 text-xs text-gray-500">📍 {place.address}</Text>
            <Text className="text-xs text-gray-500">현재 위치에서 {place.distance}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="mr-1 text-base text-yellow-400">★</Text>
              <Text className="mr-2 text-sm font-bold">{place.rating}</Text>
              <Text className="text-xs text-gray-400">{place.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
