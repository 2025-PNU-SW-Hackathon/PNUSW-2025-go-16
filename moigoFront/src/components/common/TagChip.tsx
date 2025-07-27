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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
