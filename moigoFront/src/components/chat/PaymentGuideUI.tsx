import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { PaymentGuideData } from '@/types/ChatTypes';

interface PaymentGuideUIProps {
  data: PaymentGuideData;
  currentUserId?: string;
  onPaymentComplete?: () => void;
  isLoading?: boolean;
}

export default function PaymentGuideUI({ 
  data, 
  currentUserId, 
  onPaymentComplete,
  isLoading = false 
}: PaymentGuideUIProps) {
  
  const depositedCount = data.progress.completed;
  const totalParticipants = data.progress.total;
  const totalDeposited = data.payment.per_person * depositedCount;
  
  return (
    <View className="mx-4 my-3 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FFF7ED' }}>
      {/* 상단 안내 */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {data.title}
          </Text>
          <Text className="text-sm text-gray-600">
            인당 예약금 {data.payment.per_person.toLocaleString()}원이 필요합니다
          </Text>
        </View>
        <Text className="text-sm font-medium text-orange-600">
          30분 내 입금 필수
        </Text>
      </View>

      {/* 참가자 목록 */}
      <View className="mb-4">
        {data.participants.map((participant, index) => (
          <View key={participant.user_id}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {/* 아바타 */}
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  participant.user_id === data.started_by ? 'bg-mainOrange' : 'bg-gray-300'
                }`}>
                  <Text className={`text-xs font-bold ${
                    participant.user_id === data.started_by ? 'text-white' : 'text-gray-700'
                  }`}>
                    {participant.user_id === data.started_by ? '방' : '참'}
                  </Text>
                </View>
                
                {/* 이름 */}
                <Text className="text-sm font-medium text-gray-900 flex-1">
                  {participant.user_name}
                </Text>
              </View>

              {/* 입금 상태 */}
              {participant.status === 'completed' ? (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-green-600">
                    입금완료
                  </Text>
                </View>
              ) : participant.user_id === currentUserId ? (
                <TouchableOpacity 
                  className="bg-mainOrange px-3 py-1 rounded-full"
                  onPress={onPaymentComplete}
                  disabled={isLoading}
                >
                  <Text className="text-sm font-medium text-white">
                    {isLoading ? '처리중...' : '입금하기'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-gray-500">
                    대기중
                  </Text>
                </View>
              )}
            </View>
            {index < data.participants.length - 1 && (
              <View className="border-b border-gray-100 mt-3 mb-2" />
            )}
          </View>
        ))}
      </View>

      {/* 하단 요약 */}
      <View className="bg-white rounded-xl p-3">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-base font-semibold text-gray-900">
              들어온 예약금
            </Text>
            <Text className="text-xs text-gray-500">
              {depositedCount}/{totalParticipants}명 입금완료
            </Text>
          </View>
          <Text className="text-xl font-bold text-mainOrange">
            {totalDeposited.toLocaleString()}원
          </Text>
        </View>
      </View>
    </View>
  );
}