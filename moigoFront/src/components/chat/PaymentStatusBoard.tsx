import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import type { PaymentStatusBoardData, PaymentParticipantDTO } from '@/types/DTO/payment';

interface PaymentStatusBoardProps {
  data: PaymentStatusBoardData;
  currentUserId?: string;
  onPaymentComplete?: () => void;
  isLoading?: boolean;
}

export default function PaymentStatusBoard({ 
  data, 
  currentUserId,
  onPaymentComplete,
  isLoading = false 
}: PaymentStatusBoardProps) {
  
  const progressPercentage = (data.completed_count / data.total_participants) * 100;
  const totalDeposited = data.payment_per_person * data.completed_count;
  
  // 시간 포맷 함수
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View className="mx-4 my-3 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FFF7ED' }}>
      {/* 상단 헤더 */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Feather name="credit-card" size={20} color="#F97316" />
          <Text className="text-lg font-bold text-gray-800 ml-2">💰 정산 현황</Text>
        </View>
        <View className="bg-orange-100 px-3 py-1 rounded-full">
          <Text className="text-sm font-medium text-orange-700">
            {data.completed_count}/{data.total_participants}명 완료 ({Math.round(progressPercentage)}%)
          </Text>
        </View>
      </View>

      {/* 금액 정보 */}
      <View className="bg-white rounded-xl p-3 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">1인당</Text>
          <Text className="text-base font-semibold text-gray-900">
            {data.payment_per_person.toLocaleString()}원
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-600">총 금액</Text>
          <Text className="text-base font-semibold text-gray-900">
            {data.total_amount.toLocaleString()}원
          </Text>
        </View>
      </View>

      {/* 계좌 정보 */}
      <View className="bg-gray-50 rounded-xl p-3 mb-4">
        <Text className="text-sm text-gray-600 mb-1">입금 계좌</Text>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-medium text-gray-800">
              {data.store_account.bank_name} {data.store_account.account_number}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              예금주: {data.store_account.account_holder}
            </Text>
          </View>
          <TouchableOpacity className="ml-2 p-2">
            <Feather name="copy" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 진행률 바 */}
      <View className="mb-4">
        <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <View 
            className="bg-green-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>

      {/* 참여자 목록 */}
      <View className="mb-4">
        {data.participants.map((participant: PaymentParticipantDTO, index: number) => (
          <View key={participant.user_id}>
            <View className="flex-row items-center justify-between py-2">
              {/* 사용자 정보 */}
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center mr-3">
                  <Text className="text-xs font-bold text-gray-700">
                    {participant.user_name[0]}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    {participant.user_name}
                    {participant.is_host && (
                      <Text className="text-xs text-orange-600 ml-1">방장</Text>
                    )}
                  </Text>
                  {participant.paid_at && (
                    <Text className="text-xs text-gray-500">
                      {formatTime(participant.paid_at)}
                    </Text>
                  )}
                </View>
              </View>

              {/* 입금 상태 */}
              {participant.payment_status === 'completed' ? (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-green-600">
                    ✅ 완료
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
                    ⏳ 대기중
                  </Text>
                </View>
              )}
            </View>
            {index < data.participants.length - 1 && (
              <View className="border-b border-gray-100 mt-1 mb-1" />
            )}
          </View>
        ))}
      </View>

      {/* 하단 요약 */}
      <View className="bg-white rounded-xl p-3">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-base font-semibold text-gray-900">
              들어온 예약금
            </Text>
            <Text className="text-xs text-gray-500">
              마지막 업데이트: {formatTime(data.last_updated)}
            </Text>
          </View>
          <Text className="text-xl font-bold text-mainOrange">
            {totalDeposited.toLocaleString()}원
          </Text>
        </View>
        
        {/* 마감 시간 */}
        <View className="flex-row items-center justify-center mt-2 pt-2 border-t border-gray-100">
          <Feather name="clock" size={14} color="#EF4444" />
          <Text className="text-sm text-red-500 ml-1 font-medium">
            마감: {formatTime(data.payment_deadline)}
          </Text>
        </View>
      </View>
    </View>
  );
}
