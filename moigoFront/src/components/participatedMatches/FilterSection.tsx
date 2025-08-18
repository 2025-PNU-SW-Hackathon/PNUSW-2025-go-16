import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import FilterButton from './FilterButton';
import type { MatchCategory, SortOption } from '@/types/reservation';

interface FilterSectionProps {
  selectedCategory: MatchCategory;
  selectedSort: SortOption;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
}

const categories: MatchCategory[] = ['전체', '축구', '야구', '농구', '격투기', '게임'];
const sortOptions: SortOption[] = ['최신순', '오래된순'];

export default function FilterSection({
  selectedCategory,
  selectedSort,
  onCategoryChange,
  onSortChange,
}: FilterSectionProps) {
  return (
    <View className="mb-6">
      {/* 종목 필터 */}
      <View className="flex-row items-center justify-center mb-4">
        <Text className="mr-4 text-base font-medium text-mainDark">종목:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {categories.map((category) => (
            <FilterButton
              key={category}
              title={category}
              isSelected={selectedCategory === category}
              onPress={() => onCategoryChange(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 정렬 옵션 */}
      <View className="flex-row items-center justify-center">
        <Text className="mr-4 text-base font-medium text-mainDark">정렬:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {sortOptions.map((sort) => (
            <FilterButton
              key={sort}
              title={sort}
              isSelected={selectedSort === sort}
              onPress={() => onSortChange(sort)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
