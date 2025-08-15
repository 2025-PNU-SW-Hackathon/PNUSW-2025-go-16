import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import Toast from '@/components/common/Toast';
import { useReservationSettings, useUpdateReservationSettings } from '@/hooks/queries/useUserQueries';
import type { BusinessHoursDTO } from '@/types/DTO/users';

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
  
  // API 훅 사용
  const { data: reservationSettingsData, isLoading: isReservationSettingsLoading } = useReservationSettings();
  const { mutate: updateReservationSettings, isSuccess: isUpdateSuccess, isError: isUpdateError, isPending: isUpdating } = useUpdateReservationSettings();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
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

  // API 데이터로 초기화
  useEffect(() => {
    if (reservationSettingsData?.success && reservationSettingsData?.data?.available_times) {
      const apiAvailableTimes = reservationSettingsData.data.available_times;
      
      // API에서 받은 영업 시간을 기존 UI 형식에 맞게 변환
      const updatedSchedule = schedule.map(day => {
        const dayCode = getDayCode(day.name);
        const apiDay = apiAvailableTimes.find((hour: BusinessHoursDTO) => hour.day === dayCode);
        
        if (apiDay) {
          return {
            ...day,
            isSelected: true,
            startTime: apiDay.start,
            endTime: apiDay.end,
          };
        } else {
          return {
            ...day,
            isSelected: false,
          };
        }
      });
      
      setSchedule(updatedSchedule);
      
      // 전역 시간 설정 (첫 번째 선택된 요일의 시간으로)
      const firstSelectedDay = updatedSchedule.find(day => day.isSelected);
      if (firstSelectedDay) {
        setGlobalStartTime(firstSelectedDay.startTime);
        setGlobalEndTime(firstSelectedDay.endTime);
      }
    }
  }, [reservationSettingsData]);

  // 요일명을 API 요일 코드로 변환
  const getDayCode = (dayName: string): string => {
    switch (dayName) {
      case '월요일':
        return 'MON';
      case '화요일':
        return 'TUE';
      case '수요일':
        return 'WED';
      case '목요일':
        return 'THU';
      case '금요일':
        return 'FRI';
      case '토요일':
        return 'SAT';
      case '일요일':
        return 'SUN';
      default:
        return 'MON';
    }
  };

  // API 요일 코드를 요일명으로 변환
  const getDayName = (dayCode: string): string => {
    switch (dayCode) {
      case 'MON':
        return '월요일';
      case 'TUE':
        return '화요일';
      case 'WED':
        return '수요일';
      case 'THU':
        return '목요일';
      case 'FRI':
        return '금요일';
      case 'SAT':
        return '토요일';
      case 'SUN':
        return '일요일';
      default:
        return '월요일';
    }
  };

  // 업데이트 성공 시 처리
  useEffect(() => {
    if (isUpdateSuccess) {
      console.log('✅ [화면] 예약 설정 수정 성공!');
      
      // 성공 토스트 표시
      setToastMessage('✅ 예약 시간이 성공적으로 저장되었습니다!');
      setToastType('success');
      setShowToast(true);
      
      // 2초 후 이전 화면으로 이동
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    }
  }, [isUpdateSuccess, navigation]);

  // 업데이트 실패 시 처리
  useEffect(() => {
    if (isUpdateError) {
      console.log('❌ [화면] 예약 설정 수정 실패!');
      
      // 실패 토스트 표시
      setToastMessage('예약 시간 저장에 실패했습니다.');
      setToastType('error');
      setShowToast(true);
    }
  }, [isUpdateError]);

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
    // API 데이터 형식으로 변환
    const availableTimes: BusinessHoursDTO[] = schedule
      .filter(day => day.isSelected)
      .map(day => ({
        day: getDayCode(day.name),
        start: day.startTime || globalStartTime,
        end: day.endTime || globalEndTime,
      }));

    console.log('🏪 [화면] 저장할 예약 시간:', availableTimes);
    
    // API 호출
    updateReservationSettings({
      min_participants: 2, // 기본값
      available_times: availableTimes,
    });
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
          disabled={isUpdating}
        >
          <Text className="text-lg font-semibold text-center text-white">
            {isUpdating ? '저장 중...' : '설정 저장'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 토스트 */}
      <Toast 
        visible={showToast}
        message={toastMessage} 
        type={toastType}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </View>
  );
}
