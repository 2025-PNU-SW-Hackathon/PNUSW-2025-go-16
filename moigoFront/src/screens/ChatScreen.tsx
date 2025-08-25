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
import { socketManager } from '@/utils/socketUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function ChatScreen() {
  const navigation = useNavigation();
  const { data, isLoading, error, refetch } = useChatRooms();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // 소켓 연결 및 이벤트 리스너 설정
  useEffect(() => {
    console.log('🔌 [ChatScreen] 소켓 연결 시도');
    
    // 🆕 소켓이 연결되지 않은 경우에만 연결
    if (!socketManager.isConnected()) {
      socketManager.connect();
    } else {
      console.log('✅ [ChatScreen] 소켓이 이미 연결되어 있음');
    }
    
    if (!user) {
      console.log('🚫 [ChatScreen] 사용자 정보 없음 - 전역 리스너 건너뜀');
      return;
    }
    
    // 새 메시지 수신 시 채팅방 리스트 무효화
    const handleGlobalNewMessage = (messageData: any) => {
      // console.log('🌐 [ChatScreen] 전역 새 메시지 감지:', {
      //   message: messageData.message?.substring(0, 20) + '...',
      //   sender_id: messageData.sender_id,
      //   room_id: messageData.room_id || messageData.room,
      //   current_user: user?.id
      // });
      
      // 채팅방 리스트를 무효화하여 최신 메시지 반영
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      // console.log('🔄 [ChatScreen] 채팅방 리스트 무효화 완료');
    };
    
    // 리스너 등록 (소켓 연결 상태와 무관하게)
    socketManager.onNewMessage(handleGlobalNewMessage);
    console.log('👂 [ChatScreen] 전역 메시지 리스너 등록 완료');
    
    return () => {
      console.log('🗑️ [ChatScreen] 전역 메시지 리스너 제거 시작');
      socketManager.removeCallback(handleGlobalNewMessage);
      console.log('✅ [ChatScreen] 전역 메시지 리스너 제거 완료');
    };
  }, [user, queryClient]);

  // API 데이터를 기존 ChatRoom 형식으로 변환
  const convertToChatRoom = (apiData: ChatRoomDTO): ChatRoom => {
    // 🏷️ 채팅방 제목 결정 (우선순위: reservation_title > reservation_match > match_name > name)
    const roomTitle = apiData.reservation_title || apiData.reservation_match || apiData.match_name || apiData.name;
    
    // 📊 부제목 생성 (정산 상태 우선 표시)
    let subtitle = '';
    if (apiData.payment_status === 'in_progress' && apiData.payment_progress) {
      subtitle = `💰 정산 중 (${apiData.payment_progress})`;
    } else if (apiData.payment_status === 'completed') {
      subtitle = '✅ 정산 완료';
    } else {
      subtitle = apiData.participant_info || `${apiData.reservation_participant_cnt}/${apiData.reservation_max_participant_cnt}명`;
    }
    
    // 🎨 아이콘 생성 (채팅방 제목 첫 글자)
    const firstChar = roomTitle.charAt(0);
    const colors = ['#FF6B35', '#C8102E', '#1E3A8A', '#059669', '#DC2626'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const icon = {
      text: firstChar,
      backgroundColor: randomColor,
      textColor: '#FFFFFF'
    };

    return {
      id: apiData.chat_room_id.toString(),
      chat_room_id: apiData.chat_room_id,
      name: roomTitle,
      type: 'matching',
      title: roomTitle,
      subtitle: subtitle,
      lastMessage: apiData.last_message || '',
      timestamp: formatTimeAgo(apiData.last_message_time),
      unreadCount: apiData.unread_count || 0,
      isHost: apiData.is_host,
      host_id: apiData.host_id,
      icon,
      // 🆕 새로운 API 필드들 직접 추가 (ChatRoomScreen에서 사용)
      reservation_status: apiData.reservation_status,
      status_message: apiData.status_message,
      is_recruitment_closed: apiData.is_recruitment_closed,
      participant_info: apiData.participant_info,
      reservation_participant_cnt: apiData.reservation_participant_cnt,
      reservation_max_participant_cnt: apiData.reservation_max_participant_cnt,
      match_title: apiData.reservation_match || apiData.match_name,
      reservation_start_time: apiData.reservation_start_time,
      last_message_sender_id: apiData.last_message_sender_id,
      selected_store: apiData.selected_store,
      payment_status: apiData.payment_status,
      payment_progress: apiData.payment_progress
    } as ChatRoom;
  };

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    // console.log('🚪 [ChatScreen] 채팅방 클릭:', {
    //   chatRoomId: chatRoom.id,
    //   chatRoomTitle: chatRoom.title,
    //   isHost: chatRoom.isHost,
    //   host_id: chatRoom.host_id
    // });

    // API 데이터에서 해당 채팅방 찾기
    const apiData = data as any;
    const apiChatRoom = apiData?.data?.find((room: ChatRoomDTO) => room.chat_room_id.toString() === chatRoom.id);
    
    if (apiChatRoom) {
      // 🆕 이미 convertToChatRoom에서 계산된 방장 정보 + 서버 새 필드들 포함
      const convertedChatRoom = {
        chat_room_id: apiChatRoom.chat_room_id,
        name: apiChatRoom.name,
        last_message: apiChatRoom.last_message,
        last_message_time: apiChatRoom.last_message_time,
        sender_id: apiChatRoom.sender_id,
        isHost: chatRoom.isHost, // 🆕 이미 계산된 방장 여부 사용
        host_id: chatRoom.host_id, // 🆕 이미 계산된 방장 ID 사용
        title: chatRoom.title,
        type: chatRoom.type,
        // 🆕 서버에서 추가된 모든 새 필드들
        reservation_status: apiChatRoom.reservation_status,
        status_message: apiChatRoom.status_message,
        is_recruitment_closed: apiChatRoom.is_recruitment_closed,
        participant_info: apiChatRoom.participant_info,
        reservation_participant_cnt: apiChatRoom.reservation_participant_cnt,
        reservation_max_participant_cnt: apiChatRoom.reservation_max_participant_cnt,
        match_title: apiChatRoom.match_title,
        reservation_start_time: apiChatRoom.reservation_start_time,
        last_message_sender_id: apiChatRoom.last_message_sender_id
      };
      
      // console.log('🎯 [ChatScreen] 채팅방 이동 데이터:', {
      //   convertedChatRoom,
      //   '방장 여부': convertedChatRoom.isHost,
      //   '방장 ID': convertedChatRoom.host_id,
      //   '모집 상태': convertedChatRoom.reservation_status,
      //   '현재 사용자': user?.id
      // });
      
      (navigation as any).navigate('ChatRoom', { chatRoom: convertedChatRoom });
    } else {
      console.error('❌ [ChatScreen] 채팅방 데이터를 찾을 수 없음:', chatRoom.id);
    }
  };

  // 로딩 상태
  if (isLoading && !(data as any)?.data) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">채팅방을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-gray-50">
        <Text className="mb-4 text-center text-gray-600">채팅방 목록을 불러오는데 실패했습니다.</Text>
        <TouchableOpacity 
          className="px-6 py-3 bg-blue-500 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="font-semibold text-white">다시 시도</Text>
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
            <Text className="mb-3 text-lg font-semibold text-gray-900">매칭 채팅</Text>
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
            <Text className="mb-3 text-lg font-semibold text-gray-900">가게 채팅</Text>
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
            <Text className="text-center text-gray-500">참여 중인 채팅방이 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}