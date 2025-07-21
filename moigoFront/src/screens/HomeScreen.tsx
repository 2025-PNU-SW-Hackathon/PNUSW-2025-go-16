// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { COLORS } from '@/constants/colors';

// ---------component test--------------
import PrimaryButton from '../components/common/PrimaryButton';
import ModalBox from '../components/common/ModalBox';
import ReservationInfoItem from '../components/common/ReservationInfoItem';
import ReservationStatusBadge from '../components/common/ReservationStatusBadge';
import TagChip from '../components/common/TagChip';
//-------------------------------------

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
       {modalVisible && (
        <ModalBox
          visible={modalVisible}
          title="테스트 모달"
          onClose={() => setModalVisible(false)}>
          <ReservationInfoItem label="날짜" value="7월 20일" />
          <PrimaryButton title="닫기" onPress={() => setModalVisible(false)} />
        </ModalBox>
      )}


      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>홈 화면</Text>

        {/* 1. PrimaryButton 테스트 */}
        <PrimaryButton title="버튼 눌러보기" onPress={() => Alert.alert('눌림!')} />

        {/* 2. 아이콘이 있는 버튼 테스트 */}
        <View style={{ marginTop: 20 }}>
          <PrimaryButton 
            title="스포츠 팬으로 시작하기" 
            color={COLORS.mainOrange}
            icon="👤"
            onPress={() => Alert.alert('스포츠 팬!')} 
          />
        </View>

        <View style={{ marginTop: 10 }}>
          <PrimaryButton 
            title="사업자로 시작하기" 
            color={COLORS.bizButton}
            icon="🏢"
            onPress={() => Alert.alert('사업자!')} 
          />
        </View>

        <View style={{ marginTop: 10 }}>
          <PrimaryButton 
            title="카카오로 시작하기" 
            color={COLORS.kakaoYellow}
            icon="💬"
            onPress={() => Alert.alert('카카오!')} 
          />
        </View>

        {/* 3. 모달 테스트 */}
        <View style={{ marginTop: 20 }}>
          <PrimaryButton title="모달 열기" onPress={() => setModalVisible(true)} />
        </View>


        {/* 3. 상태 뱃지 테스트 */}
        <View style={{ marginTop: 20 }}>
          <ReservationStatusBadge text="예약 대기중" color="#FF9800" />
          <ReservationStatusBadge text="확정됨" color="#4CAF50" />
        </View>

        {/* 4. TagChip 테스트 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 }}>
          <TagChip label="모집중" color="#E0F7FA" textColor="#00796B" />
          <TagChip label="예약완료" />
          <TagChip label="경기 있음" color="#FFF9C4" textColor="#FBC02D" />
        </View>

        <View style={{flexDirection:'row', width:'100%'}}>
          <View style={{width:'50%'}}><PrimaryButton title="수정" color='#DDDDDD'/></View>
          <View style={{width:'50%'}}><PrimaryButton title="확인"/></View>
        </View>
      </ScrollView>
    </View>
  );
}
