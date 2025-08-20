import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ModalBox from '@/components/common/ModalBox';
import { COLORS } from '@/constants/colors';

interface ReservationDepositModalProps {
  visible: boolean;
  currentDeposit: number;
  onClose: () => void;
  onSave: (deposit: number) => void;
}

export default function ReservationDepositModal({ 
  visible, 
  currentDeposit, 
  onClose, 
  onSave 
}: ReservationDepositModalProps) {
  const [deposit, setDeposit] = useState(currentDeposit);
  const [inputText, setInputText] = useState(Math.floor(currentDeposit / 1000).toString());

  // currentDeposit이 변경될 때 inputText 업데이트
  useEffect(() => {
    const initialValue = currentDeposit > 0 ? Math.floor(currentDeposit / 1000).toString() : '';
    setInputText(initialValue);
    setDeposit(currentDeposit);
  }, [currentDeposit]);

  const handleSave = () => {
    onSave(deposit);
    onClose();
  };

  const handleDepositChange = (text: string) => {
    // 숫자만 추출
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue) {
      // 입력된 숫자 그대로 표시 (콤마 포함)
      setInputText(numericValue);
      // 내부적으로는 1,000을 곱해서 저장
      const value = parseInt(numericValue);
      setDeposit(value * 1000);
    } else {
      // 빈 값일 때는 0으로 설정
      setDeposit(0);
      setInputText('');
    }
  };

  const formatInputText = (text: string) => {
    if (!text) return '';
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString();
  };

  return (
    <ModalBox 
      visible={visible} 
      title="예약금 설정" 
      onClose={onClose}
    >
      {/* 예약금 입력 필드 */}
      <View className="mb-6">
        <View className="p-4 bg-white rounded-xl border border-gray-200">
          <View className="flex-row justify-center items-center">
            <TextInput
              className="text-2xl font-bold text-center text-gray-800"
              value={formatInputText(inputText)}
              onChangeText={handleDepositChange}
              placeholder="0"
              keyboardType="numeric"
              textAlign="center"
            />
            <Text className="ml-1 text-lg font-medium text-gray-400">,000원</Text>
          </View>
        </View>
      </View>

      {/* 안내 텍스트 */}
      <Text className="mb-8 text-center text-gray-600">
        예약금은 1,000원 단위로 설정 가능합니다
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
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-white">저장</Text>
        </TouchableOpacity>
      </View>
    </ModalBox>
  );
}
