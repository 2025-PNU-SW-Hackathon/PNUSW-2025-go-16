import { TouchableOpacity, Text, StyleSheet, Alert, Image, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { getTextColor } from '@/utils';

interface PrimaryButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  color?: string;
  icon?: any; // 아이콘, 이미지 소스, 또는 이모지 문자열
  iconSize?: number; // 아이콘 크기 (기본값: 16)
}

export default function PrimaryButton({ 
  title = '버튼', 
  onPress = () => Alert.alert('눌림!'), 
  disabled = false, 
  color=COLORS.mainOrange,
  icon,
  iconSize = 16
}: PrimaryButtonProps) {
  const textColor = getTextColor(color);
  
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, {backgroundColor:color}]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.content}>
        {icon && (
          typeof icon === 'string' ? (
            <Text style={[styles.iconText, { fontSize: iconSize, color: textColor }]}>{icon}</Text>
          ) : (
            <Image 
              source={icon} 
              style={[styles.icon, { width: iconSize, height: iconSize }]} 
              resizeMode="contain"
            />
          )
        )}
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  iconText: {
    marginRight: 8,
  },
  text: {
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
});
