import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  
  // 현재 사용자의 상태 확인
  const currentUserParticipant = data.participants.find(p => p.user_id === currentUserId);
  const isCurrentUserPaid = currentUserParticipant?.status === 'completed';
  
  // 방장 여부 확인
  const isHost = currentUserId === data.started_by;
  
  return (
    <View className="mx-4 mt-4 mb-2 p-4 rounded-2xl shadow-lg" 
          style={{ 
            backgroundColor: '#667eea' // React Native에서는 linear gradient 대신 단색 사용
          }}>
      
      {/* 헤더 */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Feather name="credit-card" size={20} color="white" />
          <Text className="text-lg font-bold text-white ml-2">{data.title}</Text>
        </View>
        <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
          <Text className="text-xs font-medium text-white">
            30분 내 입금 필수
          </Text>
        </View>
      </View>

      {/* 가게 정보 */}
      <View className="mb-3">
        <Text className="text-white font-semibold text-base mb-1">
          📍 {data.store.name}
        </Text>
      </View>

      {/* 금액 정보 */}
      <View className="mb-4">
        <Text className="text-white text-sm">
          인당 예약금 {data.payment.per_person.toLocaleString()}원이 필요합니다
        </Text>
      </View>

      {/* 참여자 목록 */}
      <View className="bg-white bg-opacity-10 rounded-xl p-3 mb-4">
        {data.participants.map((participant, index) => (
          <View key={participant.user_id}>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="bg-white bg-opacity-30 rounded-md px-2 py-1 mr-3">
                  <Text className="text-white text-xs font-bold">
                    {participant.user_id === data.started_by ? '방' : '참'}
                  </Text>
                </View>
                <Text className="text-white font-medium">
                  {participant.user_name}
                </Text>
              </View>
              
              <View>
                {participant.status === 'completed' ? (
                  <Text className="text-green-300 font-bold text-sm">
                    입금완료
                  </Text>
                ) : participant.user_id === currentUserId ? (
                  <TouchableOpacity 
                    className="bg-orange-500 px-3 py-1 rounded-lg"
                    onPress={onPaymentComplete}
                    disabled={isLoading}
                  >
                    <Text className="text-white font-medium text-sm">
                      {isLoading ? '처리중...' : '입금하기'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="text-gray-300 text-sm">
                    대기중
                  </Text>
                )}
              </View>
            </View>
            
            {/* 구분선 (마지막 항목 제외) */}
            {index < data.participants.length - 1 && (
              <View className="h-px bg-white bg-opacity-20 my-1" />
            )}
          </View>
        ))}
      </View>

      {/* 총액 표시 */}
      <View className="bg-white bg-opacity-10 rounded-lg p-3 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-sm">들어온 예약금</Text>
          <Text className="text-white text-xs opacity-80">
            {data.progress.completed}/{data.progress.total}명 입금완료
          </Text>
        </View>
        <Text className="text-white text-lg font-bold">
          {(data.payment.per_person * data.progress.completed).toLocaleString()}원
        </Text>
      </View>

      {/* 진행률 바 */}
      <View className="mt-3">
        <View className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <View 
            className="h-full bg-green-400 rounded-full transition-all"
            style={{ width: `${data.progress.percentage}%` }}
          />
        </View>
      </View>
      
      {/* 완료 상태 표시 */}
      {data.is_completed && (
        <View className="mt-3 bg-green-500 bg-opacity-20 rounded-lg p-2">
          <Text className="text-green-300 text-center font-bold">
            🎉 모든 입금이 완료되었습니다!
          </Text>
        </View>
      )}
    </View>
  );
}
