import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';

import TagChip from '@/components/common/TagChip';

import Feather from 'react-native-vector-icons/Feather';

import { COLORS } from '@/constants/colors';

import useMeeting from '@/hooks/useMeeting';

import MeetingModal from './MeetingModal';

// API 데이터를 Reservation 타입으로 변환하는 함수
const convertReservationHistoryToReservation = (reservationHistory: any) => {
  return {
    id: reservationHistory.reservation_id,
    title: reservationHistory.reservation_title || reservationHistory.match_name || reservationHistory.reservation_match,
    description: reservationHistory.reservation_bio || '모임',
    time: new Date(reservationHistory.reservation_start_time).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: new Date(reservationHistory.reservation_start_time).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    type: 'confirmed' as const,
    status: getStatusText(reservationHistory.reservation_status),
    store_id: reservationHistory.store_id,
    max_participant_cnt: reservationHistory.reservation_max_participant_cnt,
  };
};

// 예약 상태를 텍스트로 변환하는 함수
const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return '대기중';
    case 1: return '확정';
    case 2: return '취소';
    case 3: return '완료';
    default: return '알 수 없음';
  }
};

export default function MeetingScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    visible, 
    selectedReservation, 
    matchingHistory, 
    loading, 
    error, 
    openModal, 
    closeModal,
    refreshMatchingHistory
  } = useMeeting();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 참여중인 모임 목록 새로고침
      await refreshMatchingHistory();
    } finally {
      setRefreshing(false);
    }
  }, [refreshMatchingHistory]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={COLORS.mainOrange} />
        <Text className="mt-4 text-gray-600">참여중인 모임 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-white">
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text className="mt-4 text-center text-gray-600">{error}</Text>
        <TouchableOpacity 
          className="px-6 py-3 mt-4 bg-orange-500 rounded-lg"
          onPress={refreshMatchingHistory}
        >
          <Text className="font-bold text-white">다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" >
      <MeetingModal
        visible={visible}
        selectedReservation={selectedReservation}
        onClose={closeModal}
      />

      {/* 예약 현황 타이틀 */}
      <View className="px-4 pt-5 pb-3 bg-white">
        <Text className="text-lg font-bold text-gray-900">참여중인 모임 목록</Text>
        <Text className="mt-1 text-sm text-gray-500">총 {matchingHistory.length}개의 모임에 참여중입니다</Text>
      </View>

      {/* 예약 카드 리스트 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        className="bg-white"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']} // iOS - 메인 오렌지 색상
            tintColor="#FF6B35"  // iOS
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {matchingHistory.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Feather name="calendar" size={48} color="#D1D5DB" />
            <Text className="mt-4 text-center text-gray-500">아직 참여중인 모임이 없습니다</Text>
            <Text className="mt-1 text-sm text-center text-gray-400">첫 번째 모임에 참여해보세요!</Text>
          </View>
        ) : (
          matchingHistory.map((item, idx) => {
            const reservation = convertReservationHistoryToReservation(item);
            return (
              <View
                key={idx}
                className="p-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                style={{ elevation: 2 }}
              >
                {/* 상태 배지 및 시간/일자 */}
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-1 gap-1 mr-3">
                    <TagChip
                      label={getStatusText(item.reservation_status)}
                      color={COLORS.confirmBg}
                      textColor={COLORS.confirmText}
                    />
                    <Text className="text-base font-bold text-gray-900" ellipsizeMode="tail" numberOfLines={1}>{reservation.title}</Text>
                    <Text className="text-sm text-gray-400 mt-0.5">{reservation.description}</Text>
                  </View>
                  <View className="flex-shrink-0 items-end">
                    <Text className="text-base font-bold text-gray-800">{reservation.time}</Text>
                    <Text className="text-sm text-gray-400">{reservation.date}</Text>
                  </View>
                </View>
                {/* 회색 가로줄 */}
                <View className="my-3 h-px bg-gray-200" />
                {/* 예약 상태 및 상세보기 버튼 */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Feather name="users" size={15} color="#67C23A" />
                    <Text className="ml-1 text-sm text-gray-500">
                      {item.reservation_participant_cnt}/{item.reservation_max_participant_cnt}명
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => openModal(reservation)}>
                    <Text className="font-bold text-md" style={{ color: COLORS.mainOrange }}>
                      상세보기
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
