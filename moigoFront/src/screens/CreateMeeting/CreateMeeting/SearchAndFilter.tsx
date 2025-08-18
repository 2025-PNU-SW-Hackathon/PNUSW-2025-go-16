import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import SearchBar from '@/components/common/SearchBar';
import TagChip from '@/components/common/TagChip';
import { COLORS } from '@/constants/colors';

interface SearchAndFilterProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onFilterPress: () => void;
  filterOptions: string[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedLocations: string[];
  toggleLocation: (location: string) => void;
}

// 검색 및 필터 컴포넌트
export default function SearchAndFilter({
  searchText,
  setSearchText,
  onFilterPress,
  filterOptions,
  selectedFilter,
  setSelectedFilter,
  selectedLocations,
  toggleLocation,
}: SearchAndFilterProps) {
  return (
    <>
      <View className="py-1">
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          onFilterPress={onFilterPress}
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
            <View className="flex-row items-center gap-2">
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
    </>
  );
}
