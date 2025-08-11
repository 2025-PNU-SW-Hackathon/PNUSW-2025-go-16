import { TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <TouchableOpacity
      className={`w-12 h-6 rounded-full p-0.5 ${
        value ? 'bg-mainOrange' : 'bg-gray-300'
      } ${disabled ? 'opacity-50' : ''}`}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <View
        className={`w-5 h-5 rounded-full bg-white shadow-sm ${
          value ? 'ml-auto' : 'mr-auto'
        }`}
      />
    </TouchableOpacity>
  );
} 