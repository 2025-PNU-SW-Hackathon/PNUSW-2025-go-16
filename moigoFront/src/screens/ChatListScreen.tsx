import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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

  // 디버깅을 위한 로그 추가
  console.log('ChatListScreen - 데이터 상태:', {
    isLoading,
    hasData: !!data,
    dataLength: data?.data?.length,
    error: error?.message
  });

  const handleChatRoomPress = (chatRoom: ChatRoomDTO) => {
    // ChatRoomDTO를 ChatRoom 타입으로 변환
    const chatRoomForNavigation: ChatRoom = {
      id: chatRoom.chat_room_id.toString(),
      chat_room_id: chatRoom.chat_room_id,
      name: chatRoom.name,
      type: 'matching',
      title: chatRoom.name || '채팅방',
      subtitle: chatRoom.participant_info || `${chatRoom.reservation_participant_cnt || 0}/${chatRoom.reservation_max_participant_cnt || 0}명`,
      lastMessage: chatRoom.last_message || '',
      timestamp: chatRoom.last_message_time || new Date().toISOString(),
      unreadCount: 0,
      isHost: chatRoom.is_host || false,
      host_id: chatRoom.host_id,
      icon: {
        text: '👥',
        backgroundColor: '#FF6B35',
        textColor: '#FFFFFF'
      }
    };
    
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

  const renderChatRoom = ({ item }: { item: ChatRoomDTO }) => {
    const timeAgo = formatTimeAgo(item.last_message_time);

    return (
      <TouchableOpacity
        style={styles.chatRoomItem}
        onPress={() => handleChatRoomPress(item)}
        onLongPress={() => handleLeaveChatRoom(item.chat_room_id, item.name)}
      >
        <View style={styles.chatRoomContent}>
          <View style={styles.chatRoomHeader}>
            <Text style={styles.roomName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          
          <View style={styles.chatRoomFooter}>
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.last_message || '메시지가 없습니다.'}
            </Text>
            <Text style={styles.senderId}>
              {item.sender_id ? `${item.sender_id}님` : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (error) {
    console.error('ChatListScreen - 에러 발생:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>채팅방 목록을 불러오는데 실패했습니다.</Text>
        <Text style={styles.errorDetailText}>{(error as any)?.message || '알 수 없는 오류'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터가 없고 로딩 중일 때
  if (isLoading && !(data as any)?.data?.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>채팅방을 불러오는 중...</Text>
      </View>
    );
  }

  // 데이터가 없고 로딩이 끝났을 때
  if (!isLoading && (!(data as any)?.data || (data as any).data.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>참여 중인 채팅방이 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>새로고침</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={(data as any)?.data || []}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.chat_room_id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flexGrow: 1,
  },
  chatRoomItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chatRoomContent: {
    flex: 1,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  chatRoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  senderId: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorDetailText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
