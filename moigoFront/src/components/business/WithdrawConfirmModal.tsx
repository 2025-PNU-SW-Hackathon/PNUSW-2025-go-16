import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface WithdrawConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WithdrawConfirmModal({ 
  visible, 
  onClose, 
  onConfirm 
}: WithdrawConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent={true}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1" />
        <View className="p-8 mx-auto w-11/12 bg-white rounded-3xl shadow-lg">
          {/* 경고 아이콘 */}
          <View className="items-center mb-6">
            <View className="justify-center items-center mb-2 w-24 h-24 rounded-full bg-orange-500">
              <Feather name="alert-triangle" size={48} color="white" />
            </View>
          </View>

          {/* 타이틀 */}
          <Text className="mb-4 text-2xl font-bold text-center text-gray-900">
            회원 탈퇴
          </Text>

          {/* 확인 메시지 */}
          <Text className="mb-3 text-lg font-medium text-center text-gray-800">
            정말 회원 탈퇴를 하시겠습니까?
          </Text>

          {/* 경고 메시지 */}
          <Text className="mb-8 text-base font-medium text-center text-orange-500">
            탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </Text>

          {/* 액션 버튼 */}
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 px-6 py-4 rounded-xl border border-gray-300 bg-white"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="font-medium text-center text-gray-900">취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 px-6 py-4 bg-orange-500 rounded-xl"
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text className="font-medium text-center text-white">탈퇴하기</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1" />
      </View>
    </Modal>
  );
}
