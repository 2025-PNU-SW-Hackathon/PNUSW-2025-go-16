import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  // 투명도 조절 방법들:
  // 1. rgba() 사용: style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
  // 2. hex + alpha: style={{ backgroundColor: '#3B82F680' }}
  // 3. opacity 추가: style={{ backgroundColor: color, opacity: 0.8 }}

  return (
    <View className="items-center justify-center flex-1 gap-2 p-4 bg-white border-2 border-mainGray rounded-2xl">
      <View className="mb-2">
        <View
          className="items-center justify-center w-12 h-12 rounded-3xl"
          style={{ backgroundColor: `${color}20` }} // 20% 투명도 (hex + 20)
        >
          <Feather name={icon as any} size={16} color={color} />
        </View>
      </View>
      <Text className="mb-1 text-sm text-gray-600">{title}</Text>
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}
