import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CheckModal from '@/components/common/CheckModal';

interface DeleteSportModalProps {
  visible: boolean;
  sportName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteSportModal({ 
  visible, 
  sportName, 
  onClose, 
  onConfirm 
}: DeleteSportModalProps) {
  return (
    <CheckModal visible={visible} title="스포츠 종목 삭제" onClose={onClose}>
      {/* 삭제 아이콘 */}
      <View className="items-center mb-8">
        <View className="justify-center items-center mb-4 w-16 h-16 bg-orange-500 rounded-full">
          <Feather name="trash-2" size={32} color="white" />
        </View>
        <Text className="mb-8 text-xl font-bold text-gray-800">스포츠 종목 삭제</Text>
        {/* 확인 메시지 */}
        <Text className="text-center text-gray-800">
          "{sportName}" 종목을 정말 삭제하시겠습니까?
        </Text>
      </View>
      
      {/* 액션 버튼 */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 px-6 py-4 rounded-xl border border-gray-300"
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-gray-600">취소</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 px-6 py-4 bg-orange-500 rounded-xl"
          onPress={onConfirm}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-white">삭제</Text>
        </TouchableOpacity>
      </View>
    </CheckModal>
  );
}
