import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import TagChip from './TagChip';
import { Ionicons } from '@expo/vector-icons';

export interface ReservationCardProps {
  item: {
    status: { text: string; color: string; textColor: string };
    time: string;
    date: string;
    title: string;
    group: string;
    people: string;
    info: string;
    infoIcon: string;
    action: string;
    actionColor: string;
  };
}

export default function ReservationCard({ item }: ReservationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TagChip label={item.status.text} color={item.status.color} textColor={item.status.textColor} />
        <View style={{ flex: 1 }} />
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.group}>{item.group} · {item.people}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.infoRow}>
          <Ionicons name={item.infoIcon as any} size={16} color={COLORS.mainGrayText} style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>{item.info}</Text>
        </View>
        <TouchableOpacity>
          <Text style={[styles.action, { color: item.actionColor }]}>{item.action}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
    color: COLORS.mainDark,
  },
  date: {
    fontSize: 13,
    color: COLORS.mainGrayText,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: COLORS.mainDark,
  },
  group: {
    fontSize: 13,
    color: COLORS.mainGrayText,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.mainGrayText,
  },
  action: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 