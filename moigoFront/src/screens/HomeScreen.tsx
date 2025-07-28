// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import ReservationCard from '../components/common/ReservationCard';
import { Ionicons } from '@expo/vector-icons';

// 예약 카드 더미 데이터
const reservations = [
  {
    id: 1,
    status: { text: '모집중', color: '#FFE0B2', textColor: '#FF9800' },
    time: '19:30',
    date: '7월 06일',
    title: '토트넘 vs 맨시티',
    group: '스포츠 팬 클럽',
    people: '4인 예약',
    info: '인원 모집중',
    infoIcon: 'time',
    action: '상세보기',
    actionColor: COLORS.mainOrange,
  },
  {
    id: 2,
    status: { text: '예약중', color: '#E3EDFF', textColor: '#2563EB' },
    time: '20:00',
    date: '7월 06일',
    title: 'KBL 결승전',
    group: '챔피언 스포츠 펍',
    people: '3인 예약',
    info: '30분 내 입금 필요',
    infoIcon: 'alert-circle',
    action: '상세보기',
    actionColor: COLORS.mainOrange,
  },
  {
    id: 3,
    status: { text: '예약 확정', color: '#DCFCE7', textColor: '#16A34A' },
    time: '18:00',
    date: '7월 06일',
    title: '두산 vs LG',
    group: '스포츠 타임',
    people: '6인 예약',
    info: '예약이 확정되었습니다',
    infoIcon: 'checkmark',
    action: '상세보기',
    actionColor: COLORS.mainOrange,
  },
];

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* 상단 앱바 */}
      <View style={styles.appBar}>
        <Text style={styles.logo}>🦊</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="notifications-outline" size={24} color={COLORS.mainDarkGray} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        <Text style={styles.sectionTitle}>예약 현황</Text>
        {reservations.map(item => (
          <ReservationCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.mainOrange,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
    color: COLORS.mainDark,
  },
});
