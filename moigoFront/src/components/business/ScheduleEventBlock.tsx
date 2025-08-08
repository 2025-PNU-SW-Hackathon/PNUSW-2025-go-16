import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScheduleEventBlockProps {
  title: string;
  participants: number;
  maxParticipants: number;
  top: number;
  zIndex: number;
}

export default function ScheduleEventBlock({
  title,
  participants,
  maxParticipants,
  top,
  zIndex,
}: ScheduleEventBlockProps) {
  return (
    <View>
             <LinearGradient
           colors={['#f97316', '#ffffff']}
           className="absolute px-1 py-1 h-[130px] left-0 right-0 mt-[45px]"
           style={{
             top,
             zIndex,
           }}
       >
       </LinearGradient>
      <View
        className="absolute bg-orange-500 px-1 py-1 h-[45px] left-0 right-0"
        style={{
          top,
          zIndex,
        }}
      >
        <Text className="text-white text-xs font-medium" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-white text-xs">
          {participants}/{maxParticipants}명
        </Text>
      </View>
    </View>
  );
}
