import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useParticipatedMatches } from '@/hooks/useParticipatedMatches';
import FilterSection from '@/components/participatedMatches/FilterSection';
import MatchCard from '@/components/participatedMatches/MatchCard';

export default function ParticipatedMatchesScreen() {
  const {
    selectedCategory,
    selectedSort,
    filteredAndSortedMatches,
    handleCategoryChange,
    handleSortChange,
    handleWriteReview,
  } = useParticipatedMatches();

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* 설명 텍스트 */}
        <View className="bg-mainGray ">
          <Text className="m-4 text-base text-mainGrayText">
            참여했던 경기 모임들을 다시 확인할 수 있어요.
          </Text>
        </View>

        <View className="flex-col p-4">
          {/* 필터 섹션 */}
          <FilterSection
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
          />

          {/* 매칭 목록 */}
          <View className="mb-4">
            {filteredAndSortedMatches.map((match) => (
              <MatchCard key={match.id} match={match} onWriteReview={handleWriteReview} />
            ))}
          </View>

          {/* 빈 상태 */}
          {filteredAndSortedMatches.length === 0 && (
            <View className="items-center justify-center flex-1 py-20">
              <Text className="mt-4 text-lg font-medium text-mainGrayText">
                참여한 매칭이 없습니다
              </Text>
              <Text className="mt-2 text-sm text-mainGrayText">새로운 매칭에 참여해보세요!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
