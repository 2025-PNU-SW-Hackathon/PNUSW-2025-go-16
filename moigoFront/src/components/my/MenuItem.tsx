import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';
import { twMerge } from 'tailwind-merge';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  rightComponent?: React.ReactNode;
  className?: string;
}

export default function MenuItem({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  rightComponent,
  className = '',
}: MenuItemProps) {
  return (
    <TouchableOpacity className={`p-6 bg-white ${className}`} onPress={onPress}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className="items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Feather name={icon as any} size={20} color={iconColor} />
          </View>

          <View className="flex-col gap-1">
            <Text className="ml-4 font-medium text-gray-800">{title}</Text>
            {subtitle && <Text className="ml-4 text-mainGrayText">{subtitle}</Text>}
          </View>
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
