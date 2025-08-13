import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useChatMessages } from '@/hooks/queries/useChatQueries';
import { socketManager } from '@/utils/socketUtils';
import { useAuthStore } from '@/store/authStore';
import { formatTime } from '@/utils/dateUtils';
import type { ChatMessageDTO, NewMessageDTO } from '@/types/DTO/chat';
import type { RootStackParamList } from '@/types/RootStackParamList';

type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

export default function ChatRoomScreen() {
  const route = useRoute<ChatRoomScreenRouteProp>();
  const navigation = useNavigation();
  const { chatRoom } = route.params;
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { data, isLoading, error, refetch } = useChatMessages(chatRoom.chat_room_id);

  // 소켓 연결 및 메시지 처리
  useEffect(() => {
    console.log('ChatRoomScreen - 채팅방 입장:', chatRoom.chat_room_id);
    
    // 소켓 연결 시도
    const connectSocket = async () => {
      setIsConnecting(true);
      try {
        // 소켓 연결
        socketManager.connect();
        
        // 연결 상태 확인을 위한 타이머
        const checkConnection = setInterval(() => {
          if (socketManager.isConnected()) {
            setIsConnected(true);
            setIsConnecting(false);
            clearInterval(checkConnection);
            
            // 채팅방 입장
            socketManager.joinRoom(chatRoom.chat_room_id);
            console.log('채팅방 입장 완료:', chatRoom.chat_room_id);
          }
        }, 100);

        // 5초 후 연결 실패 시 타이머 정리
        setTimeout(() => {
          clearInterval(checkConnection);
          if (!socketManager.isConnected()) {
            setIsConnecting(false);
            console.error('소켓 연결 시간 초과');
          }
        }, 5000);
      } catch (error) {
        console.error('소켓 연결 실패:', error);
        setIsConnecting(false);
      }
    };

    connectSocket();

    // 새 메시지 수신 콜백 등록
    const handleNewMessage = (newMessage: NewMessageDTO) => {
      console.log('새 메시지 수신:', newMessage);
      setMessages(prev => [...prev, {
        id: newMessage.id,
        sender_id: newMessage.sender_id,
        message: newMessage.message,
        created_at: newMessage.created_at,
        read_count: newMessage.read_count || 0
      }]);
    };

    socketManager.onNewMessage(handleNewMessage);

    // 에러 콜백 등록
    const handleSocketError = (error: any) => {
      console.error('소켓 에러:', error);
      Alert.alert('연결 오류', '채팅 연결에 문제가 발생했습니다.');
    };

    socketManager.onError(handleSocketError);

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('ChatRoomScreen - 채팅방 나가기:', chatRoom.chat_room_id);
      socketManager.removeCallback(handleNewMessage);
      socketManager.leaveRoom(chatRoom.chat_room_id);
    };
  }, [chatRoom.chat_room_id]);

  // API에서 받은 메시지 데이터 처리
  useEffect(() => {
    if (data?.data) {
      console.log('API에서 메시지 데이터 수신:', data.data.length, '개');
      setMessages(data.data);
    }
  }, [data]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!socketManager.isConnected()) {
      Alert.alert('연결 오류', '채팅 서버에 연결되지 않았습니다.');
      return;
    }

    const messageData = {
      room: chatRoom.chat_room_id,
      message: message.trim()
    };

    socketManager.sendMessage(messageData);
    setMessage('');
  };

  const renderMessage = ({ item }: { item: ChatMessageDTO }) => {
    const isMyMessage = item.sender_id === user?.id;
    const messageTime = formatTime(item.created_at);

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.roomName}>{chatRoom.name}</Text>
      <View style={styles.connectionStatus}>
        {isConnecting ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>연결 중...</Text>
          </View>
        ) : isConnected ? (
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, styles.connected]} />
            <Text style={styles.statusText}>연결됨</Text>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, styles.disconnected]} />
            <Text style={styles.statusText}>연결 안됨</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>메시지를 불러오는데 실패했습니다.</Text>
        <Text style={styles.errorDetailText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>아직 메시지가 없습니다.</Text>
            </View>
          )
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="메시지를 입력하세요..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim() || !isConnected}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    marginTop: 10,
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