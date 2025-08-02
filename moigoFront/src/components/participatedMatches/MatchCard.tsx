import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ParticipatedMatch } from '@/types/reservation';
import { COLORS } from '@/constants/colors';

interface MatchCardProps {
  match: ParticipatedMatch;
  onWriteReview: (match: ParticipatedMatch) => void;
}

export default function MatchCard({ match, onWriteReview }: MatchCardProps) {
  return (
    <View className="p-4 mb-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* 제목 */}
      <Text className="mb-2 text-lg font-bold text-mainDark">
        {match.title}
      </Text>
      
      {/* 날짜와 시간 */}
      <Text className="mb-1 text-sm text-mainGrayText">
        {match.date} {match.time}
      </Text>
      
      {/* 위치 */}
      <Text className="mb-3 text-sm text-mainGrayText">
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
          <Text className="ml-1 text-sm text-mainGrayText">
            총 {match.participants}명 참여
          </Text>
        </View>
        
        {/* 리뷰 작성 버튼 */}
        <TouchableOpacity
          onPress={() => onWriteReview(match)}
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