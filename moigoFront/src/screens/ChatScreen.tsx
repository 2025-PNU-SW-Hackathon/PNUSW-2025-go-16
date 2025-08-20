// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChatRooms } from '@/hooks/queries/useChatQueries';
import { ChatRoom } from '@/types/ChatTypes';
import ChatRoomItem from '@/components/chat/ChatRoomItem';
import { formatTimeAgo } from '@/utils/dateUtils';
import type { ChatRoomDTO } from '@/types/DTO/chat';
import { useAuthStore } from '@/store/authStore';

export default function ChatScreen() {
  const navigation = useNavigation();
  const { data, isLoading, error, refetch } = useChatRooms();
  const { user } = useAuthStore();

  // API 데이터를 기존 ChatRoom 형식으로 변환
  const convertToChatRoom = (apiData: ChatRoomDTO): ChatRoom => {
    const isMatching = apiData.name.includes('모임') || apiData.name.includes('매칭');
    const isStore = apiData.name.includes('펍') || apiData.name.includes('스포츠');
    
    // 아이콘 생성 로직
    const getIcon = (name: string, type: 'matching' | 'store') => {
      if (type === 'store') {
        return {
          text: 'SPORTS\nPUB',
          backgroundColor: '#000000',
          textColor: '#FFFFFF'
        };
      }
      
      // 매칭방의 경우 첫 글자로 아이콘 생성
      const firstChar = name.charAt(0);
      const colors = ['#FF6B35', '#C8102E', '#1E3A8A', '#059669', '#DC2626'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      return {
        text: firstChar,
        backgroundColor: randomColor,
        textColor: '#FFFFFF'
      };
    };

    const type: 'matching' | 'store' = isStore ? 'store' : 'matching';
    const icon = getIcon(apiData.name, type);

    // 방장 ID는 sender_id를 사용
    const host_id = apiData.sender_id || '';
    
    // 실제 방장 여부 판단: 현재 사용자 ID와 sender_id 비교
    const isHost = user?.id === apiData.sender_id;

    return {
      id: apiData.chat_room_id.toString(),
      type,
      title: apiData.name,
      subtitle: type === 'store' ? '강남역 2번 출구' : `참여자 ${Math.floor(Math.random() * 10) + 2}명`,
      lastMessage: apiData.last_message || '메시지가 없습니다.',
      timestamp: formatTimeAgo(apiData.last_message_time),
      unreadCount: Math.floor(Math.random() * 5), // 임시로 랜덤 값
      isHost: isHost, // 실제 방장 여부 사용
      host_id: host_id, // 방장 ID 추가
      icon,
      location: type === 'store' ? '강남역 2번 출구' : undefined
    };
  };

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    // API 데이터에서 해당 채팅방 찾기
    const apiData = data as any;
    const apiChatRoom = apiData?.data?.find((room: ChatRoomDTO) => room.chat_room_id.toString() === chatRoom.id);
    if (apiChatRoom) {
      // 방장 여부를 다시 계산
      const isHost = user?.id === apiChatRoom.sender_id;
      
      // 완전한 ChatRoom 객체로 전달
      const convertedChatRoom = {
        chat_room_id: apiChatRoom.chat_room_id,
        name: apiChatRoom.name,
        last_message: apiChatRoom.last_message,
        last_message_time: apiChatRoom.last_message_time,
        sender_id: apiChatRoom.sender_id,
        isHost: isHost, // 방장 여부 추가
        host_id: apiChatRoom.sender_id // 방장 ID 추가
      };
      (navigation as any).navigate('ChatRoom', { chatRoom: convertedChatRoom });
    }
  };

  // 로딩 상태
  if (isLoading && !(data as any)?.data) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-gray-600 mt-4">채팅방을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-4">
        <Text className="text-gray-600 text-center mb-4">채팅방 목록을 불러오는데 실패했습니다.</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // API 데이터를 기존 형식으로 변환
  const apiData = data as any;
  const chatRooms: ChatRoom[] = (apiData?.data || []).map(convertToChatRoom);

  // 매칭과 가게 채팅방 분리
  const matchingRooms = chatRooms.filter(room => room.type === 'matching');
  const storeRooms = chatRooms.filter(room => room.type === 'store');

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* 매칭 채팅 섹션 */}
        {matchingRooms.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">매칭 채팅</Text>
            {matchingRooms.map(room => (
              <ChatRoomItem
                key={room.id}
                chatRoom={room}
                onPress={handleChatRoomPress}
              />
            ))}
          </View>
        )}

        {/* 가게 채팅 섹션 */}
        {storeRooms.length > 0 && (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">가게 채팅</Text>
            {storeRooms.map(room => (
              <ChatRoomItem
                key={room.id}
                chatRoom={room}
                onPress={handleChatRoomPress}
              />
            ))}
          </View>
        )}

        {/* 빈 상태 */}
        {chatRooms.length === 0 && !isLoading && (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-center">참여 중인 채팅방이 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}