import { Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import StatsCard from "@/components/business/StatsCard";
import ReservationCard from "@/components/business/ReservationCard";
import PromotionCard from "@/components/business/PromotionCard";
import AcceptModal from "./AcceptModal";
import RejectModal from "./RejectModal";
import { COLORS } from "@/constants/colors";

export default function BusinessHomeScreen () {
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
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
    setSelectedEvent(eventData);
    if (action === 'confirm') {
      setIsAcceptModalVisible(true);
    } else {
      setIsRejectModalVisible(true);
    }
  };

  const handleModalConfirm = () => {
    if (selectedEvent) {
      if (isAcceptModalVisible) {
        console.log('예약 승인:', selectedEvent.title);
        Alert.alert('승인 완료', '예약이 승인되었습니다.');
      } else {
        console.log('예약 거절:', selectedEvent.title);
        Alert.alert('거절 완료', '예약이 거절되었습니다.');
      }
    }
    setIsAcceptModalVisible(false);
    setIsRejectModalVisible(false);
    setSelectedEvent(null);
  };

  const handleModalCancel = () => {
    setIsAcceptModalVisible(false);
    setIsRejectModalVisible(false);
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

      {/* 분리된 모달들 */}
      <AcceptModal
        visible={isAcceptModalVisible}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        eventData={selectedEvent}
      />
      
      <RejectModal
        visible={isRejectModalVisible}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        eventData={selectedEvent}
      />
    </View>
  );
};
