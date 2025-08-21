import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CheckModal from '@/components/common/CheckModal';
import { COLORS } from '@/constants/colors';

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ 
  visible, 
  onClose, 
  onConfirm 
}: LogoutConfirmModalProps) {
  return (
    <CheckModal 
      visible={visible} 
      title="로그아웃" 
      onClose={onClose}
    >
      {/* 로그아웃 아이콘 */}
      <View className="items-center mb-6">
        <View className="justify-center items-center mb-2 w-24 h-24 rounded-xl">
          <Feather name="log-out" size={64} color={COLORS.mainOrange} />
        </View>
      </View>

      {/* 확인 메시지 */}
      <Text className="mb-8 text-lg font-medium text-center text-gray-800">
        정말 로그아웃 하시겠습니까?
      </Text>

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
          <Text className="font-medium text-center text-white">로그아웃</Text>
        </TouchableOpacity>
      </View>
    </CheckModal>
  );
}
