import { Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import StatsCard from "@/components/business/StatsCard";
import ReservationCard from "@/components/business/ReservationCard";
import PromotionCard from "@/components/business/PromotionCard";
import AcceptModal from "./AcceptModal";
import RejectModal from "./RejectModal";
import { COLORS } from "@/constants/colors";
import { useBusinessHomeScreen } from "@/hooks/useHomeScreen";
import Toast from "@/components/common/Toast";

export default function BusinessHomeScreen() {
  const {
    // 데이터
    dashboardData,
    reservations,
    selectedReservation,
    
    // 로딩 상태
    isLoading,
    
    // 모달 상태
    showAcceptModal,
    showRejectModal,
    
    // 액션 함수들
    openAcceptModal,
    openRejectModal,
    closeModals,
    handleAcceptReservation,
    handleRejectReservation,
    handleRefresh, // 새로고침 함수
    
    // 통계
    stats,
    
    // 뮤테이션 상태
    isAccepting,
    isRejecting,
  } = useBusinessHomeScreen();

  const [refreshing, setRefreshing] = useState(false);

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('Pull-to-refresh 시작');
      
      // 실제 API 재호출
      await handleRefresh();
      
      console.log('Pull-to-refresh 완료');
    } catch (error) {
      console.error('새로고침 중 에러:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 참가자 정보를 "이야구 외 몇명" 형태로 파싱하는 함수
  const parseParticipants = (participantInfo: string) => {
    if (!participantInfo || participantInfo === '참가자 없음') {
      return '참가자 없음';
    }
    
    // 쉼표로 구분된 참가자 목록을 배열로 변환
    const participants = participantInfo.split(',').map(p => p.trim());
    
    if (participants.length === 0) {
      return '참가자 없음';
    }
    
    if (participants.length === 1) {
      return participants[0];
    }
    
    // 첫 번째 참가자 + "외 N명" 형태로 반환
    const firstParticipant = participants[0];
    const otherCount = participants.length - 1;
    
    return `${firstParticipant} 외 ${otherCount}명`;
  };

  // 평점을 소수점 한 자리까지만 표시하는 함수
  const formatRating = (rating: string | number) => {
    const numRating = parseFloat(rating.toString());
    if (isNaN(numRating)) return '0.0';
    return numRating.toFixed(1);
  };

  // 예약 상태에 따른 색상 반환
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'orange';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'CANCELLED':
        return 'gray';
      case 'COMPLETED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // 예약 상태에 따른 텍스트 반환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return '대기중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      case 'CANCELLED':
        return '취소됨';
      case 'COMPLETED':
        return '완료됨';
      default:
        return '알 수 없음';
    }
  };

  // 예약 액션 처리
  const handleReservationAction = (
    action: 'confirm' | 'reject',
    reservation: any
  ) => {
    if (action === 'confirm') {
      openAcceptModal(reservation);
    } else {
      openRejectModal(reservation);
    }
  };

  // 예약 수락 처리
  const handleAccept = async () => {
    if (selectedReservation) {
      await handleAcceptReservation(selectedReservation.reservation_id);
    }
  };

  // 예약 거절 처리
  const handleReject = async (reason?: string) => {
    if (selectedReservation) {
      await handleRejectReservation(selectedReservation.reservation_id, reason);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">로딩 중...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-4 pt-8 pb-20" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.mainOrange]} // Android용 색상
            tintColor={COLORS.mainOrange} // iOS용 색상
          />
        }
      >
        {/* 대시보드 섹션 */}
        <View className="mb-8">
          <View className="p-4 bg-white rounded-2xl border-2 border-mainGray">
            {/* 대시보드 헤더 */}
            <View className="mb-4">
              <Text className="text-xl font-medium text-gray-800">
                매장 대시보드
              </Text>
            </View>
            
            {/* 통계 카드들 */}
            <View className="flex-row gap-4">
              <StatsCard 
                title="오늘 예약" 
                value={stats.todayReservations.toString()} 
                color="blue" 
              />
              <StatsCard 
                title="이번 주" 
                value={stats.weeklyReservations.toString()} 
                color="green" 
              />
              <StatsCard 
                title="평점" 
                value={formatRating(stats.averageRating)} 
                color="purple" 
              />
              <StatsCard 
                title="대기중" 
                value={stats.pendingReservations.toString()} 
                color="yellow" 
              />
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
          {reservations.length > 0 ? (
            <View className="gap-4">
              {reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.reservation_id}
                  eventType={reservation.reservation_match}
                  eventTitle={reservation.reservation_match}
                  time={new Date(reservation.reservation_start_time).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  participants={parseParticipants(reservation.reservation_participant_info)}
                  location={reservation.reservation_table_info || '매장'}
                  status={getStatusText(reservation.reservation_status)}
                  statusColor={getStatusColor(reservation.reservation_status)}
                  onConfirm={() => handleReservationAction('confirm', reservation)}
                  onReject={() => handleReservationAction('reject', reservation)}
                  disabled={reservation.reservation_status !== 'PENDING_APPROVAL'} // 대기중이 아니면 버튼 비활성화
                />
              ))}
            </View>
          ) : (
            <View className="items-center p-8 bg-gray-50 rounded-xl">
              <Feather name="calendar" size={48} color={COLORS.mainGray} />
              <Text className="mt-3 text-lg font-medium text-gray-600">예약이 없습니다</Text>
              <Text className="mt-1 text-sm text-gray-500">새로운 예약을 기다려보세요</Text>
            </View>
          )}
        </View>

        {/* 프로모션 관리 섹션 */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-medium text-gray-800">프로모션 관리</Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-orange-500">추가하기</Text>
            </TouchableOpacity>
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
        visible={showAcceptModal}
        onClose={closeModals}
        onConfirm={handleAccept}
        eventData={selectedReservation}
        isLoading={isAccepting}
      />
      
      <RejectModal
        visible={showRejectModal}
        onClose={closeModals}
        onConfirm={handleReject}
        eventData={selectedReservation}
        isLoading={isRejecting}
      />
    </View>
  );
}
