import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import ModalBox from "@/components/common/ModalBox";
import type { StoreReservationDTO } from "@/types/DTO/users";

interface AcceptModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventData: StoreReservationDTO | null;
  isLoading?: boolean;
}

export default function AcceptModal({ 
  visible, 
  onClose, 
  onConfirm, 
  eventData, 
  isLoading = false 
}: AcceptModalProps) {
  // 참가자 정보를 "이야구 외 몇명" 형태로 파싱하는 함수
  const parseParticipants = (participantInfo: string) => {
    if (!participantInfo || participantInfo === '참가자 없음') {
      return '참가자 없음';
    }
    
    // 쉼표로 구분된 참가자 목록을 배열로 변환
    const participants = participantInfo.split(',').map(p => p.trim());
    
    if (participants.length === 0) {
      return '참가자 없음';
    }
    
    if (participants.length === 1) {
      return participants[0];
    }
    
    // 첫 번째 참가자 + "외 N명" 형태로 반환
    const firstParticipant = participants[0];
    const otherCount = participants.length - 1;
    
    return `${firstParticipant} 외 ${otherCount}명`;
  };

  return (
    <ModalBox visible={visible} title="예약 승인" onClose={onClose}>
      {/* 예약 정보 섹션 */}
      <View className="mb-6">
        <Text className="mb-3 text-sm font-medium text-gray-500">
          승인할 예약
        </Text>
        
        {eventData && (
          <View className="p-4 bg-gray-50 rounded-xl">
            <Text className="mb-2 text-lg font-semibold text-gray-800">
              {eventData.reservation_match}
            </Text>
            <Text className="text-sm text-gray-600">
              {parseParticipants(eventData.reservation_participant_info)} · {
                new Date(eventData.reservation_start_time).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="mr-2 w-2 h-2 bg-orange-500 rounded-full" />
              <Text className="text-sm text-gray-600">{eventData.reservation_match}</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <View className="mr-2 w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="text-sm text-gray-600">
                {new Date(eventData.reservation_start_time).toLocaleDateString('ko-KR')}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <View className="mr-2 w-2 h-2 bg-green-500 rounded-full" />
              <Text className="text-sm text-gray-600">
                {eventData.reservation_table_info || '테이블 정보 없음'}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {/* 액션 버튼 */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300"
          onPress={onClose}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text className="font-medium text-center text-gray-600">취소</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 px-4 py-3 rounded-xl bg-orange-500 flex-row items-center justify-center"
          onPress={onConfirm}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="font-medium text-center text-white ml-2">처리중...</Text>
            </>
          ) : (
            <Text className="font-medium text-center text-white">승인하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </ModalBox>
  );
}