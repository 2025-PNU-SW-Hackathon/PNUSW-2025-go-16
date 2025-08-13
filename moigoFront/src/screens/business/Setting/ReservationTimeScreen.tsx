import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import Toast from '@/components/common/Toast';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReservationTime'>;

interface DaySchedule {
  id: string;
  name: string;
  shortName: string;
  isSelected: boolean;
  startTime: string;
  endTime: string;
}

export default function ReservationTimeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showToast, setShowToast] = useState(false);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { id: '1', name: '월요일', shortName: '월', isSelected: false, startTime: '', endTime: '' },
    { id: '2', name: '화요일', shortName: '화', isSelected: false, startTime: '', endTime: '' },
    { id: '3', name: '수요일', shortName: '수', isSelected: false, startTime: '', endTime: '' },
    { id: '4', name: '목요일', shortName: '목', isSelected: false, startTime: '', endTime: '' },
    { id: '5', name: '금요일', shortName: '금', isSelected: false, startTime: '', endTime: '' },
    { id: '6', name: '토요일', shortName: '토', isSelected: false, startTime: '', endTime: '' },
    { id: '7', name: '일요일', shortName: '일', isSelected: false, startTime: '', endTime: '' },
  ]);

  const [globalStartTime, setGlobalStartTime] = useState('05:00');
  const [globalEndTime, setGlobalEndTime] = useState('23:00');

  const handleDayToggle = (dayId: string) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId ? { ...day, isSelected: !day.isSelected } : day
    ));
  };

  const handleApplyToAllDays = (value: boolean) => {
    setApplyToAllDays(value);
    if (value) {
      // 전체 요일 동일 적용 시 모든 요일을 선택 상태로 변경하고 전역 시간 적용
      setSchedule(prev => prev.map(day => ({ 
        ...day, 
        isSelected: true,
        startTime: globalStartTime,
        endTime: globalEndTime
      })));
    }
  };

  const handleGlobalTimeChange = (field: 'startTime' | 'endTime', time: string) => {
    if (field === 'startTime') {
      setGlobalStartTime(time);
      // 전체 요일 동일 적용이 켜져있으면 모든 요일의 시작 시간 업데이트
      if (applyToAllDays) {
        setSchedule(prev => prev.map(day => ({ ...day, startTime: time })));
      }
    } else {
      setGlobalEndTime(time);
      // 전체 요일 동일 적용이 켜져있으면 모든 요일의 종료 시간 업데이트
      if (applyToAllDays) {
        setSchedule(prev => prev.map(day => ({ ...day, endTime: time })));
      }
    }
  };

  const handleIndividualTimeChange = (dayId: string, field: 'startTime' | 'endTime', time: string) => {
    setSchedule(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, [field]: time }
        : day
    ));
  };

  const handleSave = () => {
    // 저장 로직
    console.log('저장된 예약 시간대:', { applyToAllDays, globalStartTime, globalEndTime, schedule });
    
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
        {/* 요일 선택 섹션 */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">요일 선택</Text>
            <View className="flex-row items-center">
              <Text className="mr-2 text-sm text-gray-600">전체 요일 동일 적용</Text>
              <ToggleSwitch 
                value={applyToAllDays} 
                onValueChange={handleApplyToAllDays} 
              />
            </View>
          </View>
          
          {/* 요일 버튼들 */}
          <View className="flex-row justify-between mb-4">
            {schedule.map((day) => (
              <View key={day.id} className="items-center">
                <TouchableOpacity 
                  className={`w-12 h-12 rounded-full justify-center items-center mb-2 ${
                    day.isSelected ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                  onPress={() => handleDayToggle(day.id)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-medium ${
                    day.isSelected ? 'text-white' : 'text-gray-600'
                  }`}>
                    {day.shortName}
                  </Text>
                </TouchableOpacity>
                <ToggleSwitch 
                  value={day.isSelected} 
                  onValueChange={() => handleDayToggle(day.id)} 
                />
              </View>
            ))}
          </View>
        </View>

        {/* 시간대 설정 섹션 */}
        <View className="mb-8">
          <Text className="mb-4 text-lg font-semibold text-gray-800">시간대 설정</Text>
          
          <View className="flex-row space-x-4">
            {/* 시작 시간 */}
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-600">시작 시간</Text>
              <TextInput
                className="p-4 bg-white rounded-xl border border-gray-200"
                value={globalStartTime}
                onChangeText={(time) => handleGlobalTimeChange('startTime', time)}
                placeholder="05:00"
                keyboardType="numeric"
              />
            </View>
            
            {/* 종료 시간 */}
            <View className="flex-1">
              <Text className="mb-2 text-sm font-medium text-gray-600">종료 시간</Text>
              <TextInput
                className="p-4 bg-white rounded-xl border border-gray-200"
                value={globalEndTime}
                onChangeText={(time) => handleGlobalTimeChange('endTime', time)}
                placeholder="23:00"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* 설정 시간 요약 섹션 */}
        <View className="mb-8">
          <Text className="mb-4 text-lg font-semibold text-gray-800">설정 시간 요약</Text>
          
          {schedule.map((day) => (
            <View key={day.id} className="p-4 mb-3 bg-gray-50 rounded-xl border border-gray-200">
              <Text className="mb-3 text-base font-medium text-gray-800">{day.name}</Text>
              
              {day.isSelected && (
                <View className="flex-row space-x-4">
                  {/* 개별 시작 시간 */}
                  <View className="flex-1">
                    <Text className="mb-2 text-xs font-medium text-gray-500">시작 시간</Text>
                    <TextInput
                      className="p-2 text-sm text-center bg-white rounded border border-gray-200"
                      value={day.startTime || globalStartTime}
                      onChangeText={(time) => handleIndividualTimeChange(day.id, 'startTime', time)}
                      placeholder={globalStartTime || "05:00"}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  {/* 개별 종료 시간 */}
                  <View className="flex-1">
                    <Text className="mb-2 text-xs font-medium text-gray-500">종료 시간</Text>
                    <TextInput
                      className="p-2 text-sm text-center bg-white rounded border border-gray-200"
                      value={day.endTime || globalEndTime}
                      onChangeText={(time) => handleIndividualTimeChange(day.id, 'endTime', time)}
                      placeholder={globalEndTime || "23:00"}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
              
              {/* 시간 요약 표시 */}
              {day.isSelected && (day.startTime || day.endTime || globalStartTime || globalEndTime) ? (
                <Text className="mt-2 text-sm font-medium text-orange-500">
                  {(day.startTime || globalStartTime) && (day.endTime || globalEndTime)
                    ? `${day.startTime || globalStartTime} ~ ${day.endTime || globalEndTime}`
                    : '시간 미설정'
                  }
                </Text>
              ) : (
                <Text className="mt-2 text-sm text-gray-400">설정되지 않음</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 설정 저장 버튼 */}
      <View className="px-4 pb-8 bg-white">
        <TouchableOpacity 
          className="py-4 w-full bg-orange-500 rounded-xl"
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text className="text-lg font-semibold text-center text-white">설정 저장</Text>
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
