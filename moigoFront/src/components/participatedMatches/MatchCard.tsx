import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ParticipatedMatch } from '@/types/reservation';
import { COLORS } from '@/constants/colors';

interface MatchCardProps {
  match: ParticipatedMatch;
  onWriteReview: (matchId: string) => void;
}

export default function MatchCard({ match, onWriteReview }: MatchCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* 제목 */}
      <Text className="text-lg font-bold text-mainDark mb-2">
        {match.title}
      </Text>
      
      {/* 날짜와 시간 */}
      <Text className="text-sm text-mainGrayText mb-1">
        {match.date} {match.time}
      </Text>
      
      {/* 위치 */}
      <Text className="text-sm text-mainGrayText mb-3">
        {match.location}
      </Text>
      
      {/* 하단 정보 */}
      <View className="flex-row justify-between items-center">
        {/* 참여자 수 */}
        <View className="flex-row items-center">
          <Feather 
            name="users" 
            size={16} 
            color={COLORS.mainGrayText}
            className="mr-1"
          />
          <Text className="text-sm text-mainGrayText ml-1">
            총 {match.participants}명 참여
          </Text>
        </View>
        
        {/* 리뷰 작성 버튼 */}
        <TouchableOpacity
          onPress={() => onWriteReview(match.id)}
          className={`px-4 py-2 rounded-full ${
            match.hasReview 
              ? 'bg-gray-300' 
              : 'bg-mainOrange'
          }`}
          disabled={match.hasReview}
        >
          <Text className={`text-sm font-medium ${
            match.hasReview 
              ? 'text-gray-500' 
              : 'text-white'
          }`}>
            {match.hasReview ? '리뷰완료' : '리뷰쓰기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 