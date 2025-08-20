import React from 'react';
import { View, Text, Platform } from 'react-native';
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
  const commonStyle = {
    top,
    zIndex,
  };

  // iOS용 부드러운 그라데이션 효과 (여러 레이어로 구현)
  const renderIOSGradient = () => {
    const layers = [];
    const totalHeight = 130;
    const layerCount = 20; // 더 많은 레이어로 부드럽게
    
    for (let i = 0; i < layerCount; i++) {
      const layerHeight = totalHeight / layerCount;
      const layerTop = i * layerHeight;
      
      // 주황색에서 흰색으로 점진적으로 변화
      const progress = i / (layerCount - 1);
      const red = Math.round(249 + (255 - 249) * progress);
      const green = Math.round(115 + (255 - 115) * progress);
      const blue = Math.round(22 + (255 - 22) * progress);
      
      layers.push(
        <View
          key={i}
          className="absolute right-0 left-0"
          style={{
            top: layerTop,
            height: layerHeight,
            backgroundColor: `rgb(${red}, ${green}, ${blue})`,
          }}
        />
      );
    }

    return (
      <View
        className="absolute px-1 py-1 h-[130px] left-0 right-0 mt-[45px]"
        style={commonStyle}
      >
        {layers}
      </View>
    );
  };

  // Android용 LinearGradient
  const renderAndroidGradient = () => {
    return (
      <LinearGradient
        colors={['#f97316', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute px-1 py-1 h-[130px] left-0 right-0 mt-[45px]"
        style={commonStyle}
      >
        <View className="flex-1" />
      </LinearGradient>
    );
  };

  return (
    <View>
      {Platform.OS === 'ios' ? renderIOSGradient() : renderAndroidGradient()}
      <View
        className="absolute bg-orange-500 px-1 py-1 h-[45px] left-0 right-0"
        style={commonStyle}
      >
        <Text className="text-xs font-medium text-white" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs text-white">
          {participants}/{maxParticipants}명
        </Text>
      </View>
    </View>
  );
}
