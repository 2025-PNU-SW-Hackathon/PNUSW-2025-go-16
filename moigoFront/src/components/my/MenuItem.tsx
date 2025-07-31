import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';
import { twMerge } from 'tailwind-merge';

interface MenuItemProps {
  title: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  rightComponent?: React.ReactNode;
  className?: string;
}

export default function MenuItem({
  title,
  icon,
  iconColor,
  onPress,
  rightComponent,
  className = '',
}: MenuItemProps) {
  return (
    <TouchableOpacity className={`p-8 mx-4 bg-white ${className}`} onPress={onPress}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Feather name={icon as any} size={20} color={iconColor} />
          <Text className="ml-3 font-medium text-gray-800">{title}</Text>
        </View>

        {rightComponent ? (
          rightComponent
        ) : (
          <Feather name="chevron-right" size={15} color={COLORS.mainDarkGray} />
        )}
      </View>
    </TouchableOpacity>
  );
}
