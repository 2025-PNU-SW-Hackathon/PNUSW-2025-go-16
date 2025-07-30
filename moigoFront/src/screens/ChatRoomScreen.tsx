import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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

type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

// 테스트 데이터
const testMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: 'system',
    senderName: '시스템',
    senderAvatar: '',
    message: '새로운 멤버가 참여했습니다.',
    timestamp: new Date('2024-01-15T10:00:00'),
    type: 'system'
  },
  {
    id: '2',
    senderId: 'user123',
    senderName: '박태원 (방장)',
    senderAvatar: '방',
    message: '안녕하세요! 오늘 함께 경기 볼 멤버분들 반갑습니다',
    timestamp: new Date('2024-01-15T10:01:00'),
    type: 'text'
  },
  {
    id: '3',
    senderId: 'currentUser',
    senderName: '나',
    senderAvatar: '나',
    message: '안녕하세요! 저도 반갑습니다',
    timestamp: new Date('2024-01-15T10:02:00'),
    type: 'text'
  },
  {
    id: '4',
    senderId: 'currentUser',
    senderName: '나',
    senderAvatar: '나',
    message: '오늘 경기 기대되네요!',
    timestamp: new Date('2024-01-15T10:02:30'),
    type: 'text'
  },
  {
    id: '5',
    senderId: 'currentUser',
    senderName: '나',
    senderAvatar: '나',
    message: '몇 시에 만나나요?',
    timestamp: new Date('2024-01-15T10:03:00'),
    type: 'text'
  },
  {
    id: '6',
    senderId: 'user456',
    senderName: '정예준',
    senderAvatar: '정',
    message: '네 안녕하세요~ 오늘 경기 기대되네요!',
    timestamp: new Date('2024-01-15T10:04:00'),
    type: 'text'
  },
  {
    id: '7',
    senderId: 'user789',
    senderName: '김세한',
    senderAvatar: '김',
    message: '정말 긴 메시지를 보내면 어떻게 될까요? 이렇게 긴 텍스트가 들어가면 자동으로 줄바꿈이 되어서 다음 줄로 넘어가게 됩니다. 이제 말풍선이 더 자연스럽게 보일 거예요!',
    timestamp: new Date('2024-01-15T10:05:00'),
    type: 'text'
  },
  {
    id: '8',
    senderId: 'user789',
    senderName: '김세한',
    senderAvatar: '김',
    message: '저도 기대됩니다!',
    timestamp: new Date('2024-01-15T10:05:30'),
    type: 'text'
  },
  {
    id: '9',
    senderId: 'system',
    senderName: '시스템',
    senderAvatar: '',
    message: '매칭 모집이 마감되었습니다.',
    timestamp: new Date('2024-01-15T10:06:00'),
    type: 'system'
  },
  {
    id: '10',
    senderId: 'user123',
    senderName: '박태원 (방장)',
    senderAvatar: '방',
    message: '마감했어요! 가게 찾아봅시다~',
    timestamp: new Date('2024-01-15T10:07:00'),
    type: 'text'
  },
  {
    id: '11',
    senderId: 'user123',
    senderName: '박태원 (방장)',
    senderAvatar: '방',
    message: '',
    timestamp: new Date('2024-01-15T10:07:02'),
    type: 'store',
    storeInfo: {
      storeName: "챔피언 스포츠 펍",
      rating: 4.8,
      reviewCount: 128,
      imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  },
  {
    id: '12',
    senderId: 'user123',
    senderName: '박태원 (방장)',
    senderAvatar: '방',
    message: '이곳은 분위기가 좋고 TV도 크게 있어서 경기 보기 좋아요',
    timestamp: new Date('2024-01-15T10:08:00'),
    type: 'text'
  },
  {
    id: '13',
    senderId: 'currentUser',
    senderName: '나',
    senderAvatar: '나',
    message: '',
    timestamp: new Date('2024-01-15T10:08:02'),
    type: 'store',
    storeInfo: {
      storeName: "챔피언 스포츠 펍",
      rating: 5.0,
      reviewCount: 1208,
      imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  },
  {
    id: '14',
    senderId: 'currentUser',
    senderName: '나',
    senderAvatar: '나',
    message: '여기가 더 좋은듯요',
    timestamp: new Date('2024-01-15T10:08:05'),
    type: 'text'
  }
];

export default function ChatRoomScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { chatRoom } = route.params;
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  
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
  const currentUserId = 'currentUser';

  // 방장용 메뉴 옵션
  const hostMenuOptions: DropdownOption[] = [
    { id: '1', label: '매칭 정보 보기', onPress: () => console.log('매칭 정보 보기') },
    { id: '2', label: '매칭 정보 수정하기', onPress: () => console.log('매칭 정보 수정하기') },
    { id: '3', label: '매칭 모집 마감하기', onPress: () => console.log('매칭 모집 마감하기') },
    { id: '4', label: '참여자 목록', onPress: () => console.log('참여자 목록') },
    { id: '5', label: '채팅방 나가기', onPress: () => navigation.goBack() },
    { id: '6', label: '신고하기', isDanger: true, onPress: () => console.log('신고하기') },
  ];

  // 일반 참여자용 메뉴 옵션
  const participantMenuOptions: DropdownOption[] = [
    { id: '1', label: '채팅방 정보', onPress: () => console.log('채팅방 정보') },
    { id: '2', label: '멤버 관리', onPress: () => console.log('멤버 관리') },
    { id: '3', label: '알림 설정', onPress: () => console.log('알림 설정') },
    { id: '4', label: '채팅방 나가기', onPress: () => navigation.goBack() },
  ];

  // 현재 사용자의 메뉴 옵션 결정
  const menuOptions = chatRoom.isHost ? hostMenuOptions : participantMenuOptions;

  // 메시지 그룹화 로직
  const groupedMessages = useMemo(() => {
    return groupMessages(testMessages, currentUserId);
  }, [currentUserId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: 메시지 전송 로직 구현
      console.log('메시지 전송:', message);
      setMessage('');
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

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        {/* 헤더 */}
        <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {chatRoom.title}
            </Text>
            <Text className="text-sm text-gray-600">
              {chatRoom.subtitle}
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
      <View className="bg-white border-t border-gray-200 px-4 py-3 flex-row items-center">
        {/* 왼쪽 상점 아이콘 버튼 */}
        <TouchableOpacity
          onPress={() => console.log('상점 버튼 클릭')}
          className="w-10 h-10 rounded-full bg-mainOrange items-center justify-center mr-3"
          activeOpacity={0.8}
        >
            <Feather name="home" size={15} color="#F5F5F5" />
        </TouchableOpacity>
        
        {/* 메시지 입력 필드 (전송 버튼 포함) */}
        <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3 flex-row items-center">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-2"
            multiline
            placeholderTextColor="#9CA3AF"
          />
          
          {/* 전송 버튼 (입력 필드 안에) */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!message.trim()}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              message.trim() ? 'bg-mainOrange' : 'bg-gray-300'
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