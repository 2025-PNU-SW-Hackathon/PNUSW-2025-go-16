import { View, Text, StyleSheet } from 'react-native';

interface ReservationInfoItemProps {
  label: string;
  value: string;
}

export default function ReservationInfoItem({ label, value }: ReservationInfoItemProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontWeight: '400',
    color: '#222',
  },
});
