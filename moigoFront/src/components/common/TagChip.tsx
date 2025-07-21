import { View, Text, StyleSheet } from 'react-native';

interface TagChipProps {
  label: string;
  color?: string;
  textColor?: string;
}

export default function TagChip({
  label,
  color = '#F0F0F0',
  textColor = '#333',
}: TagChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: color }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
