import { View, Text, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import TagChip from '@/components/common/TagChip';
import Feather from 'react-native-vector-icons/Feather';
import PrimaryButton from '@/components/common/PrimaryButton';


interface EventCardProps {
  event: any; // API 데이터와 mock 데이터 모두 지원
  onParticipate: (eventId: string) => void;
}

export default function EventCard({ event, onParticipate }: EventCardProps) {
  return (
    <View className="p-6 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1 mr-4">
          <TagChip
            label={event.sportType || event.reservation_ex1 || '스포츠'}
            color={`${COLORS.mainOrange}20`}
            textColor={`${COLORS.mainOrange}`}
            classNameView="w-12 items-center justify-center"
            classNameText="text-sm"
          />
          <Text className="my-2 text-lg font-semibold text-gray-800" numberOfLines={1}>
            {event.title || event.reservation_match || event.reservation_bio}
          </Text>
        </View>
        <View className="items-end mb-2">
          <Text className="text-sm text-gray-400">
            {event.date || new Date(event.reservation_start_time).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '/').replace(/\./g, '')}
          </Text>
          <Text className="text-lg font-bold text-gray-800">
            {event.time || new Date(event.reservation_start_time).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
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
            {event.participants || `${event.reservation_participant_cnt}/${event.reservation_max_participant_cnt}명`}
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
            {event.location || event.reservation_store_name || '위치 정보 없음'}
          </Text>
        </View>

        <PrimaryButton
          title="참여하기"
          color={COLORS.mainOrange}
          onPress={() => onParticipate(event.id || event.reservation_id)}
          className="flex-shrink-0"
        />
      </View>
    </View>
  );
}
