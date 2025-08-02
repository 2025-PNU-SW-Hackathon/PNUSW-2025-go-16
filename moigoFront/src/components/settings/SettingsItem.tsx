import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';
import ToggleSwitch from '@/components/common/ToggleSwitch';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  showArrow?: boolean;
  value?: string;
}

export default function SettingsItem({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  rightComponent,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  showArrow = true,
  value,
}: SettingsItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      className={`mx-4 mb-2 p-4 bg-white rounded-2xl shadow-sm ${!onPress ? 'opacity-50' : ''}`}
      onPress={handlePress}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Feather name={icon as any} size={20} color={iconColor} />
          <View className="ml-3 flex-1">
            <Text className="text-gray-800 font-medium">{title}</Text>
            {subtitle && (
              <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
            )}
          </View>
        </View>
        
        <View className="flex-row items-center">
          {value && (
            <Text className="text-gray-500 font-medium mr-2">{value}</Text>
          )}
          
          {showToggle && onToggleChange ? (
            <ToggleSwitch
              value={toggleValue}
              onValueChange={onToggleChange}
            />
          ) : rightComponent ? (
            rightComponent
          ) : showArrow ? (
            <Feather name="chevron-right" size={15} color={COLORS.mainDarkGray} />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
} 