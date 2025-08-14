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
  status?: string;
  statusColor?: string;
  onConfirm: (eventData: any) => void;
  onReject: (eventData: any) => void;
  disabled?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  eventType,
  eventTitle,
  time,
  participants,
  location,
  status,
  statusColor = 'gray',
  onConfirm,
  onReject,
  disabled = false,
}) => {
  const handleConfirm = () => {
    if (disabled) return;
    onConfirm({
      title: eventTitle,
      type: eventType,
      time,
      participants,
      location,
    });
  };

  const handleReject = () => {
    if (disabled) return;
    onReject({
      title: eventTitle,
      type: eventType,
      time,
      participants,
      location,
    });
  };

  // 상태에 따른 색상 결정
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'yellow': return '#FCD34D';
      case 'green': return '#10B981';
      case 'red': return '#EF4444';
      case 'blue': return '#3B82F6';
      default: return '#9CA3AF';
    }
  };

  const statusBgColor = getStatusColor(statusColor);

  return (
    <View className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-2">
            <TagChip 
              label={eventType}
              color="#dbeafe"
              textColor="#2563eb"
            />
            {status && (
              <View 
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: statusBgColor + '20' }}
              >
                <Text 
                  className="text-xs font-medium"
                  style={{ color: statusBgColor }}
                >
                  {status}
                </Text>
              </View>
            )}
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
            className={`justify-center items-center w-10 h-10 rounded-full ${
              disabled ? 'bg-gray-200' : 'bg-confirmBg'
            }`}
            onPress={handleConfirm}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
          >
            <Feather 
              name="check" 
              size={16} 
              color={disabled ? COLORS.mainGray : COLORS.confirmText} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            className={`justify-center items-center w-10 h-10 rounded-full ${
              disabled ? 'bg-gray-200' : 'bg-red-200'
            }`}
            onPress={handleReject}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
          >
            <Feather 
              name="x" 
              size={16} 
              color={disabled ? COLORS.mainGray : COLORS.mainRed} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ReservationCard; 