import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ModalBox from './ModalBox';

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  amount: number;
  onPaymentMethodSelect: (method: 'kakao' | 'naver' | 'bank') => void;
}

export default function PaymentModal({ 
  isVisible, 
  onClose, 
  amount, 
  onPaymentMethodSelect 
}: PaymentModalProps) {
  return (
    <ModalBox
      visible={isVisible}
      title="예약금 결제"
      onClose={onClose}
    >
      {/* 결제 금액 */}
      <View className="p-4 bg-gray-50 rounded-xl mb-4">
        <Text className="text-sm font-medium text-gray-900 mb-1">
          결제 금액
        </Text>
        <Text className="text-2xl font-bold text-mainOrange">
          {amount.toLocaleString()}원
        </Text>
      </View>

      {/* 결제 수단 */}
      <View className="space-y-3">
        {/* 카카오페이 */}
        <TouchableOpacity 
          className="flex-row items-center p-4 bg-yellow-400 rounded-xl"
          onPress={() => onPaymentMethodSelect('kakao')}
        >
          <View className="w-6 h-6 bg-black rounded-full items-center justify-center mr-3">
            <Text className="text-white text-xs font-bold">K</Text>
          </View>
          <Text className="text-black font-medium flex-1">
            카카오페이로 결제
          </Text>
          <Feather name="chevron-right" size={20} color="#000000" />
        </TouchableOpacity>

        {/* 네이버페이 */}
        <TouchableOpacity 
          className="flex-row items-center p-4 bg-green-500 rounded-xl"
          onPress={() => onPaymentMethodSelect('naver')}
        >
          <View className="w-6 h-6 bg-white rounded-full items-center justify-center mr-3">
            <Text className="text-green-500 text-xs font-bold">N</Text>
          </View>
          <Text className="text-white font-medium flex-1">
            네이버페이로 결제
          </Text>
          <Feather name="chevron-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* 계좌이체 */}
        <TouchableOpacity 
          className="flex-row items-center p-4 bg-blue-600 rounded-xl"
          onPress={() => onPaymentMethodSelect('bank')}
        >
          <View className="w-6 h-6 bg-white rounded-full items-center justify-center mr-3">
            <Feather name="building" size={14} color="#2563EB" />
          </View>
          <Text className="text-white font-medium flex-1">
            계좌이체
          </Text>
          <Feather name="chevron-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 하단 안내 */}
      <View className="mt-4">
        <Text className="text-xs text-gray-500 text-center">
          결제 진행 시 이용약관에 동의하는 것으로 간주됩니다
        </Text>
      </View>
    </ModalBox>
  );
} 