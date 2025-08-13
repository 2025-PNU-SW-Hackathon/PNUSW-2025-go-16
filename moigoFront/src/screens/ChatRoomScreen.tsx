import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
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
import ChatBubble from '@/components/chat/ChatBubble';
import ChatStatusMessage from '@/components/chat/ChatStatusMessage';
import ReservationDepositInfo from '@/components/chat/ReservationDepositInfo';
import StoreShareMessage from '@/components/chat/StoreShareMessage';
import Feather from 'react-native-vector-icons/Feather';
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
  const [isHost, setIsHost] = useState(false); // 방장 여부
  const [showDepositInfo, setShowDepositInfo] = useState(false); // 예약금 정보 표시 여부
  const flatListRef = useRef<FlatList>(null);

  const { data, isLoading, error, refetch } = useChatMessages(chatRoom.chat_room_id);

  // 소켓 연결 및 메시지 처리
  useEffect(() => {
    console.log('ChatRoomScreen - 채팅방 입장:', chatRoom.chat_room_id);
    
    // 방장 여부 확인 (임시로 랜덤 설정)
    setIsHost(Math.random() > 0.5);
    
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

  // 예약금 입금 처리
  const handleDeposit = (participantId: string) => {
    Alert.alert('입금 처리', `${participantId}님의 입금을 확인하시겠습니까?`);
  };

  // 메시지를 그룹화하는 함수
  const groupMessages = (messages: ChatMessageDTO[]) => {
    const groups: Array<{
      senderId: string;
      senderName: string;
      messages: Array<{
        id: string;
        type: 'text' | 'store';
        content: string;
        storeInfo?: any;
      }>;
    }> = [];

    messages.forEach((msg) => {
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.senderId === msg.sender_id) {
        // 같은 발신자의 연속된 메시지
        lastGroup.messages.push({
          id: msg.id.toString(),
          type: 'text',
          content: msg.message
        });
      } else {
        // 새로운 발신자 또는 첫 메시지
        groups.push({
          senderId: msg.sender_id,
          senderName: msg.sender_id === user?.id ? '나' : msg.sender_id,
          messages: [{
            id: msg.id.toString(),
            type: 'text',
            content: msg.message
          }]
        });
      }
    });

    return groups;
  };

  const renderMessageGroup = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === user?.id;
    const senderAvatar = item.senderName.charAt(0);

    return (
      <ChatBubble
        messages={item.messages}
        isMyMessage={isMyMessage}
        senderName={!isMyMessage ? item.senderName : undefined}
        senderAvatar={!isMyMessage ? senderAvatar : undefined}
      />
    );
  };

  const renderStatusMessage = ({ item }: { item: any }) => {
    return <ChatStatusMessage message={item.message} />;
  };

  const renderDepositInfo = () => {
    const participants = [
      { id: 'user1', name: '김철수', avatar: '김', isHost: true, hasDeposited: true },
      { id: 'user2', name: '이영희', avatar: '이', isHost: false, hasDeposited: false },
      { id: 'user3', name: '박민수', avatar: '박', isHost: false, hasDeposited: true },
    ];

    return (
      <ReservationDepositInfo
        participants={participants}
        depositAmount={50000}
        timeLimit={30}
        onDeposit={handleDeposit}
      />
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'status') {
      return renderStatusMessage({ item });
    } else if (item.type === 'deposit') {
      return renderDepositInfo();
    } else {
      return renderMessageGroup({ item });
    }
  };

  // 헤더 렌더링 (방장/참가자 구분)
  const renderHeader = () => (
    <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-lg font-semibold text-gray-900 mr-2">{chatRoom.name}</Text>
          {isHost && (
            <View className="bg-mainOrange px-2 py-1 rounded-full">
              <Text className="text-xs font-bold text-white">방장</Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-500">
          {isConnecting ? '연결 중...' : isConnected ? '연결됨' : '연결 안됨'}
        </Text>
      </View>
      
      <View className="flex-row items-center">
        {isConnecting && (
          <ActivityIndicator size="small" color="#FF6B35" className="mr-2" />
        )}
        
        {/* 방장일 때만 표시되는 버튼들 */}
        {isHost && (
          <>
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-2"
              onPress={() => setShowDepositInfo(!showDepositInfo)}
            >
              <Feather name="credit-card" size={16} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-2"
              onPress={() => Alert.alert('모임 관리', '모임 관리 기능')}
            >
              <Feather name="settings" size={16} color="#666" />
            </TouchableOpacity>
          </>
        )}
        
        {/* 참가자일 때 표시되는 버튼 */}
        {!isHost && (
          <TouchableOpacity 
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => Alert.alert('채팅방 나가기', '채팅방을 나가시겠습니까?')}
          >
            <Feather name="log-out" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-600 text-center mb-4">메시지를 불러오는데 실패했습니다.</Text>
        <TouchableOpacity 
          className="bg-mainOrange px-6 py-3 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 메시지 그룹화
  const messageGroups = groupMessages(messages);
  const displayItems = [
    ...messageGroups.map(group => ({ ...group, type: 'message' })),
    // 예약금 정보 (방장일 때만 표시)
    ...(showDepositInfo && isHost ? [{ type: 'deposit' }] : []),
  ];

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={displayItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          if (item.type === 'status') return `status-${index}`;
          if (item.type === 'deposit') return `deposit-${index}`;
          return `message-${item.senderId}-${index}`;
        }}
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text className="text-gray-600 mt-4">메시지를 불러오는 중...</Text>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 text-center">아직 메시지가 없습니다.</Text>
            </View>
          )
        }
      />

      <View className="flex-row p-4 bg-white border-t border-gray-200">
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-3 text-base"
          value={message}
          onChangeText={setMessage}
          placeholder="메시지를 입력하세요..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          className={`px-6 py-2 rounded-full justify-center ${
            !message.trim() || !isConnected ? 'bg-gray-300' : 'bg-mainOrange'
          }`}
          onPress={handleSendMessage}
          disabled={!message.trim() || !isConnected}
        >
          <Text className={`font-semibold ${!message.trim() || !isConnected ? 'text-gray-500' : 'text-white'}`}>
            전송
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
} 