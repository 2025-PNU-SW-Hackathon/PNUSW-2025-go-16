import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  hasDeposited: boolean;
}

interface ReservationDepositInfoProps {
  participants: Participant[];
  depositAmount: number; // 인당 예약금
  timeLimit: number; // 입금 제한 시간 (분)
  onDeposit?: (participantId: string) => void; // 입금 처리 콜백
}

export default function ReservationDepositInfo({ 
  participants, 
  depositAmount, 
  timeLimit,
  onDeposit
}: ReservationDepositInfoProps) {
  const depositedCount = participants.filter(p => p.hasDeposited).length;
  const totalDeposited = depositedCount * depositAmount;

  return (
    <View className="mx-4 my-3 bg-white rounded-2xl p-4 shadow-sm">
      {/* 상단 안내 */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            예약금 안내
          </Text>
          <Text className="text-sm text-gray-600">
            인당 예약금 {depositAmount.toLocaleString()}원이 필요합니다
          </Text>
        </View>
        <View className="bg-orange-100 px-3 py-1 rounded-full">
          <Text className="text-sm font-medium text-orange-600">
            {timeLimit}분 내 입금 필수
          </Text>
        </View>
      </View>

      {/* 참가자 목록 */}
      <View className="space-y-3 mb-4">
        {participants.map((participant) => (
          <View key={participant.id} className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {/* 아바타 */}
              <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                participant.isHost ? 'bg-mainOrange' : 'bg-gray-300'
              }`}>
                <Text className={`text-xs font-bold ${
                  participant.isHost ? 'text-white' : 'text-gray-700'
                }`}>
                  {participant.avatar}
                </Text>
              </View>
              
              {/* 이름 */}
              <Text className="text-sm font-medium text-gray-900 flex-1">
                {participant.name}
              </Text>
            </View>

            {/* 입금 상태 */}
            {participant.hasDeposited ? (
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-sm font-medium text-green-600">
                  입금완료
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                className="bg-mainOrange px-3 py-1 rounded-full"
                onPress={() => onDeposit?.(participant.id)}
              >
                <Text className="text-sm font-medium text-white">
                  입금하기
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* 하단 요약 */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View>
          <Text className="text-sm font-medium text-gray-900">
            들어온 예약금
          </Text>
          <Text className="text-xs text-gray-600">
            {depositedCount}/{participants.length}명 입금완료
          </Text>
        </View>
        <Text className="text-lg font-bold text-mainOrange">
          {totalDeposited.toLocaleString()}원
        </Text>
      </View>
    </View>
  );
} 