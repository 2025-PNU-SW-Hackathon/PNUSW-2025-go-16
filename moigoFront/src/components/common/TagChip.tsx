import { View, Text } from 'react-native';

interface TagChipProps {
  label: string;
  color?: string;
  textColor?: string;
  classNameView?: string;
  classNameText?: string;
}

export default function TagChip({
  label,
  color = '#F0F0F0',
  textColor = '#333',
  classNameView,
  classNameText,
}: TagChipProps) {
  return (
    <View 
      className={`self-start px-2 py-1 mr-1 mb-1 rounded-full ${classNameView}`}
      style={{ backgroundColor: color }}
    >
      <Text 
        className={`text-xs font-medium ${classNameText}`}
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
}
