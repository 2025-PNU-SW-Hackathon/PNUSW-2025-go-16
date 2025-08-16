import { View, Text, StyleSheet } from 'react-native';

interface ReservationStatusBadgeProps {
  text: string;
  color?: string;
}

export default function ReservationStatusBadge({ text, color = '#888' }: ReservationStatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
