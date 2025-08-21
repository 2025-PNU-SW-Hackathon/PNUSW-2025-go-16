import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ModalBox from '@/components/common/ModalBox';

interface PlusSportModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newSport: {
    name: string;
    platforms: string[];
    availableSeats: number;
  }) => void;
}

// 사용 가능한 스포츠 종목 목록
const availableSports = [
  '축구', '농구', '야구', '배구', '게임', '격투기'
];

export default function PlusSportModal({ 
  visible, 
  onClose, 
  onSave 
}: PlusSportModalProps) {
  const [newSport, setNewSport] = useState<{
    name: string;
    platforms: string;
    availableSeats: number;
  }>({
    name: '',
    platforms: '',
    availableSeats: 1,
  });
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);

  const handleSave = () => {
    if (newSport.name.trim() && newSport.platforms.trim()) {
      const platforms = newSport.platforms.split(',').map(p => p.trim()).filter(p => p);
      onSave({
        name: newSport.name.trim(),
        platforms,
        availableSeats: newSport.availableSeats,
      });
      
      // 폼 초기화
      setNewSport({
        name: '',
        platforms: '',
        availableSeats: 1,
      });
      onClose();
    }
  };

  const increaseSeats = () => {
    setNewSport(prev => ({
      ...prev,
      availableSeats: prev.availableSeats + 1,
    }));
  };

  const decreaseSeats = () => {
    if (newSport.availableSeats > 1) {
      setNewSport(prev => ({
        ...prev,
        availableSeats: prev.availableSeats - 1,
      }));
    }
  };

  const selectSport = (sportName: string) => {
    setNewSport(prev => ({
      ...prev,
      name: sportName,
    }));
    setShowSportsDropdown(false);
  };

  const handleClose = () => {
    // 폼 초기화
    setNewSport({
      name: '',
      platforms: '',
      availableSeats: 1,
    });
    onClose();
  };

  return (
    <ModalBox visible={visible} title="새 스포츠 추가" onClose={handleClose}>
      {/* 스포츠 종목 */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-800">스포츠 종목</Text>
        <View className="relative">
          <TouchableOpacity
            className="flex-row justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
            onPress={() => setShowSportsDropdown(!showSportsDropdown)}
            activeOpacity={0.7}
          >
            <Text className={`text-gray-800 ${!newSport.name ? 'text-gray-400' : ''}`}>
              {newSport.name || '스포츠 종목을 선택하세요'}
            </Text>
            <Feather 
              name={showSportsDropdown ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
          
          {/* 스포츠 드롭다운 목록 */}
          {showSportsDropdown && (
            <View className="absolute right-0 left-0 top-full z-10 mt-1 max-h-48 bg-white rounded-xl border border-gray-200 shadow-lg">
              <ScrollView 
                className="max-h-48"
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {availableSports.map((sportName, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`p-4 border-b border-gray-100 ${index === availableSports.length - 1 ? 'border-b-0' : ''} ${newSport.name === sportName ? 'bg-orange-50' : ''}`}
                    onPress={() => selectSport(sportName)}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-base ${newSport.name === sportName ? 'text-orange-500 font-semibold' : 'text-gray-800'}`}>
                      {sportName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* 중계 채널 */}
      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-800">중계 채널</Text>
        <TextInput
          className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
          value={newSport.platforms}
          onChangeText={(text) => setNewSport(prev => ({ ...prev, platforms: text }))}
          placeholder="예: SBS Sports, MBC Sports"
        />
      </View>

      {/* 시청 가능 좌석/테이블 */}
      <View className="mb-8">
        <Text className="mb-2 text-sm font-medium text-gray-800">시청 가능 좌석/테이블</Text>
        <View className="flex-row justify-center items-center">
          <TouchableOpacity 
            className="justify-center items-center w-10 h-10 bg-gray-300 rounded-full"
            onPress={decreaseSeats}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <View className="px-6 py-2 mx-6 bg-gray-50 rounded-lg">
            <Text className="text-lg font-semibold text-gray-800">{newSport.availableSeats}</Text>
          </View>
          
          <TouchableOpacity 
            className="justify-center items-center w-10 h-10 bg-gray-300 rounded-full"
            onPress={increaseSeats}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 액션 버튼 */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 px-6 py-4 rounded-xl border border-gray-300"
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-gray-600">취소</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 px-6 py-4 bg-orange-500 rounded-xl"
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text className="font-medium text-center text-white">추가</Text>
        </TouchableOpacity>
      </View>
    </ModalBox>
  );
}
