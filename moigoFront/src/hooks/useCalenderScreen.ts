import { useState, useCallback } from 'react';
import { useMatches, useStoreSchedule } from './queries/useUserQueries';
import type { MatchDTO, ScheduleEventDTO } from '../types/DTO/users';

export const useCalenderScreen = () => {
  // 현재 선택된 날짜 범위 (7일)
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(),
    end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 7일 후
  });

  // 경기 정보 조회 (명세서 기반)
  const {
    data: matchesData,
    isLoading: isMatchesLoading,
    error: matchesError,
    refetch: refetchMatches,
  } = useMatches({
    date_from: selectedDateRange.start.toISOString().split('T')[0],
    date_to: selectedDateRange.end.toISOString().split('T')[0],
    status: 'SCHEDULED', // 예정된 경기만
    sort: 'match_date:asc', // 날짜 오름차순
    all: true, // 전체 조회
  });

  // 매장 일정 조회 (예약 목록)
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useStoreSchedule({
    date_from: selectedDateRange.start.toISOString().split('T')[0],
    date_to: selectedDateRange.end.toISOString().split('T')[0],
    page_size: 100, // 충분한 데이터 조회
  });

  // 날짜 범위 변경
  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    console.log('📅 [일정] 날짜 범위 변경:', { start, end });
    setSelectedDateRange({ start, end });
  }, []);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    console.log('🔄 [일정] 새로고침 시작');
    try {
      await Promise.all([
        refetchMatches(),
        refetchSchedule(),
      ]);
      console.log('✅ [일정] 새로고침 완료');
    } catch (error) {
      console.error('❌ [일정] 새로고침 실패:', error);
    }
  }, [refetchMatches, refetchSchedule]);

  // 날짜 이동 (이전/다음 주)
  const goToPreviousWeek = useCallback(() => {
    setSelectedDateRange(prev => {
      const newStart = new Date(prev.start.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newEnd = new Date(prev.end.getTime() - 7 * 24 * 60 * 60 * 1000);
      console.log('⬅️ [일정] 이전 주 이동:', { newStart, newEnd });
      return { start: newStart, end: newEnd };
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setSelectedDateRange(prev => {
      const newStart = new Date(prev.start.getTime() + 7 * 24 * 60 * 60 * 1000);
      const newEnd = new Date(prev.end.getTime() + 7 * 24 * 60 * 60 * 1000);
      console.log('➡️ [일정] 다음 주 이동:', { newStart, newEnd });
      return { start: newStart, end: newEnd };
    });
  }, []);

  // 오늘로 이동
  const goToToday = useCallback(() => {
    const today = new Date();
    const endDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
    console.log('🏠 [일정] 오늘로 이동:', { today, endDate });
    setSelectedDateRange({
      start: today,
      end: endDate,
    });
  }, []);

  // 데이터 상태
  const isLoading = isMatchesLoading || isScheduleLoading;
  const hasError = matchesError || scheduleError;

  // 경기 데이터
  const matches = matchesData?.data || [];
  const schedule = scheduleData?.data || [];

  // 메타 정보
  const matchesMeta = matchesData?.meta;
  const scheduleMeta = scheduleData?.meta;

  console.log('📊 [일정] 데이터 상태:', {
    matchesCount: matches.length,
    scheduleCount: schedule.length,
    isLoading,
    hasError,
    dateRange: selectedDateRange,
  });

  return {
    // 상태
    selectedDateRange,
    isLoading,
    hasError,
    matches,
    schedule,
    matchesMeta,
    scheduleMeta,
    
    // 액션
    handleDateRangeChange,
    handleRefresh,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    
    // 개별 refetch
    refetchMatches,
    refetchSchedule,
  };
};
