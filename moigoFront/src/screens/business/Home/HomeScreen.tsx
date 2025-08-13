import { Text, View, ScrollView, Modal, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import StatsCard from "@/components/business/StatsCard";
import ReservationCard from "@/components/business/ReservationCard";
import PromotionCard from "@/components/business/PromotionCard";
import { COLORS } from "@/constants/colors";

export default function BusinessHomeScreen () {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'reject'>('confirm');
  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    type: string;
    time: string;
    participants: string;
    location: string;
  } | null>(null);

  const handleReservationAction = (
    action: 'confirm' | 'reject',
    eventData: {
      title: string;
      type: string;
      time: string;
      participants: string;
      location: string;
    }
  ) => {
    setModalType(action);
    setSelectedEvent(eventData);
    setIsModalVisible(true);
  };

  const handleModalConfirm = () => {
    if (modalType === 'confirm' && selectedEvent) {
      console.log('예약 승인:', selectedEvent.title);
      Alert.alert('승인 완료', '예약이 승인되었습니다.');
    } else if (modalType === 'reject' && selectedEvent) {
      console.log('예약 거절:', selectedEvent.title);
      Alert.alert('거절 완료', '예약이 거절되었습니다.');
    }
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-8 pb-20" showsVerticalScrollIndicator={false}>
        {/* 대시보드 섹션 */}
        <View className="mb-8">
          <View className="p-4 bg-white rounded-2xl border-2 border-mainGray">
            {/* 대시보드 헤더 */}
            <View className="mb-4">
              <Text className="text-xl font-medium text-gray-800">대시보드</Text>
            </View>
            
            {/* 통계 카드들 */}
            <View className="flex-row gap-4">
              <StatsCard title="오늘 예약" value="12" color="blue" />
              <StatsCard title="이번 주" value="45" color="green" />
              <StatsCard title="평점" value="4.8" color="purple" />
            </View>
          </View>
        </View>

        {/* 예약 관리 섹션 */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-800">예약 관리</Text>
            <Text className="text-lg font-semibold text-orange-500">전체보기</Text>
          </View>
          
          {/* 예약 카드들 */}
          <View className="gap-4">
            <ReservationCard
              eventType="축구 경기"
              eventTitle="토트넘 vs 맨시티"
              time="19:30"
              participants="김민준 외 4명"
              location="테이블 3번"
              onConfirm={(eventData) => handleReservationAction('confirm', eventData)}
              onReject={(eventData) => handleReservationAction('reject', eventData)}
            />
            <ReservationCard
              eventType="야구 경기"
              eventTitle="두산 vs LG"
              time="18:00"
              participants="박지현 외 3명"
              location="테이블 5번"
              onConfirm={(eventData) => handleReservationAction('confirm', eventData)}
              onReject={(eventData) => handleReservationAction('reject', eventData)}
            />
            <ReservationCard
              eventType="농구 경기"
              eventTitle="KBL 결승전"
              time="20:00"
              participants="이서연 외 7명"
              location="VIP 룸"
              onConfirm={(eventData) => handleReservationAction('confirm', eventData)}
              onReject={(eventData) => handleReservationAction('reject', eventData)}
            />
          </View>
        </View>

        {/* 프로모션 관리 섹션 */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-medium text-gray-800">프로모션 관리</Text>
            <Text className="text-sm font-medium text-orange-500">추가하기</Text>
          </View>
          
          {/* 프로모션 카드 */}
          <PromotionCard
            status="진행중"
            title="월드컵 기념 맥주 1+1"
            period="7월 10일 ~ 7월 15일"
            description="축구 경기 시청 고객 한정 생맥주 1+1 이벤트"
          />
        </View>
      </ScrollView>

      {/* 확인/거절 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalCancel}
      >
        <View className="flex-1 justify-center items-center px-4 bg-black/50">
          <View className="p-6 w-full max-w-sm bg-white rounded-2xl">
            <View className="items-center mb-4">
              <View className={`w-16 h-16 rounded-full justify-center items-center mb-3 ${
                modalType === 'confirm' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Feather 
                  name={modalType === 'confirm' ? 'check' : 'x'} 
                  size={24} 
                  color={modalType === 'confirm' ? COLORS.confirmText : COLORS.mainRed} 
                />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                {modalType === 'confirm' ? '예약 승인' : '예약 거절'}
              </Text>
              <Text className="mt-2 text-sm text-center text-gray-600">
                {selectedEvent ? (
                  modalType === 'confirm' 
                    ? `"${selectedEvent.title}" 예약을 승인하시겠습니까?`
                    : `"${selectedEvent.title}" 예약을 거절하시겠습니까?`
                ) : ''}
              </Text>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300"
                onPress={handleModalCancel}
                activeOpacity={0.7}
              >
                <Text className="font-medium text-center text-gray-600">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 py-3 px-4 rounded-xl ${
                  modalType === 'confirm' ? 'bg-confirmBg' : 'bg-red-500'
                }`}
                onPress={handleModalConfirm}
                activeOpacity={0.7}
              >
                <Text className={`text-center font-medium ${
                  modalType === 'confirm' ? 'text-confirmText' : 'text-white'
                }`}>
                  {modalType === 'confirm' ? '승인' : '거절'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
