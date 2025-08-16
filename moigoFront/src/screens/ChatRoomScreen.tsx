import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/RootStackParamList';
import { ChatRoom, ChatMessage, MessageGroup } from '@/types/ChatTypes';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatStatusMessage from '@/components/chat/ChatStatusMessage';
import ReservationDepositInfo from '@/components/chat/ReservationDepositInfo';
import PaymentModal from '@/components/common/PaymentModal';
import DropdownMenu, { DropdownOption } from '@/components/common/DropdownMenu';
import Feather from 'react-native-vector-icons/Feather';
import { groupMessages } from '@/utils/chatUtils';
import { useChatMessages } from '@/hooks/queries/useChatQueries';
import { socketManager } from '@/utils/socketUtils';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessageDTO, NewMessageDTO } from '@/types/DTO/chat';
import { signup, checkUserIdDuplicate, checkStoreIdDuplicate, signupWithDuplicateCheck, storeSignupWithDuplicateCheck, leaveChatRoom } from '@/apis/auth';

type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

export default function ChatRoomScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { chatRoom } = route.params;
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // API에서 메시지 데이터 가져오기
  const { data: apiData, isLoading, error, refetch } = useChatMessages(chatRoom.chat_room_id || 1);
  
  // 예약금 관련 상태 (실시간 업데이트 가능)
  const [depositInfo, setDepositInfo] = useState({
    participants: [
      { id: '1', name: '박태원', avatar: '방', isHost: true, hasDeposited: true },
      { id: '2', name: '김세한', avatar: '참', isHost: false, hasDeposited: false },
      { id: '3', name: '김재혁', avatar: '참', isHost: false, hasDeposited: false },
      { id: '4', name: '정예준', avatar: '참', isHost: false, hasDeposited: false },
    ],
    depositAmount: 5000,
    timeLimit: 30
  });

  // 현재 사용자 ID (실제로는 세션에서 가져와야 함)
  const currentUserId = user?.id || ''; // user?.id가 있으면 사용, 없으면 빈 문자열 사용
  
  // 사용자 ID가 제대로 로드되었는지 확인
  const isUserLoaded = !!user?.id;
  
  console.log('=== ChatRoomScreen 디버깅 ===');
  console.log('user 객체:', user);
  console.log('user?.id:', user?.id);
  console.log('user?.id 타입:', typeof user?.id);
  console.log('currentUserId (최종):', currentUserId);
  console.log('currentUserId 타입:', typeof currentUserId);
  console.log('isUserLoaded:', isUserLoaded);
  console.log('user?.id가 undefined인가?', user?.id === undefined);
  console.log('user?.id가 null인가?', user?.id === null);
  console.log('user?.id가 빈 문자열인가?', user?.id === '');
  console.log('isLoggedIn 상태:', useAuthStore.getState().isLoggedIn);
  console.log('token 존재 여부:', !!useAuthStore.getState().token);

  // 사용자 로그아웃 시 메시지 초기화
  useEffect(() => {
    console.log('=== 사용자 정보 변경 감지 ===');
    console.log('현재 user 객체:', user);
    console.log('현재 isLoggedIn 상태:', useAuthStore.getState().isLoggedIn);
    
    if (!user || !useAuthStore.getState().isLoggedIn) {
      console.log('사용자가 로그아웃됨 - 메시지 상태 초기화');
      setMessages([]);
      
      // 소켓 연결도 해제
      socketManager.disconnect();
    } else {
      console.log('새로운 사용자로 로그인됨:', user.id);
      // 새로운 사용자로 로그인된 경우 소켓 재연결
      socketManager.connect();
    }
  }, [user, useAuthStore.getState().isLoggedIn]);

  // API 데이터를 ChatMessage 형식으로 변환
  useEffect(() => {
    console.log('=== API 데이터 변환 처리 ===');
    console.log('API 데이터 존재 여부:', !!apiData?.data);
    console.log('현재 사용자 ID:', currentUserId);
    console.log('사용자 정보:', user);
    console.log('로그인 상태:', useAuthStore.getState().isLoggedIn);
    
    if (apiData?.data && currentUserId && user && useAuthStore.getState().isLoggedIn) {
      console.log('API 데이터 변환 시작:', {
        currentUserId,
        currentUserIdType: typeof currentUserId,
        apiDataLength: apiData.data.length,
        firstMessage: apiData.data[0]
      });
      
      const convertedMessages: ChatMessage[] = apiData.data.map((msg: ChatMessageDTO) => {
        console.log('메시지 원본:', {
          sender_id: msg.sender_id,
          sender_idType: typeof msg.sender_id,
          currentUserId,
          currentUserIdType: typeof currentUserId,
          isEqual: msg.sender_id === currentUserId,
          isEqualStrict: msg.sender_id === currentUserId,
          isEqualTrim: msg.sender_id?.trim() === currentUserId?.trim()
        });
        
        // 시스템 메시지인지 확인
        if (msg.sender_id === 'system') {
          return {
            id: msg.id.toString(),
            senderId: 'system',
            senderName: '시스템',
            senderAvatar: '⚙️',
            message: msg.message,
            timestamp: new Date(msg.created_at),
            type: 'system' as const,
            message_type: msg.message_type,
            user_name: msg.user_name,
            user_id: msg.user_id,
            kicked_by: msg.kicked_by
          };
        }
        
        const isMyMessage = msg.sender_id === currentUserId;
        
        return {
          id: msg.id.toString(),
          senderId: msg.sender_id,
          senderName: isMyMessage ? '나' : msg.sender_id,
          senderAvatar: isMyMessage ? '나' : msg.sender_id.charAt(0),
          message: msg.message,
          timestamp: new Date(msg.created_at),
          type: 'text' as const
        };
      });
      setMessages(convertedMessages);
    } else {
      console.log('API 데이터 변환 조건 불충족 - 메시지 초기화');
      setMessages([]);
    }
  }, [apiData, currentUserId, user, useAuthStore.getState().isLoggedIn]); // 의존성 추가

  // 소켓 연결 및 실시간 메시지 처리
  useEffect(() => {
    console.log('=== 소켓 연결 처리 ===');
    console.log('사용자 정보:', user);
    console.log('로그인 상태:', useAuthStore.getState().isLoggedIn);
    console.log('현재 사용자 ID:', currentUserId);
    
    // 사용자가 로그인하지 않은 경우 소켓 연결하지 않음
    if (!user || !useAuthStore.getState().isLoggedIn || !currentUserId) {
      console.log('사용자가 로그인하지 않음 - 소켓 연결하지 않음');
      return;
    }

    console.log('소켓 연결 시작 - 사용자 ID:', currentUserId);
    
    // 소켓 연결
    socketManager.connect();
    
    // 새 메시지 수신 콜백 등록
    const handleNewMessage = (newMessage: NewMessageDTO) => {
      console.log('=== 새 메시지 수신 ===');
      console.log('받은 메시지 원본:', newMessage);
      console.log('현재 사용자 ID:', currentUserId);
      console.log('메시지 sender_id:', newMessage.sender_id);
      console.log('sender_id 타입:', typeof newMessage.sender_id);
      console.log('currentUserId 타입:', typeof currentUserId);
      console.log('ID 비교 결과:', {
        isEqual: newMessage.sender_id === currentUserId,
        isEqualStrict: newMessage.sender_id === currentUserId,
        isEqualTrim: newMessage.sender_id?.trim() === currentUserId?.trim()
      });
      
      // 시스템 메시지인지 확인
      if (newMessage.sender_id === 'system') {
        console.log('시스템 메시지 처리');
        const convertedMessage: ChatMessage = {
          id: newMessage.id.toString(),
          senderId: 'system',
          senderName: '시스템',
          senderAvatar: '⚙️',
          message: newMessage.message,
          timestamp: new Date(newMessage.created_at),
          type: 'system',
          message_type: newMessage.message_type,
          user_name: newMessage.user_name,
          user_id: newMessage.user_id,
          kicked_by: newMessage.kicked_by
        };
        setMessages(prev => [...prev, convertedMessage]);
        return;
      }
      
      const isMyMessage = newMessage.sender_id === currentUserId;
      console.log('내 메시지 여부:', isMyMessage);
      
      const convertedMessage: ChatMessage = {
        id: newMessage.id.toString(),
        senderId: newMessage.sender_id,
        senderName: isMyMessage ? '나' : newMessage.sender_id,
        senderAvatar: isMyMessage ? '나' : newMessage.sender_id.charAt(0),
        message: newMessage.message,
        timestamp: new Date(newMessage.created_at),
        type: 'text'
      };
      
      console.log('변환된 메시지:', convertedMessage);
      setMessages(prev => [...prev, convertedMessage]);
    };

    socketManager.onNewMessage(handleNewMessage);
    socketManager.joinRoom(chatRoom.chat_room_id || 1);

    return () => {
      console.log('소켓 정리 - 콜백 제거 및 방 나가기');
      socketManager.removeCallback(handleNewMessage);
      socketManager.leaveRoom(chatRoom.chat_room_id || 1);
    };
  }, [chatRoom.chat_room_id, currentUserId, user, useAuthStore.getState().isLoggedIn]); // 의존성 추가

  // 방장용 메뉴 옵션
  const hostMenuOptions: DropdownOption[] = [
    { id: '1', label: '매칭 정보 보기', onPress: () => console.log('매칭 정보 보기') },
    { id: '2', label: '매칭 정보 수정하기', onPress: () => console.log('매칭 정보 수정하기') },
    { id: '3', label: '매칭 모집 마감하기', onPress: () => console.log('매칭 모집 마감하기') },
    { id: '4', label: '참여자 목록', onPress: () => console.log('참여자 목록') },
    { id: '5', label: '채팅방 나가기', onPress: () => {
      Alert.alert(
        '채팅방 나가기',
        '채팅방을 나가면 모임에서도 제외됩니다.\n그래도 하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '나가기', style: 'destructive', onPress: handleLeaveChatRoom }
        ]
      );
    }},
    { id: '6', label: '신고하기', isDanger: true, onPress: () => console.log('신고하기') },
  ];

  // 일반 참여자용 메뉴 옵션
  const participantMenuOptions: DropdownOption[] = [
    { id: '1', label: '채팅방 정보', onPress: () => console.log('채팅방 정보') },
    { id: '2', label: '멤버 관리', onPress: () => console.log('멤버 관리') },
    { id: '3', label: '알림 설정', onPress: () => console.log('알림 설정') },
    { id: '4', label: '채팅방 나가기', onPress: () => {
      Alert.alert(
        '채팅방 나가기',
        '채팅방을 나가면 모임에서도 제외됩니다.\n그래도 하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '나가기', style: 'destructive', onPress: handleLeaveChatRoom }
        ]
      );
    }},
  ];

  // 현재 사용자의 메뉴 옵션 결정 (임시로 랜덤)
  const menuOptions = Math.random() > 0.5 ? hostMenuOptions : participantMenuOptions;

  // 메시지 그룹화 로직
  const groupedMessages = useMemo(() => {
    console.log('=== 메시지 그룹화 처리 ===');
    console.log('메시지 개수:', messages.length);
    console.log('현재 사용자 ID:', currentUserId);
    console.log('사용자 정보:', user);
    console.log('로그인 상태:', useAuthStore.getState().isLoggedIn);
    
    if (!currentUserId || !user || !useAuthStore.getState().isLoggedIn) {
      console.log('사용자 정보 불충족 - 빈 그룹 반환');
      return [];
    }
    
    return groupMessages(messages, currentUserId);
  }, [messages, currentUserId, user, useAuthStore.getState().isLoggedIn]); // 의존성 추가

  const handleSendMessage = () => {
    console.log('=== 메시지 전송 시도 ===');
    console.log('현재 사용자 ID:', currentUserId);
    console.log('사용자 로드 상태:', isUserLoaded);
    console.log('메시지 내용:', message.trim());
    console.log('사용자 객체:', user);
    console.log('로그인 상태:', useAuthStore.getState().isLoggedIn);
    
    if (!isUserLoaded) {
      console.error('사용자 정보가 제대로 로드되지 않았습니다.');
      console.error('user 객체:', user);
      console.error('isLoggedIn:', useAuthStore.getState().isLoggedIn);
      return;
    }
    
    if (message.trim() && currentUserId) {
      const messageData = {
        room: chatRoom.chat_room_id || 1,
        message: message.trim(),
        sender_id: currentUserId
      };
      
      console.log('전송할 메시지 데이터:', messageData);
      
      // 소켓을 통해 메시지 전송
      socketManager.sendMessage(messageData);
      setMessage('');
    } else if (!currentUserId) {
      console.error('사용자 ID가 없어서 메시지를 보낼 수 없습니다.');
      console.error('user?.id:', user?.id);
      console.error('currentUserId:', currentUserId);
    } else if (!message.trim()) {
      console.error('메시지가 비어있습니다.');
    }
  };

  // 예약금 입금 처리 함수 (결제 모달 열기)
  const handleDeposit = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setShowPaymentModal(true);
  };

  // 결제 수단 선택 처리
  const handlePaymentMethodSelect = (method: 'kakao' | 'naver' | 'bank') => {
    console.log(`결제 수단 선택: ${method}, 참가자 ID: ${selectedParticipantId}`);
    
    // TODO: 실제 결제 로직 구현
    // 여기서는 테스트용으로 바로 입금 완료 처리
    if (selectedParticipantId) {
      setDepositInfo(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === selectedParticipantId 
            ? { ...p, hasDeposited: true }
            : p
        )
      }));
    }
    
    setShowPaymentModal(false);
    setSelectedParticipantId(null);
  };

  // 채팅방 나가기 처리
  const handleLeaveChatRoom = async () => {
    try {
      console.log('채팅방 나가기 시도 - 채팅방 ID:', chatRoom.chat_room_id);
      
      // 채팅방 ID가 없으면 에러 처리
      if (!chatRoom.chat_room_id) {
        console.error('채팅방 ID가 없어서 채팅방 나가기를 할 수 없습니다.');
        Alert.alert('오류', '채팅방 정보를 찾을 수 없습니다.');
        return;
      }

      // 서버에 채팅방 나가기 요청
      const response = await leaveChatRoom(chatRoom.chat_room_id);
      
      if (response.success) {
        console.log('채팅방 나가기 성공:', response);
        
        // 소켓 연결 해제
        socketManager.disconnect();
        
        // 채팅방 목록으로 이동
        navigation.goBack();
      } else {
        console.error('채팅방 나가기 실패:', response.message);
        Alert.alert('오류', response.message || '채팅방 나가기에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('채팅방 나가기 에러:', error);
      Alert.alert('오류', '채팅방 나가기 중 오류가 발생했습니다.');
    }
  };

  const renderMessageGroup = (group: MessageGroup, index: number) => {
    // 시스템 메시지 그룹
    if (group.type === 'system') {
      return group.messages.map((msg: ChatMessage) => (
        <ChatStatusMessage 
          key={msg.id}
          message={msg.message} 
        />
      ));
    }

    // 사용자 메시지 그룹 - 시간 순서대로 정렬된 메시지 배열 생성
    const sortedMessages = group.messages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(msg => ({
        id: msg.id,
        type: msg.type as 'text' | 'store',
        content: msg.message,
        storeInfo: msg.storeInfo
      }));
    
    return (
      <ChatBubble
        key={group.id}
        messages={sortedMessages}
        isMyMessage={group.isMyMessage}
        senderName={group.senderName}
        senderAvatar={group.senderAvatar}
      />
    );
  };

  // 로딩 상태
  if (isLoading && messages.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">메시지를 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (error && messages.length === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-4">
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

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        {/* 헤더 */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {chatRoom.title || chatRoom.name}
            </Text>
            <Text className="text-sm text-gray-600">
              {chatRoom.subtitle || '채팅방'}
            </Text>
          </View>

          {/* 메뉴 버튼 */}
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="p-2"
          >
            <Text className="text-xl font-bold text-gray-700">⋮</Text>
          </TouchableOpacity>
        </View>

                 {/* 드롭다운 메뉴 */}
         <DropdownMenu
           options={menuOptions}
           isVisible={showMenu}
           onClose={() => setShowMenu(false)}
         />

         {/* 결제 모달 */}
         <PaymentModal
           isVisible={showPaymentModal}
           onClose={() => {
             setShowPaymentModal(false);
             setSelectedParticipantId(null);
           }}
           amount={depositInfo.depositAmount}
           onPaymentMethodSelect={handlePaymentMethodSelect}
         />

             {/* 메시지 영역 */}
       <ScrollView 
         className="flex-1 px-4 py-2"
         showsVerticalScrollIndicator={false}
       >
         {/* 예약금 안내 컴포넌트 */}
         <ReservationDepositInfo
           participants={depositInfo.participants}
           depositAmount={depositInfo.depositAmount}
           timeLimit={depositInfo.timeLimit}
           onDeposit={handleDeposit}
         />
         
         {/* 채팅 메시지들 */}
         {groupedMessages.map((group, index) => renderMessageGroup(group, index))}
       </ScrollView>

      {/* 메시지 입력 영역 */}
      <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
        {/* 왼쪽 상점 아이콘 버튼 */}
        <TouchableOpacity
          onPress={() => console.log('상점 버튼 클릭')}
          className="justify-center items-center mr-3 w-10 h-10 rounded-full bg-mainOrange"
          activeOpacity={0.8}
        >
            <Feather name="home" size={15} color="#F5F5F5" />
        </TouchableOpacity>
        
        {/* 메시지 입력 필드 (전송 버튼 포함) */}
        <View className="flex-row flex-1 items-center px-4 py-2 mr-3 bg-gray-100 rounded-full">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={isUserLoaded ? "메시지를 입력하세요" : "사용자 정보 로딩 중..."}
            className="flex-1 px-2"
            multiline
            placeholderTextColor="#9CA3AF"
            editable={isUserLoaded}
          />
          
          {/* 전송 버튼 (입력 필드 안에) */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!message.trim() || !isUserLoaded}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              message.trim() && isUserLoaded ? 'bg-mainOrange' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
          >
            <Feather name="send" size={15} color="#F5F5F5" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
} 