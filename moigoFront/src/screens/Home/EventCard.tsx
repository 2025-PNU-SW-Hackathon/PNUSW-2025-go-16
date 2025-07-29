import { View, Text, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import TagChip from '@/components/common/TagChip';
import Feather from 'react-native-vector-icons/Feather';
import PrimaryButton from '@/components/common/PrimaryButton';
import { mockEvents } from '@/mocks/events';

export default function EventCard({ event }: { event: (typeof mockEvents)[0] }) {
  const handleParticipate = (eventId: string) => {
    Alert.alert('참여하기', '이벤트에 참여하시겠습니까?');
  };

  return (
    <View className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
      <View className="flex-row items-center justify-between mb-4">
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
        <View className="items-start mb-2">
          <Text className="text-gray-400 text-md">{event.date}</Text>
          <Text className="text-lg font-bold text-gray-800">{event.time}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather
            name="users"
            size={14}
            color={COLORS.mainDarkGray}
            className="p-2 rounded-full bg-mainGray"
          />
          <Text className="ml-1 text-gray-600 text-md">{event.participants}</Text>
        </View>

        <View className="flex-row items-center">
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
          onPress={() => handleParticipate(event.id)}
          className="w-24"
        />
      </View>
    </View>
  );
}
