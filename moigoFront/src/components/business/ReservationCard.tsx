import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import TagChip from "../common/TagChip";

interface ReservationCardProps {
  eventType: string;
  eventTitle: string;
  time: string;
  participants: string;
  location: string;
  onConfirm: (eventData: {
    title: string;
    type: string;
    time: string;
    participants: string;
    location: string;
  }) => void;
  onReject: (eventData: {
    title: string;
    type: string;
    time: string;
    participants: string;
    location: string;
  }) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  eventType,
  eventTitle,
  time,
  participants,
  location,
  onConfirm,
  onReject,
}) => {
  const handleConfirm = () => {
    onConfirm({
      title: eventTitle,
      type: eventType,
      time,
      participants,
      location,
    });
  };

  const handleReject = () => {
    onReject({
      title: eventTitle,
      type: eventType,
      time,
      participants,
      location,
    });
  };

  return (
    <View className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="mb-2">
            <TagChip 
              label={eventType}
              color="#dbeafe"
              textColor="#2563eb"
            />
          </View>
          <Text className="text-lg font-medium text-gray-800">{eventTitle}</Text>
        </View>
        <Text className="text-lg font-medium text-gray-600">{time}</Text>
      </View>
      
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="justify-center items-center mr-3 w-10 h-10 rounded-full bg-mainGray">
            <Feather name="user" size={16} color={COLORS.mainDarkGray} />
          </View>
          <View>
            <Text className="text-lg font-medium text-gray-800">{participants}</Text>
            <Text className="text-sm text-gray-500">{location}</Text>
          </View>
        </View>
        <View className="flex-row gap-2 items-center">
          <TouchableOpacity 
            className="justify-center items-center w-10 h-10 rounded-full bg-confirmBg"
            onPress={handleConfirm}
            activeOpacity={0.7}
          >
            <Feather name="check" size={16} color={COLORS.confirmText} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="justify-center items-center w-10 h-10 bg-red-200 rounded-full"
            onPress={handleReject}
            activeOpacity={0.7}
          >
            <Feather name="x" size={16} color={COLORS.mainRed} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ReservationCard; 