import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TagChip from '@/components/common/TagChip';

import Feather from 'react-native-vector-icons/Feather';

import { reservations } from '@/mocks/reservations';

import { COLORS } from '@/constants/colors';

import useMeeting from '@/hooks/useMeeting';

import MeetingModal from './MeetingModal';

export default function MeetingScreen() {
  const { visible, selectedReservation, openModal, closeModal } = useMeeting();
  return (
    <View className="flex-1 bg-white" >
      <MeetingModal
        visible={visible}
        selectedReservation={selectedReservation}
        onClose={closeModal}
      />

      {/* 예약 현황 타이틀 */}
      <View className="px-4 pt-5 pb-3 bg-white">
        <Text className="text-lg font-bold text-gray-900">예약 현황</Text>
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
        {reservations.map((item, idx) => (
          <View
            key={idx}
            className="p-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
            style={{ elevation: 2 }}
          >
            {/* 상태 배지 및 시간/일자 */}
            <View className="flex-row justify-between items-center mb-2">
              <View className="gap-1">
                {item.type === 'collecting' && (
                  <TagChip label="모집중" color={COLORS.recruitBg} textColor={COLORS.recruitText} />
                )}
                {item.type === 'waiting' && (
                  <TagChip label="예약중" color={COLORS.reserveBg} textColor={COLORS.reserveText} />
                )}
                {item.type === 'confirmed' && (
                  <TagChip
                    label="예약 확정"
                    color={COLORS.confirmBg}
                    textColor={COLORS.confirmText}
                  />
                )}
                <Text className="text-base font-bold text-gray-900">{item.title}</Text>
                <Text className="text-sm text-gray-400 mt-0.5">{item.description}</Text>
              </View>
              <View className="items-end">
                <Text className="text-base font-bold text-gray-800">{item.time}</Text>
                <Text className="text-sm text-gray-400">{item.date}</Text>
              </View>
            </View>
            {/* 회색 가로줄 */}
            <View className="my-3 h-px bg-gray-200" />
            {/* 예약 상태 및 상세보기 버튼 */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                {item.type === 'collecting' && (
                  <>
                    <Feather name="clock" size={15} color="#A3A3A3" />
                    <Text className="ml-1 text-sm text-gray-500">{item.status}</Text>
                  </>
                )}
                {item.type === 'waiting' && (
                  <>
                    <Feather name="credit-card" size={15} color="#A3A3A3" />
                    <Text className="ml-1 text-sm text-gray-500">{item.status}</Text>
                  </>
                )}
                {item.type === 'confirmed' && (
                  <>
                    <Feather name="check" size={15} color="#67C23A" />
                    <Text className="ml-1 text-sm text-gray-500">{item.status}</Text>
                  </>
                )}
              </View>
              <TouchableOpacity onPress={() => openModal(item)}>
                <Text className="font-bold text-md" style={{ color: COLORS.mainOrange }}>
                  상세보기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
