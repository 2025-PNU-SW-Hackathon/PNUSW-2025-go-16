import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import ScheduleEventBlock from '@/components/business/ScheduleEventBlock';
import { useCalenderScreen } from '../../../hooks/useCalenderScreen';
import type { MatchDTO, ScheduleEventDTO } from '../../../types/DTO/users';

interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  participants: number;
  maxParticipants: number;
  day: number; // 0-6 (월-일)
}

export default function CalenderScreen() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // API 연동을 위한 훅 사용
  const {
    matches,
    schedule,
    isLoading,
    hasError,
    handleRefresh,
  } = useCalenderScreen();
  
  // API 데이터를 기존 UI 형식에 맞게 변환
  const convertApiDataToEvents = (): ScheduleEvent[] => {
    const events: ScheduleEvent[] = [];
    
    console.log('🔍 [일정 변환] 시작 - 경기:', matches.length, '예약:', schedule.length);
    
    // 경기 정보를 이벤트로 변환
    matches.forEach((match: MatchDTO) => {
      const matchDate = new Date(match.match_date);
      const dayIndex = (matchDate.getDay() + 6) % 7; // 월요일을 0으로 변환
      
      console.log('⚽ [경기 변환]', {
        id: match.id,
        title: `${match.home_team} vs ${match.away_team}`,
        date: match.match_date,
        dayIndex,
        dayName: ['월', '화', '수', '목', '금', '토', '일'][dayIndex]
      });
      
      events.push({
        id: `match_${match.id}`,
        title: `${match.home_team} vs ${match.away_team}`,
        startTime: matchDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        participants: 0, // 경기는 참가자 수가 없음
        maxParticipants: 0,
        day: dayIndex,
      });
    });
    
    // 예약 정보를 이벤트로 변환
    schedule.forEach((reservation: ScheduleEventDTO) => {
      const reservationDate = new Date(reservation.reservation_start_time);
      const dayIndex = (reservationDate.getDay() + 6) % 7; // 월요일을 0으로 변환
      
      // 참가자 정보에서 참가자 수 계산
      const participantInfo = reservation.reservation_participant_info || '';
      const participants = participantInfo.split(',').filter(p => p.trim());
      const actualParticipants = participants.length;
      
      // 최대 참가자 수는 기본값으로 설정 (API에서 제공되지 않음)
      const maxParticipants = reservation.max_participants || actualParticipants + 5;
      
      console.log('📅 [예약 변환]', {
        id: reservation.reservation_id,
        title: reservation.reservation_match,
        date: reservation.reservation_start_time,
        dayIndex,
        dayName: ['월', '화', '수', '목', '금', '토', '일'][dayIndex],
        participants: actualParticipants,
        maxParticipants: maxParticipants,
        participantInfo: reservation.reservation_participant_info
      });
      
      events.push({
        id: `reservation_${reservation.reservation_id}`,
        title: reservation.reservation_match,
        startTime: reservationDate.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false  // 24시간 형식 사용
        }),
        participants: actualParticipants,
        maxParticipants: maxParticipants,
        day: dayIndex,
      });
    });
    
    console.log('✅ [일정 변환] 완료 - 총 이벤트:', events.length);
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} (${['월', '화', '수', '목', '금', '토', '일'][event.day]} ${event.startTime})`);
    });
    
    return events;
  };
  
  // 샘플 데이터 대신 API 데이터 사용
  const sampleEvents: ScheduleEvent[] = convertApiDataToEvents();
  
  // 주간 날짜 계산
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeek);
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 ~ 23:00

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
  };

  const getEventsForTimeSlot = (timeSlot: number, dayIndex: number) => {
    return sampleEvents.filter(event => {
      const startHour = parseInt(event.startTime.split(':')[0]);
      return event.day === dayIndex && timeSlot === startHour;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <View className="flex-1 bg-white">
      {/* 네비게이션 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigateWeek('prev')}>
          <Text className="text-gray-600 text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-gray-800 font-medium">{formatWeekRange()}</Text>
        <TouchableOpacity onPress={() => navigateWeek('next')}>
          <Text className="text-gray-600 text-lg">→</Text>
        </TouchableOpacity>
      </View>

      {/* 일정표 그리드 */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative">
          {/* 요일 헤더 */}
          <View className="flex-row border-b border-gray-200 bg-gray-50">
            <View className="w-12 h-[55px] justify-center items-center">
              <Text className="text-gray-600 font-medium">시간</Text>
            </View>
            {dayNames.map((day, index) => (
              <View key={index} className="flex-1 h-[55px] justify-center items-center border-l border-gray-200">
                <Text className="text-gray-600 font-medium">{day}</Text>
                <Text className="text-gray-500 text-xs">{formatDate(weekDates[index])}</Text>
              </View>
            ))}
          </View>

          {/* 시간별 행 */}
          {timeSlots.map((timeSlot) => (
            <View key={timeSlot} className="flex-row border-b border-gray-100 bg-white">
              {/* 시간 열 */}
              <View className="w-12 h-[45px] justify-center items-center bg-gray-50">
                <Text className="text-gray-600 text-sm">
                  {timeSlot.toString().padStart(2, '0')}:00
                </Text>
              </View>
              
              {/* 각 요일별 셀 */}
              {dayNames.map((_, dayIndex) => {
                const events = getEventsForTimeSlot(timeSlot, dayIndex);
                return (
                  <View key={dayIndex} className="flex-1 border-l border-gray-200">
                    {/* 고정 높이 셀 */}
                    <View className="h-[45px] bg-white" />
                    {/* 일정 블록들 - 셀 밖으로 넘쳐서 표시 */}
                    <View className="absolute top-0 left-0 right-0">
                      {events.map((event, eventIndex) => (
                        <ScheduleEventBlock
                          key={event.id}
                          title={event.title}
                          participants={event.participants}
                          maxParticipants={event.maxParticipants}
                          top={eventIndex * 25}
                          zIndex={eventIndex + 1}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
          
          {/* 반투명 그리드 오버레이 */}
          <View className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
            {/* 가로 선들 - 시간별 행 구분 */}
            {timeSlots.map((timeSlot, index) => (
              <View 
                key={timeSlot}
                className="absolute left-0 right-0 h-px bg-gray-200 opacity-30"
                style={{
                  top: 55 + (index * 46), // 헤더 높이(55px) + 시간별 행 높이(45px + 1px 테두리) * 인덱스
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
