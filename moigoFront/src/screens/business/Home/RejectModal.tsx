import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import ModalBox from "@/components/common/ModalBox";
import type { StoreReservationDTO } from "@/types/DTO/users";

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  eventData: StoreReservationDTO | null;
  isLoading?: boolean;
}

export default function RejectModal({ 
  visible, 
  onClose, 
  onConfirm, 
  eventData, 
  isLoading = false 
}: RejectModalProps) {
  const [rejectReason, setRejectReason] = useState('');

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

  const handleConfirm = () => {
    onConfirm(rejectReason.trim() || undefined);
    setRejectReason(''); // 모달 닫힐 때 초기화
  };

  const handleClose = () => {
    setRejectReason(''); // 모달 닫힐 때 초기화
    onClose();
  };

  return (
    <ModalBox visible={visible} title="예약 거절" onClose={handleClose}>
      {/* 예약 정보 섹션 */}
      <View className="mb-6">
        <Text className="mb-3 text-sm font-medium text-gray-500">
          거절할 예약
        </Text>
        
        {eventData && (
          <View className="p-4 bg-gray-50 rounded-xl">
            <Text className="mb-2 text-lg font-semibold text-gray-800">
              {eventData.reservation_title || eventData.match_name || eventData.reservation_match || 
               (eventData.reservation_ex2 && `${eventData.reservation_ex2} 경기 관람`) || '경기 관람 모임'}
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
              <Text className="text-sm text-gray-600">
                {eventData.reservation_title || eventData.match_name || eventData.reservation_match || 
                 (eventData.reservation_ex2 && `${eventData.reservation_ex2} 경기 관람`) || '경기 관람 모임'}
              </Text>
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

      {/* 거절 사유 입력 */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-500">
          거절 사유 (선택사항)
        </Text>
        <TextInput
          className="p-3 border border-gray-300 rounded-xl text-gray-800"
          placeholder="거절 사유를 입력해주세요"
          placeholderTextColor="#9CA3AF"
          value={rejectReason}
          onChangeText={setRejectReason}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
      
      {/* 액션 버튼 */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300"
          onPress={handleClose}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text className="font-medium text-center text-gray-600">취소</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 px-4 py-3 rounded-xl bg-red-500 flex-row items-center justify-center"
          onPress={handleConfirm}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="font-medium text-center text-white ml-2">처리중...</Text>
            </>
          ) : (
            <Text className="font-medium text-center text-white">거절하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </ModalBox>
  );
}
