// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChatRoom } from '@/types/ChatTypes';
import ChatRoomItem from '@/components/chat/ChatRoomItem';

export default function ChatScreen() {
  const navigation = useNavigation();

  // 더미 채팅방 데이터
  const chatRooms: ChatRoom[] = [
    {
      id: '1',
      type: 'matching',
      title: '토트넘 vs 맨시티 매칭방',
      subtitle: '참여자 4명',
      lastMessage: '안녕하세요! 오늘 함께 경기 볼 멤버분들 반갑습니다',
      timestamp: '방금 전',
      unreadCount: 2,
      isHost: true, // 방장
      icon: {
        text: '토',
        backgroundColor: '#FF6B35',
        textColor: '#FFFFFF'
      }
    },
    {
      id: '2',
      type: 'matching',
      title: '리버풀 vs 아스널 매칭방',
      subtitle: '참여자 6명',
      lastMessage: '오늘 경기 정말 기대되네요!',
      timestamp: '10분 전',
      unreadCount: 0,
      isHost: false, // 참여자
      icon: {
        text: '리',
        backgroundColor: '#C8102E',
        textColor: '#FFFFFF'
      }
    },
    {
      id: '3',
      type: 'store',
      title: '챔피언 스포츠 펍',
      subtitle: '강남역 2번 출구',
      lastMessage: '예약이 확정되었습니다. 문의사항이 있으시면 채팅..',
      timestamp: '5분 전',
      unreadCount: 1,
      isHost: false, // 가게 채팅은 방장 개념 없음
      icon: {
        text: 'SPORTS\nPUB',
        backgroundColor: '#000000',
        textColor: '#FFFFFF'
      },
      location: '강남역 2번 출구'
    }
  ];

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    (navigation as any).navigate('ChatRoom', { chatRoom });
  };

  return (
    <View className="flex-1 bg-gray-50">

      <ScrollView className="flex-1 px-4 py-4">
        {/* 매칭 채팅 섹션 */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">매칭 채팅</Text>
          {chatRooms
            .filter(room => room.type === 'matching')
            .map(room => (
              <ChatRoomItem
                key={room.id}
                chatRoom={room}
                onPress={handleChatRoomPress}
              />
            ))}
        </View>

        {/* 가게 채팅 섹션 */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">가게 채팅</Text>
          {chatRooms
            .filter(room => room.type === 'store')
            .map(room => (
              <ChatRoomItem
                key={room.id}
                chatRoom={room}
                onPress={handleChatRoomPress}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  );
}