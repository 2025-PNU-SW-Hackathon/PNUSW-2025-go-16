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
  
  // 전역 소켓 리스너 - 모든 채팅방의 메시지 감지
  useEffect(() => {
    console.log('🌐 [ChatScreen] useEffect 시작 - 전역 소켓 리스너');
    
    if (!user) {
      console.log('🚫 [ChatScreen] 사용자 정보 없음 - 전역 리스너 건너뜀');
      return;
    }
    
    // 새 메시지 수신 시 채팅방 리스트 무효화
    const handleGlobalNewMessage = (messageData: any) => {
      console.log('🌐 [ChatScreen] 전역 새 메시지 감지:', {
        message: messageData.message?.substring(0, 20) + '...',
        sender_id: messageData.sender_id,
        room_id: messageData.room_id || messageData.room,
        current_user: user?.id
      });
      
      // 채팅방 리스트를 무효화하여 최신 메시지 반영
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      console.log('🔄 [ChatScreen] 채팅방 리스트 무효화 완료');
    };
    
    // 소켓이 연결되어 있지 않다면 연결 시도
    if (!socketManager.isConnected()) {
      console.log('🔌 [ChatScreen] 소켓 연결 시도');
      socketManager.connect();
    }
    
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
    // 🚨 디버깅: 서버에서 받은 원본 데이터 로깅
    console.log('🔍 [ChatScreen] 서버에서 받은 원본 채팅방 데이터:', {
      chatRoom: apiData.name,
      fullApiData: apiData,
      availableFields: Object.keys(apiData),
      sender_id: apiData.sender_id,
      host_id: (apiData as any).host_id,
      is_host: (apiData as any).is_host,
      current_user_is_host: (apiData as any).current_user_is_host,
      user_role: (apiData as any).user_role,
      currentUserId: user?.id
    });

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

    // 🆕 개선된 방장 판별 로직 - 서버 제공 필드 우선 사용
    const apiDataAny = apiData as any;
    
    // 1️⃣ 서버에서 제공하는 방장 정보 확인
    const serverHostId = apiDataAny.host_id || apiData.sender_id;
    const serverIsHost = apiDataAny.is_host || apiDataAny.current_user_is_host;
    
    // 2️⃣ 클라이언트 측 검증
    const clientIsHost = user?.id === serverHostId;
    
    // 3️⃣ 최종 방장 판별 (서버 정보 우선)
    const finalIsHost = serverIsHost !== undefined ? serverIsHost : clientIsHost;
    
    console.log('🔍 [ChatScreen] 방장 판별 과정:', {
      chatRoom: apiData.name,
      '1️⃣ 서버 host_id': serverHostId,
      '2️⃣ 서버 is_host': serverIsHost,
      '3️⃣ 클라이언트 검증': clientIsHost,
      '🎯 최종 결과': finalIsHost,
      '현재 사용자 ID': user?.id,
      '상태': finalIsHost ? '✅ 방장' : '👤 일반 참여자'
    });
    
    console.log('🔍 [ChatScreen] 방장 판별 상세 분석:', {
      chatRoomId: apiData.chat_room_id,
      chatRoomName: apiData.name,
      '⚠️ SENDER_ID (마지막 메시지 발신자?)': apiData.sender_id,
      '📊 현재 사용자 ID': user?.id,
      '🤔 sender_id === user_id?': user?.id === apiData.sender_id,
      '📝 마지막 메시지': apiData.last_message,
      '🕐 마지막 메시지 시간': apiData.last_message_time,
      '❓ 문제': 'sender_id가 모임 생성자가 아니라 마지막 메시지 보낸 사람일 수 있음'
    });

    return {
      id: apiData.chat_room_id.toString(),
      chat_room_id: apiData.chat_room_id,
      name: apiData.name,
      type,
      title: apiData.name,
      subtitle: type === 'store' ? '강남역 2번 출구' : `참여자 ${Math.floor(Math.random() * 10) + 2}명`,
      lastMessage: apiData.last_message || '메시지가 없습니다.',
      timestamp: formatTimeAgo(apiData.last_message_time),
      unreadCount: Math.floor(Math.random() * 5), // 임시로 랜덤 값
      isHost: finalIsHost, // 🆕 개선된 방장 여부 사용
      host_id: serverHostId, // 🆕 서버에서 제공하는 방장 ID 사용
      icon,
      location: type === 'store' ? '강남역 2번 출구' : undefined
    };
  };

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    console.log('🚪 [ChatScreen] 채팅방 클릭:', {
      chatRoomId: chatRoom.id,
      chatRoomTitle: chatRoom.title,
      isHost: chatRoom.isHost,
      host_id: chatRoom.host_id
    });

    // API 데이터에서 해당 채팅방 찾기
    const apiData = data as any;
    const apiChatRoom = apiData?.data?.find((room: ChatRoomDTO) => room.chat_room_id.toString() === chatRoom.id);
    
    if (apiChatRoom) {
      // 🆕 이미 convertToChatRoom에서 계산된 방장 정보 사용
      const convertedChatRoom = {
        chat_room_id: apiChatRoom.chat_room_id,
        name: apiChatRoom.name,
        last_message: apiChatRoom.last_message,
        last_message_time: apiChatRoom.last_message_time,
        sender_id: apiChatRoom.sender_id,
        isHost: chatRoom.isHost, // 🆕 이미 계산된 방장 여부 사용
        host_id: chatRoom.host_id, // 🆕 이미 계산된 방장 ID 사용
        title: chatRoom.title,
        type: chatRoom.type
      };
      
      console.log('🎯 [ChatScreen] 채팅방 이동 데이터:', {
        convertedChatRoom,
        '방장 여부': convertedChatRoom.isHost,
        '방장 ID': convertedChatRoom.host_id,
        '현재 사용자': user?.id
      });
      
      (navigation as any).navigate('ChatRoom', { chatRoom: convertedChatRoom });
    } else {
      console.error('❌ [ChatScreen] 채팅방 데이터를 찾을 수 없음:', chatRoom.id);
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