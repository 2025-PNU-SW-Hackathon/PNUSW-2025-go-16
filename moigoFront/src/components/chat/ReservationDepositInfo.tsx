import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  hasDeposited: boolean;
}

// 🆕 정산용 참여자 타입
interface PaymentParticipant {
  user_id: string;
  user_name: string;
  is_host: boolean;
  payment_status: 'pending' | 'completed';
  paid_at: string | null;
}

// 🆕 가게 계좌 정보 타입
interface StoreAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

interface ReservationDepositInfoProps {
  participants: Participant[];
  depositAmount: number; // 인당 예약금
  timeLimit: number; // 입금 제한 시간 (분)
  onDeposit?: (participantId: string) => void; // 입금 처리 콜백
  
  // 🆕 정산 관련 props (정산이 시작된 경우에만 사용)
  paymentMode?: boolean; // 정산 모드 여부
  paymentId?: string;
  storeName?: string;
  storeAccount?: StoreAccount;
  paymentParticipants?: PaymentParticipant[];
  currentUserId?: string;
  isHost?: boolean;
  deadline?: string;
  onPaymentComplete?: () => void;
  onPaymentStart?: () => void; // 정산 시작 전일 때 사용
  isLoading?: boolean;
}

export default function ReservationDepositInfo({ 
  participants, 
  depositAmount, 
  timeLimit,
  onDeposit,
  // 정산 관련 props
  paymentMode = false,
  paymentId,
  storeName,
  storeAccount,
  paymentParticipants,
  currentUserId,
  isHost = false,
  deadline,
  onPaymentComplete,
  onPaymentStart,
  isLoading = false
}: ReservationDepositInfoProps) {
  
  // 정산 모드인 경우 정산 데이터 사용, 아니면 기존 예약금 데이터 사용
  if (paymentMode && paymentParticipants && storeAccount && storeName) {
    return renderPaymentMode();
  }
  
  // 기존 예약금 모드
  const depositedCount = participants.filter(p => p.hasDeposited).length;
  const totalDeposited = depositedCount * depositAmount;
  
  // 마감일 포맷팅 함수
  function formatDeadline(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 🆕 정산 모드 렌더링
  function renderPaymentMode() {
    if (!paymentParticipants || !storeAccount || !storeName) return null;
    
    const completedPayments = paymentParticipants.filter(p => p.payment_status === 'completed').length;
    const totalParticipants = paymentParticipants.length;
    const totalAmount = totalParticipants * depositAmount;
    
    // 현재 사용자의 입금 상태 확인
    const currentUserPayment = paymentParticipants.find(p => p.user_id === currentUserId);
    const isCurrentUserPaid = currentUserPayment?.payment_status === 'completed';
    
    // 정산 시작 전 상태 (onPaymentStart가 있는 경우)
    if (onPaymentStart) {
      return (
        <View className="mx-4 mt-4 mb-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <View className="flex-row items-center mb-3">
            <Feather name="credit-card" size={20} color="#ea580c" />
            <Text className="text-lg font-bold text-orange-800 ml-2">💰 정산 준비</Text>
          </View>
          
          <Text className="text-orange-700 text-sm mb-3">
            모집이 마감되고 가게가 선택되었습니다. 정산을 시작할 수 있습니다.
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600">선택된 가게</Text>
              <Text className="text-base font-medium text-gray-800">{storeName}</Text>
            </View>
            
            {isHost && (
              <TouchableOpacity
                onPress={onPaymentStart}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${
                  isLoading ? 'bg-gray-400' : 'bg-orange-500'
                }`}
                activeOpacity={0.8}
              >
                <Text className="text-white font-medium">
                  {isLoading ? '처리 중...' : '👑 정산하기'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    // 정산 진행 중 상태
    return (
      <View className="mx-4 mt-4 mb-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Feather name="credit-card" size={20} color="#059669" />
            <Text className="text-lg font-bold text-gray-800 ml-2">💰 예약금 안내</Text>
          </View>
          <View className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-xs font-medium text-green-700">
              {completedPayments}/{totalParticipants} 완료
            </Text>
          </View>
        </View>

        {/* 가게 및 계좌 정보 */}
        <View className="bg-gray-50 p-3 rounded-lg mb-4">
          <Text className="text-sm text-gray-600 mb-1">입금 계좌</Text>
          <Text className="text-base font-medium text-gray-800 mb-2">{storeName}</Text>
          <View className="flex-row items-center">
            <Text className="text-sm font-mono text-gray-700">
              {storeAccount.bank_name} {storeAccount.account_number}
            </Text>
            <TouchableOpacity className="ml-2">
              <Feather name="copy" size={14} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            예금주: {storeAccount.account_holder}
          </Text>
        </View>

        {/* 정산 정보 */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-sm text-gray-600">1인당 금액</Text>
            <Text className="text-xl font-bold text-gray-800">
              {depositAmount.toLocaleString()}원
            </Text>
          </View>
          <View className="text-right">
            <Text className="text-sm text-gray-600">총 금액</Text>
            <Text className="text-lg font-medium text-gray-700">
              {totalAmount.toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 마감일 */}
        {deadline && (
          <View className="flex-row items-center mb-4">
            <Feather name="clock" size={16} color="#ef4444" />
            <Text className="text-sm text-red-600 ml-1">
              입금 마감: {formatDeadline(deadline)}
            </Text>
          </View>
        )}

        {/* 참여자 입금 상태 */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">입금 현황</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {paymentParticipants.map((participant) => (
                <View
                  key={participant.user_id}
                  className={`px-3 py-2 rounded-full border ${
                    participant.payment_status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text
                      className={`text-sm font-medium ${
                        participant.payment_status === 'completed'
                          ? 'text-green-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {participant.user_name}
                      {participant.is_host && ' 👑'}
                    </Text>
                    {participant.payment_status === 'completed' && (
                      <Feather name="check" size={14} color="#059669" className="ml-1" />
                    )}
                  </View>
                  <Text
                    className={`text-xs ${
                      participant.payment_status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {participant.payment_status === 'completed' ? '입금완료' : '입금전'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 입금하기 버튼 */}
        {!isCurrentUserPaid && onPaymentComplete && (
          <TouchableOpacity
            onPress={onPaymentComplete}
            disabled={isLoading}
            className={`py-3 rounded-lg ${
              isLoading ? 'bg-gray-400' : 'bg-green-500'
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-medium">
              {isLoading ? '처리 중...' : '💳 입금 완료'}
            </Text>
          </TouchableOpacity>
        )}

        {/* 입금 완료 상태 */}
        {isCurrentUserPaid && (
          <View className="py-3 bg-green-50 border border-green-200 rounded-lg">
            <View className="flex-row items-center justify-center">
              <Feather name="check-circle" size={20} color="#059669" />
              <Text className="text-green-700 font-medium ml-2">입금이 완료되었습니다</Text>
            </View>
            {currentUserPayment?.paid_at && (
              <Text className="text-center text-sm text-green-600 mt-1">
                {new Date(currentUserPayment.paid_at).toLocaleString('ko-KR')}
              </Text>
            )}
          </View>
        )}

        {/* 전체 완료 상태 */}
        {completedPayments === totalParticipants && (
          <View className="mt-2 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-center text-blue-700 font-medium">
              🎉 모든 참여자의 입금이 완료되었습니다!
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="mx-4 my-3 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FFF7ED' }}>
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
          <Text className="text-sm font-medium text-orange-600">
            {timeLimit}분 내 입금 필수
          </Text>
      </View>

      {/* 참가자 목록 */}
      <View className="mb-4">
        {participants.map((participant, index) => (
          <View key={participant.id}>
            <View className="flex-row items-center justify-between">
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
                       <View className="border-b border-gray-100 mt-3 mb-2" />
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
              {depositedCount}/{participants.length}명 입금완료
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