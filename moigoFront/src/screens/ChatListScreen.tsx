import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { useChatRooms } from '@/hooks/queries/useChatQueries';
import { formatTimeAgo } from '@/utils/dateUtils';
import type { ChatRoomDTO } from '@/types/DTO/chat';
import type { ChatRoom } from '@/types/ChatTypes';

type ChatListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Chat'
>;

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const { data, isLoading, error, refetch } = useChatRooms();
  // const leaveChatRoomMutation = useLeaveChatRoom(); // 임시 비활성화



  const handleChatRoomPress = (chatRoom: ChatRoomDTO) => {
    // 🏷️ 채팅방 제목 결정 (새로운 API 명세에 맞게)
    const roomTitle = chatRoom.reservation_title || chatRoom.reservation_match || chatRoom.match_name || chatRoom.name;
    const cleanTitle = cleanRoomName(roomTitle);
    
    // 📊 부제목 생성 (정산 상태 반영)
    let subtitle = '';
    if (chatRoom.payment_status === 'in_progress' && chatRoom.payment_progress) {
      subtitle = `💰 정산 중 (${chatRoom.payment_progress})`;
    } else if (chatRoom.payment_status === 'completed') {
      subtitle = '✅ 정산 완료';
    } else {
      subtitle = chatRoom.participant_info || `${chatRoom.reservation_participant_cnt}/${chatRoom.reservation_max_participant_cnt}명`;
    }
    
    const chatRoomForNavigation: ChatRoom = {
      id: chatRoom.chat_room_id.toString(),
      chat_room_id: chatRoom.chat_room_id,
      name: cleanTitle,
      type: 'matching',
      title: cleanTitle,
      subtitle: subtitle,
      lastMessage: chatRoom.last_message || '',
      timestamp: chatRoom.last_message_time || new Date().toISOString(),
      unreadCount: chatRoom.unread_count || 0,
      isHost: chatRoom.is_host,
      host_id: chatRoom.host_id,
      icon: {
        text: cleanTitle.charAt(0),
        backgroundColor: '#FF6B35',
        textColor: '#FFFFFF'
      },
      // 🆕 새로운 API 필드들 추가 (ChatRoomScreen에서 사용)
      reservation_status: chatRoom.reservation_status,
      status_message: chatRoom.status_message,
      is_recruitment_closed: chatRoom.is_recruitment_closed,
      participant_info: chatRoom.participant_info,
      reservation_participant_cnt: chatRoom.reservation_participant_cnt,
      reservation_max_participant_cnt: chatRoom.reservation_max_participant_cnt,
      match_title: chatRoom.reservation_match || chatRoom.match_name,
      reservation_start_time: chatRoom.reservation_start_time,
      last_message_sender_id: chatRoom.last_message_sender_id,
      selected_store: chatRoom.selected_store,
      payment_status: chatRoom.payment_status,
      payment_progress: chatRoom.payment_progress
    } as ChatRoom;
    
    navigation.navigate('ChatRoom', { chatRoom: chatRoomForNavigation });
  };

  const handleLeaveChatRoom = (roomId: number, roomName: string) => {
    Alert.alert(
      '채팅방 나가기',
      `"${roomName}" 채팅방을 나가시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => {
            // TODO: 채팅방 나가기 기능 구현 필요
            Alert.alert('알림', '채팅방 나가기 기능은 준비 중입니다.');
          },
        },
      ]
    );
  };

  const cleanRoomName = (name: string) => {
    // 괄호나 특수 문자로 된 부가 정보 제거
    return name
      .replace(/\([^)]*\)/g, '') // (내용) 제거
      .replace(/\[[^\]]*\]/g, '') // [내용] 제거
      .replace(/\s*-\s*.*$/g, '') // " - 내용" 제거
      .replace(/\s*\|\s*.*$/g, '') // " | 내용" 제거
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .trim(); // 앞뒤 공백 제거
  };

  const getIconText = (chatRoom: ChatRoomDTO) => {
    // 🏷️ 새로운 API 명세에 맞게 채팅방 제목에서 첫 글자 추출
    const title = cleanRoomName(chatRoom.reservation_title || chatRoom.reservation_match || chatRoom.match_name || chatRoom.name || '채팅');
    return title.charAt(0);
  };

  const renderChatRoom = ({ item }: { item: ChatRoomDTO }) => {
    const timeAgo = formatTimeAgo(item.last_message_time);
    // 실제 읽지 않은 메시지 수가 있다면 사용, 없으면 임시로 2 설정
    const unreadCount = item.unread_count || (Math.random() > 0.5 ? 2 : 0);
    const iconText = getIconText(item);

    // 🏷️ 새로운 API 명세에 맞게 채팅방 이름 결정
    const roomTitle = item.reservation_title || item.reservation_match || item.match_name || item.name || '채팅방';
    const displayName = cleanRoomName(roomTitle);

    return (
      <TouchableOpacity
        className="bg-white px-4 py-3 flex-row items-center rounded-2xl border border-gray-200 shadow-sm mx-1 my-1"
        onPress={() => handleChatRoomPress(item)}
        onLongPress={() => handleLeaveChatRoom(item.chat_room_id, item.name)}
        activeOpacity={0.7}
      >
        {/* 왼쪽 아이콘 */}
        <View className="w-12 h-12 rounded-full bg-orange-500 justify-center items-center mr-3">
          <Text className="text-white text-lg font-semibold">{iconText}</Text>
        </View>
        
        {/* 중간 내용 */}
        <View className="flex-1 mr-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-black flex-1" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-xs text-gray-400">{timeAgo}</Text>
          </View>
          
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
            {item.last_message || '메시지가 없습니다.'}
          </Text>
        </View>
        
        {/* 오른쪽 읽지 않은 메시지 카운트 */}
        {unreadCount > 0 && (
          <View className="bg-red-500 rounded-full min-w-[20px] h-5 justify-center items-center px-1.5">
            <Text className="text-white text-xs font-semibold">{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (error) {
    console.error('ChatListScreen - 에러 발생:', error);
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-gray-600 text-center mb-2.5">채팅방 목록을 불러오는데 실패했습니다.</Text>
        <Text className="text-sm text-gray-400 text-center mb-5">{(error as any)?.message || '알 수 없는 오류'}</Text>
        <TouchableOpacity className="bg-blue-500 px-5 py-2.5 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white text-base font-semibold">다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터가 없고 로딩 중일 때
  if (isLoading && !(data as any)?.data?.length) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-gray-600 text-center">채팅방을 불러오는 중...</Text>
      </View>
    );
  }

  // 데이터가 없고 로딩이 끝났을 때
  if (!isLoading && (!(data as any)?.data || (data as any).data.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-gray-600 text-center mb-5">참여 중인 채팅방이 없습니다.</Text>
        <TouchableOpacity className="bg-blue-500 px-5 py-2.5 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white text-base font-semibold">새로고침</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 채팅방 데이터를 최근 메시지 시간 순으로 정렬
  const sortedChatRooms = React.useMemo(() => {
    const chatRooms = (data as any)?.data || [];
    return [...chatRooms].sort((a, b) => {
      const timeA = a.last_message_time || a.updated_at || '1970-01-01T00:00:00.000Z';
      const timeB = b.last_message_time || b.updated_at || '1970-01-01T00:00:00.000Z';
      
      // 최신 시간이 위로 오도록 내림차순 정렬
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }, [data]);

  return (
    <View className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="px-4 pt-3 pb-2 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-black">매칭 채팅</Text>
      </View>
      
      <FlatList
        data={sortedChatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.chat_room_id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        className="bg-white"
        contentContainerClassName="py-2 bg-white"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
