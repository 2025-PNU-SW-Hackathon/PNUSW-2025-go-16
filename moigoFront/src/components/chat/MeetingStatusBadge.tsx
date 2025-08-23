import React from 'react';
import { View, Text } from 'react-native';

interface MeetingStatusBadgeProps {
  status: number; // 0: 모집중, 1: 모집마감, 2: 진행중, 3: 완료
  size?: 'small' | 'medium' | 'large';
}

const MeetingStatusBadge: React.FC<MeetingStatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-2 py-0.5',
          text: 'text-xs'
        };
      case 'large':
        return {
          container: 'px-4 py-2',
          text: 'text-sm'
        };
      default: // medium
        return {
          container: 'px-3 py-1',
          text: 'text-xs'
        };
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 0:
        return {
          text: '모집중',
          emoji: '🔥',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 1:
        return {
          text: '모집마감',
          emoji: '🚫',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 2:
        return {
          text: '진행중',
          emoji: '⚽',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 3:
        return {
          text: '완료',
          emoji: '✅',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          text: '알 수 없음',
          emoji: '❓',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const statusInfo = getStatusInfo();

  return (
    <View className={`flex-row items-center ${statusInfo.bgColor} ${statusInfo.borderColor} rounded-full border ${sizeClasses.container}`}>
      <Text style={{ fontSize: 10 }}>{statusInfo.emoji}</Text>
      <Text className={`${sizeClasses.text} font-semibold ${statusInfo.textColor} ml-1`}>
        {statusInfo.text}
      </Text>
    </View>
  );
};

export default MeetingStatusBadge;

