import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface FilterSectionProps {
  onFilterPress: () => void;
  activeFilters?: string[];
}

export default function FilterSection({ onFilterPress, activeFilters = [] }: FilterSectionProps) {
  return (
    <View className="px-4 py-3 bg-white border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-900">추천 장소</Text>
        <TouchableOpacity 
          onPress={onFilterPress}
          className="flex-row items-center px-3 py-1 bg-gray-100 rounded-full"
          activeOpacity={0.7}
        >
          <Feather name="filter" size={16} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-600 font-medium">필터</Text>
          {activeFilters.length > 0 && (
            <View className="ml-1 w-5 h-5 bg-mainOrange rounded-full justify-center items-center">
              <Text className="text-xs text-white font-bold">{(activeFilters.length || 0).toString()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
