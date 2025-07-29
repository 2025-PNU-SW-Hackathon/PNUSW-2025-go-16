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
    <View className="p-6 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View className="gap-2">
          <TagChip
            label={event.sportType}
            color={`${COLORS.mainOrange}20`}
            textColor={`${COLORS.mainOrange}`}
            classNameView="w-12 items-center justify-center"
            classNameText="text-md"
          />
          <Text className="mb-2 font-semibold text-gray-800 text-md" numberOfLines={2}>
            {event.title}
          </Text>
        </View>
        <View className="items-end mb-2">
          <Text className="text-gray-400 text-md">{event.date}</Text>
          <Text className="text-lg font-bold text-gray-800">{event.time}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2 items-center">
          <Feather
            name="user"
            size={14}
            color={COLORS.mainDarkGray}
            className="p-2 rounded-full bg-mainGray"
          />
          <Text className="ml-1 text-gray-600 text-md">{event.participants}</Text>
        </View>

        <View className="flex-row gap-2 items-center">
          <Feather
            name="map-pin"
            size={14}
            color={COLORS.mainDarkGray}
            className="p-2 rounded-full bg-mainGray"
          />
          <Text className="ml-1 text-gray-600 text-md">{event.location}</Text>
        </View>

        <PrimaryButton
          title="참여하기"
          color={COLORS.mainOrange}
          onPress={() => onParticipate(event.id)}
          className="w-24"
        />
      </View>
    </View>
  );
}
