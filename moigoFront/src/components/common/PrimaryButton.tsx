import { TouchableOpacity, Text, Alert, Image, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { getTextColor } from '@/utils';

interface PrimaryButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  color?: string;
  icon?: any; // 아이콘, 이미지 소스, 또는 이모지 문자열
  iconSize?: number; // 아이콘 크기 (기본값: 16)
  className?: string;
}

export default function PrimaryButton({ 
  title = '버튼', 
  onPress = () => Alert.alert('눌림!'), 
  disabled = false, 
  color=COLORS.mainOrange,
  icon,
  iconSize = 16,
  className,
}: PrimaryButtonProps) {
  const textColor = getTextColor(color);
  const buttonColor = disabled ? '#E5E7EB' : color;
  const buttonTextColor = disabled ? '#9CA3AF' : textColor;
  
  return (
    <TouchableOpacity
      className={twMerge("items-center px-5 py-3 rounded-lg", className)}
      style={{ backgroundColor: buttonColor }}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View className="flex-row justify-center items-center">
        {icon && (
          typeof icon === 'string' ? (
            <Text 
              className="mr-2"
              style={{ fontSize: iconSize, color: textColor }}
            >
              {icon}
            </Text>
          ) : (
            <Image 
              source={icon} 
              className="mr-2"
              style={{ width: iconSize, height: iconSize }} 
              resizeMode="contain"
            />
          )
        )}
        <Text 
          className="font-bold"
          style={{ color: buttonTextColor }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
