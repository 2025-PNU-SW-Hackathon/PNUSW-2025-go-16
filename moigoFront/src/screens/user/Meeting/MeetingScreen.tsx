import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TagChip from '@/components/common/TagChip';

import Feather from 'react-native-vector-icons/Feather';

import { COLORS } from '@/constants/colors';

import useMeeting from '@/hooks/useMeeting';

import MeetingModal from './MeetingModal';

// API 데이터를 Reservation 타입으로 변환하는 함수
const convertMatchingHistoryToReservation = (matchingHistory: any) => {
  return {
    id: matchingHistory.reservation_id,
    title: matchingHistory.reservation_match,
    description: matchingHistory.store_name,
    time: new Date(matchingHistory.reservation_start_time).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: new Date(matchingHistory.reservation_start_time).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    type: 'confirmed' as const, // API에서 받은 status에 따라 결정
    status: matchingHistory.status,
  };
};

export default function MeetingScreen() {
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

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.mainOrange} />
        <Text className="mt-4 text-gray-600">매칭 이력을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-4">
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text className="mt-4 text-center text-gray-600">{error}</Text>
        <TouchableOpacity 
          className="mt-4 px-6 py-3 bg-orange-500 rounded-lg"
          onPress={refreshMatchingHistory}
        >
          <Text className="text-white font-bold">다시 시도</Text>
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
        <Text className="text-lg font-bold text-gray-900">참여한 매칭 이력</Text>
        <Text className="text-sm text-gray-500 mt-1">총 {matchingHistory.length}개의 매칭에 참여했습니다</Text>
      </View>

      {/* 예약 카드 리스트 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        className="bg-white"
      >
        {matchingHistory.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Feather name="calendar" size={48} color="#D1D5DB" />
            <Text className="mt-4 text-gray-500 text-center">아직 참여한 매칭이 없습니다</Text>
            <Text className="text-sm text-gray-400 text-center mt-1">첫 번째 매칭에 참여해보세요!</Text>
          </View>
        ) : (
          matchingHistory.map((item, idx) => {
            const reservation = convertMatchingHistoryToReservation(item);
            return (
              <View
                key={idx}
                className="p-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                style={{ elevation: 2 }}
              >
                {/* 상태 배지 및 시간/일자 */}
                <View className="flex-row justify-between items-center mb-2">
                  <View className="gap-1">
                    <TagChip
                      label={item.status}
                      color={COLORS.confirmBg}
                      textColor={COLORS.confirmText}
                    />
                    <Text className="text-base font-bold text-gray-900">{reservation.title}</Text>
                    <Text className="text-sm text-gray-400 mt-0.5">{reservation.description}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-bold text-gray-800">{reservation.time}</Text>
                    <Text className="text-sm text-gray-400">{reservation.date}</Text>
                  </View>
                </View>
                {/* 회색 가로줄 */}
                <View className="my-3 h-px bg-gray-200" />
                {/* 예약 상태 및 상세보기 버튼 */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Feather name="check" size={15} color="#67C23A" />
                    <Text className="ml-1 text-sm text-gray-500">{item.status}</Text>
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
