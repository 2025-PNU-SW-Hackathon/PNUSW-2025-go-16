import { View, Text, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import TagChip from '@/components/common/TagChip';
import Feather from 'react-native-vector-icons/Feather';
import PrimaryButton from '@/components/common/PrimaryButton';
import type { MatchDTO } from '@/types/DTO/reservations';

interface EventCardProps {
  event: MatchDTO | any; // 경기 데이터와 기존 데이터 모두 지원
  onParticipate: (event: any) => void;
}

export default function EventCard({ event, onParticipate }: EventCardProps) {
  // 경기 데이터와 기존 데이터의 필드명 통합 처리
  const eventTitle = event.title || event.reservation_match || `${event.home_team} vs ${event.away_team}` || '제목 없음';
  const eventLocation = event.location || event.store_name || event.venue || '위치 정보 없음';
  // reservation_ex2 (competition_code)를 우선적으로 사용하여 TagChip에 표시
  const eventSportType = event.reservation_ex2 || event.sportType || event.reservation_ex1 || event.competition_code || '스포츠';
  const eventDate = event.date || event.reservation_start_time || event.match_date;
  const eventTime = event.time || event.reservation_start_time || event.match_date;
  const eventParticipants = event.participants || `${event.reservation_participant_cnt || 0}/${event.reservation_max_participant_cnt || 0}명`;
  const eventId = event.id || event.reservation_id;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '/').replace(/\./g, '');
    } catch {
      return dateString;
    }
  };

  // 시간 포맷팅
  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeString;
    }
  };

  return (
    <View className="p-6 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1 mr-4">
          <TagChip
            label={eventSportType}
            color={`${COLORS.mainOrange}20`}
            textColor={`${COLORS.mainOrange}`}
            classNameView="w-12 items-center justify-center"
            classNameText="text-sm"
          />
          <Text className="my-2 text-lg font-semibold text-gray-800" numberOfLines={1}>
            {eventTitle}
          </Text>
        </View>
        <View className="items-end mb-2">
          <Text className="text-sm text-gray-400">
            {formatDate(eventDate)}
          </Text>
          <Text className="text-lg font-bold text-gray-800">
            {formatTime(eventTime)}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center mr-2">
          <View className="p-2 mr-1 rounded-full bg-mainGray">
            <Feather
              name="user"
              size={14}
              color={COLORS.mainDarkGray}
            />
          </View>
          <Text className="text-sm text-gray-600">
            {eventParticipants}
          </Text>
        </View>

        <View className="flex-row items-center mr-2">
          <View className="p-2 mr-1 rounded-full bg-mainGray">
            <Feather
              name="map-pin"
              size={14}
              color={COLORS.mainDarkGray}
            />
          </View>
          <Text className="text-sm text-gray-600">
            {eventLocation}
          </Text>
        </View>

        <PrimaryButton
          title="참여하기"
          color={COLORS.mainOrange}
          onPress={() => onParticipate(event)}
          className="flex-shrink-0"
        />
      </View>
    </View>
  );
}
