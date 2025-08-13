import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import ModalBox from "@/components/common/ModalBox";

interface AcceptModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventData: {
    title: string;
    type: string;
    time: string;
    participants: string;
    location: string;
  } | null;
}

export default function AcceptModal({ visible, onClose, onConfirm, eventData }: AcceptModalProps) {
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
              {eventData.title}
            </Text>
            <Text className="text-sm text-gray-600">
              {eventData.participants} · {eventData.time}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="mr-2 w-2 h-2 bg-orange-500 rounded-full" />
              <Text className="text-sm text-gray-600">{eventData.type}</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <View className="mr-2 w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="text-sm text-gray-600">{eventData.location}</Text>
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
        >
          <Text className="font-medium text-center text-gray-600">취소</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 px-4 py-3 rounded-xl bg-orange-500"
          onPress={onConfirm}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-white">승인하기</Text>
        </TouchableOpacity>
      </View>
    </ModalBox>
  );
}