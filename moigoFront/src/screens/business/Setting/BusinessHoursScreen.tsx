import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import Toast from '@/components/common/Toast';
import { useStoreInfo, useUpdateBusinessHours } from '@/hooks/queries/useUserQueries';
import type { BusinessHoursDTO } from '@/types/DTO/users';

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
  
  // API 훅 사용
  const { data: storeInfoData, isLoading: isStoreInfoLoading } = useStoreInfo();
  const { mutate: updateBusinessHours, isSuccess: isUpdateSuccess, isError: isUpdateError, isPending: isUpdating } = useUpdateBusinessHours();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
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

  // API 데이터로 초기화
  useEffect(() => {
    if (storeInfoData?.data?.reservation_settings?.available_times) {
      const apiBusinessHours = storeInfoData.data.reservation_settings.available_times;
      
      // API에서 받은 영업 시간을 기존 UI 형식에 맞게 변환
      const updatedSchedule = schedule.map(day => {
        const dayCode = getDayCode(day.name);
        const apiDay = apiBusinessHours.find((hour: BusinessHoursDTO) => hour.day === dayCode);
        
        if (apiDay) {
          return {
            ...day,
            isOpen: true,
            startTime: apiDay.start,
            endTime: apiDay.end,
          };
        } else {
          return {
            ...day,
            isOpen: false,
          };
        }
      });
      
      setSchedule(updatedSchedule);
    }
  }, [storeInfoData]);

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
      console.log('✅ [화면] 영업 시간 설정 수정 성공!');
      
      // 성공 토스트 표시
      setToastMessage('영업 시간이 저장되었습니다!');
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
      console.log('❌ [화면] 영업 시간 설정 수정 실패!');
      
      // 실패 토스트 표시
      setToastMessage('영업 시간 저장에 실패했습니다.');
      setToastType('error');
      setShowToast(true);
    }
  }, [isUpdateError]);

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
    // API 데이터 형식으로 변환
    const businessHours: BusinessHoursDTO[] = schedule
      .filter(day => day.isOpen)
      .map(day => ({
        day: getDayCode(day.name),
        start: day.startTime,
        end: day.endTime,
      }));

    console.log('🏪 [화면] 저장할 영업 시간:', businessHours);
    
    // API 호출
    updateBusinessHours(businessHours);
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
          disabled={isUpdating}
        >
          <Text className="text-lg font-semibold text-center text-white">
            {isUpdating ? '저장 중...' : '저장'}
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
