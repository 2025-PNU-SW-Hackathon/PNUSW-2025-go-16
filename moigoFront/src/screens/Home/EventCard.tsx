import { View, Text, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import TagChip from '@/components/common/TagChip';
import Feather from 'react-native-vector-icons/Feather';
import PrimaryButton from '@/components/common/PrimaryButton';
import { mockEvents } from '@/mocks/events';

interface EventCardProps {
  event: (typeof mockEvents)[0];
  onParticipate: (eventId: string) => void;
}

export default function EventCard({ event, onParticipate }: EventCardProps) {
  return (
    <View className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 mr-4">
          <TagChip
            label={event.sportType}
            color={`${COLORS.mainOrange}20`}
            textColor={`${COLORS.mainOrange}`}
            classNameView="w-12 items-center justify-center"
            classNameText="text-sm"
          />
          <Text className="mb-2 font-semibold text-gray-800 text-base" numberOfLines={2}>
            {event.title}
          </Text>
        </View>
        <View className="items-end mb-2">
          <Text className="text-gray-400 text-sm">{event.date}</Text>
          <Text className="text-lg font-bold text-gray-800">{event.time}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center mr-2">
          <View className="p-2 rounded-full bg-mainGray mr-1">
            <Feather
              name="user"
              size={14}
              color={COLORS.mainDarkGray}
            />
          </View>
          <Text className="text-gray-600 text-sm">{event.participants}</Text>
        </View>

        <View className="flex-row items-center mr-2">
          <View className="p-2 rounded-full bg-mainGray mr-1">
            <Feather
              name="map-pin"
              size={14}
              color={COLORS.mainDarkGray}
            />
          </View>
          <Text className="text-gray-600 text-sm">{event.location}</Text>
        </View>

        <PrimaryButton
          title="참여하기"
          color={COLORS.mainOrange}
          onPress={() => onParticipate(event.id)}
          className="flex-shrink-0"
        />
      </View>
    </View>
  );
}
