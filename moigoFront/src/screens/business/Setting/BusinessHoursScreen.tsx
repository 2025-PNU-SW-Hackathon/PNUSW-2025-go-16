import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import Toast from '@/components/common/Toast';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BusinessHours'>;

interface DaySchedule {
  id: string;
  name: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakTimes: BreakTime[];
}

interface BreakTime {
  id: string;
  startTime: string;
  endTime: string;
}

export default function BusinessHoursScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showToast, setShowToast] = useState(false);
  
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    {
      id: '1',
      name: '월요일',
      isOpen: true,
      startTime: '09:00',
      endTime: '22:00',
      breakTimes: [],
    },
    {
      id: '2',
      name: '화요일',
      isOpen: true,
      startTime: '09:00',
      endTime: '22:00',
      breakTimes: [],
    },
    {
      id: '3',
      name: '수요일',
      isOpen: true,
      startTime: '09:00',
      endTime: '22:00',
      breakTimes: [],
    },
    {
      id: '4',
      name: '목요일',
      isOpen: true,
      startTime: '09:00',
      endTime: '22:00',
      breakTimes: [],
    },
    {
      id: '5',
      name: '금요일',
      isOpen: true,
      startTime: '09:00',
      endTime: '22:00',
      breakTimes: [],
    },
    {
      id: '6',
      name: '토요일',
      isOpen: true,
      startTime: '09:00',
      endTime: '22:00',
      breakTimes: [],
    },
    {
      id: '7',
      name: '일요일',
      isOpen: false,
      startTime: '09:00',
      endTime: '22:00',
      breakTimes: [],
    },
  ]);

  const handleToggleDay = (dayId: string) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId ? { ...day, isOpen: !day.isOpen } : day
    ));
  };

  const handleTimeChange = (dayId: string, field: 'startTime' | 'endTime', time: string) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId ? { ...day, [field]: time } : day
    ));
  };

  const addBreakTime = (dayId: string) => {
    const newBreakTime: BreakTime = {
      id: Date.now().toString(),
      startTime: '12:00',
      endTime: '13:00',
    };
    
    setSchedule(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, breakTimes: [...day.breakTimes, newBreakTime] }
        : day
    ));
  };

  const removeBreakTime = (dayId: string, breakTimeId: string) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, breakTimes: day.breakTimes.filter(bt => bt.id !== breakTimeId) }
        : day
    ));
  };

  const handleBreakTimeChange = (dayId: string, breakTimeId: string, field: 'startTime' | 'endTime', time: string) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId 
        ? { 
            ...day, 
            breakTimes: day.breakTimes.map(bt => 
              bt.id === breakTimeId ? { ...bt, [field]: time } : bt
            )
          }
        : day
    ));
  };

  const handleSave = () => {
    // 저장 로직
    console.log('저장된 영업 시간:', schedule);
    
    // 토스트 표시
    setShowToast(true);
    
    // 2초 후 이전 화면으로 이동
    setTimeout(() => {
      setShowToast(false);
      navigation.goBack();
    }, 2000);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* 요일별 스케줄 */}
        {schedule.map((day) => (
          <View key={day.id} className="p-4 mb-4 bg-gray-50 rounded-xl border border-gray-200">
            {/* 요일명과 토글 */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">{day.name}</Text>
              <ToggleSwitch 
                value={day.isOpen} 
                onValueChange={() => handleToggleDay(day.id)} 
              />
            </View>

            {/* 영업 시간 */}
            <View className="flex-row items-center mb-4 space-x-4">
              <View className="flex-row flex-1 justify-center items-center mr-2">
                <Text className="mr-2 mb-2 text-sm font-medium text-gray-600">시작</Text>
                <TextInput
                  className="flex-1 p-3 text-center bg-white rounded-2xl border border-gray-200"
                  value={day.startTime}
                  onChangeText={(time) => handleTimeChange(day.id, 'startTime', time)}
                  placeholder="09:00"
                  editable={day.isOpen}
                />
              </View>
              
              <View className="flex-row flex-1 justify-center items-center ml-2">
                <Text className="mr-2 mb-2 text-sm font-medium text-gray-600">종료</Text>
                <TextInput
                  className="flex-1 p-3 text-center bg-white rounded-2xl border border-gray-200"
                  value={day.endTime}
                  onChangeText={(time) => handleTimeChange(day.id, 'endTime', time)}
                  placeholder="22:00"
                  editable={day.isOpen}
                />
              </View>
            </View>

            {/* 브레이크 타임 추가 버튼 */}
            {day.isOpen && (
              <TouchableOpacity 
                className="flex-row justify-center items-center py-2"
                onPress={() => addBreakTime(day.id)}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={16} color={COLORS.mainOrange} />
                <Text className="ml-2 text-sm font-medium" style={{ color: COLORS.mainOrange }}>
                  브레이크 타임 추가
                </Text>
              </TouchableOpacity>
            )}

            {/* 브레이크 타임 목록 */}
            {day.breakTimes.map((breakTime) => (
              <View key={breakTime.id} className="flex-row items-center p-3 mb-3 space-x-4 bg-white rounded-lg border border-gray-200">
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-medium text-gray-500">브레이크 시작</Text>
                  <TextInput
                    className="p-2 text-sm text-center bg-gray-50 rounded border border-gray-200"
                    value={breakTime.startTime}
                    onChangeText={(time) => handleBreakTimeChange(day.id, breakTime.id, 'startTime', time)}
                    placeholder="12:00"
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-medium text-gray-500">브레이크 종료</Text>
                  <TextInput
                    className="p-2 text-sm text-center bg-gray-50 rounded border border-gray-200"
                    value={breakTime.endTime}
                    onChangeText={(time) => handleBreakTimeChange(day.id, breakTime.id, 'endTime', time)}
                    placeholder="13:00"
                  />
                </View>
                
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => removeBreakTime(day.id, breakTime.id)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* 저장 버튼 */}
      <View className="px-4 pb-8 bg-white">
        <TouchableOpacity 
          className="py-4 w-full bg-orange-500 rounded-xl"
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text className="text-lg font-semibold text-center text-white">저장</Text>
        </TouchableOpacity>
      </View>

      {/* 토스트 */}
      {showToast && (
        <Toast 
          visible={showToast}
          message="저장되었습니다" 
          type="success"
          onHide={() => setShowToast(false)}
        />
      )}
    </View>
  );
}
