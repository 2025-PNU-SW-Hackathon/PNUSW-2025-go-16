import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { ChatRoom, ChatMessage, MessageGroup, PaymentGuideData } from '@/types/ChatTypes';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatStatusMessage from '@/components/chat/ChatStatusMessage';
import SystemMessage from '@/components/chat/SystemMessage';
import StoreShareMessage from '@/components/chat/StoreShareMessage';
import ReservationDepositInfo from '@/components/chat/ReservationDepositInfo';
import PaymentGuideUI from '@/components/chat/PaymentGuideUI';
import PaymentModal from '@/components/common/PaymentModal';
import DropdownMenu, { DropdownOption } from '@/components/common/DropdownMenu';
import HostBadge from '@/components/chat/HostBadge';
import MeetingStatusBadge from '@/components/chat/MeetingStatusBadge';
import ParticipantManagementModal from '@/components/chat/ParticipantManagementModal';
import MeetingEditModal from '@/components/chat/MeetingEditModal';
import Toast from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import type { UserLeftRoomEventDTO, HostTransferredEventDTO } from '@/types/DTO/auth';
import type { ParticipantKickedEventDTO } from '@/types/DTO/chat';
import { usePaymentStatus, useStartPayment, useCompletePayment } from '@/hooks/queries/usePaymentQueries';
import type { PaymentStartedEventDTO, PaymentCompletedEventDTO, PaymentFullyCompletedEventDTO } from '@/types/DTO/payment';
import Feather from 'react-native-vector-icons/Feather';
import { groupMessages } from '@/utils/chatUtils';
import { useChatMessages } from '@/hooks/queries/useChatQueries';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '@/utils/socketUtils';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessageDTO, NewMessageDTO, ReservationStatusChangedEventDTO } from '@/types/DTO/chat';
import { signup, checkUserIdDuplicate, checkStoreIdDuplicate, signupWithDuplicateCheck, storeSignupWithDuplicateCheck, leaveChatRoom } from '@/apis/auth';

type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;

export default function ChatRoomScreen() {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { chatRoom } = route.params;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toastConfig, showSuccess, showError, showWarning, showInfo, hideToast } = useToast();
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // 소켓 연결 상태 추적
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // 새로고침 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 🆕 모임 상태 추가 (chatRoom에서 초기값 가져오기)
  const [reservationStatus, setReservationStatus] = useState<number | null>(() => {
    // chatRoom 객체에서 reservation_status 확인 (서버 새 필드 포함)
    const initialStatus = (chatRoom as any)?.reservation_status ?? null;
    const statusMessage = (chatRoom as any)?.status_message;
    const isRecruitmentClosed = (chatRoom as any)?.is_recruitment_closed;
    const participantInfo = (chatRoom as any)?.participant_info;
    
    console.log('🆕 [ChatRoomScreen] 서버 새 필드들 확인:', {
      chatRoomId: chatRoom.chat_room_id,
      chatRoomName: chatRoom.title || chatRoom.name,
      reservation_status: initialStatus,
      status_message: statusMessage,
      is_recruitment_closed: isRecruitmentClosed,
      participant_info: participantInfo,
      match_title: (chatRoom as any)?.match_title,
      reservation_start_time: (chatRoom as any)?.reservation_start_time
    });
    
    return initialStatus;
  });
  
  // 🆕 참여자 관리 모달 상태
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  
  // 🆕 모임 정보 수정 모달 상태
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  
  // 🆕 정산 관련 상태
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // 🆕 정산 관련 훅
  const { data: paymentStatusData, refetch: refetchPaymentStatus } = usePaymentStatus(chatRoom.chat_room_id || 0);
  const startPaymentMutation = useStartPayment();
  const completePaymentMutation = useCompletePayment();
  
  // 🆕 선택된 가게 상태 추가
  const [selectedStore, setSelectedStore] = useState<any>((chatRoom as any)?.selected_store || null);
  
  // 🆕 예약금 안내 데이터 상태
  const [paymentGuideData, setPaymentGuideData] = useState<PaymentGuideData | null>(null);
  const [showPaymentGuide, setShowPaymentGuide] = useState(false);

  
  // 새로고침 처리 함수 (아래로 당겨서 최신 메시지 불러오기)
  const onRefresh = async () => {
    // 이미 새로고침 중이면 중복 실행 방지
    if (isRefreshing) {
      console.log('🚫 이미 새로고침 중이므로 건너뜀');
      return;
    }
    
    setIsRefreshing(true);
    console.log('🔄 [ChatRoomScreen] 새로고침 시작');
    
    try {
      // 메시지 새로고침
      await refetch();
      console.log('✅ [ChatRoomScreen] 새로고침 완료');
    } catch (error) {
      console.error('❌ [ChatRoomScreen] 새로고침 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
  
  // 현재 사용자가 방장인지 확인 (chatRoom.isHost가 우선, 없으면 user?.id와 host_id 비교)
  const isCurrentUserHost = chatRoom.isHost || (user?.id && chatRoom.host_id && user.id === chatRoom.host_id) || false;
  
  // 사용자 로그아웃 시 메시지 초기화
  useEffect(() => {
    
    if (!user || !useAuthStore.getState().isLoggedIn) {
      setMessages([]);
      
      // 소켓 연결도 해제
      socketManager.disconnect();
    } else {
      // 새로운 사용자로 로그인된 경우 소켓 재연결
      // 🆕 이미 연결되어 있으면 재연결하지 않음
      if (!socketManager.isConnected()) {
        socketManager.connect();
      }
    }
  }, [user, useAuthStore.getState().isLoggedIn]);

  // API 데이터를 ChatMessage 형식으로 변환
  useEffect(() => {
    
    if (apiData?.data && currentUserId && user && useAuthStore.getState().isLoggedIn) {
      
      const convertedMessages: ChatMessage[] = apiData.data.map((msg: ChatMessageDTO) => {
        
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
          senderName: isMyMessage ? '나' : (msg.user_name || msg.sender_id),
          senderAvatar: isMyMessage ? '나' : (msg.user_name || msg.sender_id)[0],
          message: msg.message,
          timestamp: new Date(msg.created_at),
          type: 'text',
          store_id: msg.store_id
        };
      });
      
      setMessages(convertedMessages);
      
    } else if (!user || !useAuthStore.getState().isLoggedIn) {
      setMessages([]);
    }
  }, [apiData, currentUserId, user, useAuthStore.getState().isLoggedIn]);

  // 채팅방 입장 시 소켓 연결 및 이벤트 등록
  useEffect(() => {
    if (!chatRoom.chat_room_id || !currentUserId || !user || !useAuthStore.getState().isLoggedIn) {
      return;
    }
    
    // 🆕 이미 연결되어 있으면 재연결하지 않음
    if (!socketManager.isConnected()) {
      socketManager.connect();
    }
    
    // 🆕 채팅방 입장 시 정산 상태 즉시 확인
    console.log('💰 [ChatRoomScreen] 채팅방 입장 시 정산 상태 확인');
    refetchPaymentStatus();
    
    // 연결 상태 감지
    const handleConnectionChange = (connected: boolean) => {
      setIsSocketConnected(connected);
    };
    
    // 새 메시지 수신 핸들러
    const handleNewMessage = (data: NewMessageDTO) => {
      
      const newMessage: ChatMessage = {
        id: data.id.toString(),
        senderId: data.sender_id,
        senderName: data.sender_id === currentUserId ? '나' : (data.user_name || data.sender_id),
        senderAvatar: data.sender_id === currentUserId ? '나' : (data.user_name || data.sender_id)[0],
        message: data.message,
        timestamp: new Date(data.created_at),
        type: data.sender_id === 'system' ? 'system' : 'text',
        store_id: data.store_id,
        message_type: data.message_type,
        payment_id: data.payment_id,
        payment_guide_data: data.payment_guide_data
      };
      
      // 🆕 시스템 메시지에서 예약금 안내 데이터 처리
      if (data.message_type === 'system_payment_start' && data.payment_guide_data && !showPaymentGuide) {
        console.log('✅ [NewMessage] system_payment_start 메시지에서 PaymentGuideData 설정');
        console.log('📋 [NewMessage] payment_guide_data:', data.payment_guide_data);
        setPaymentGuideData(data.payment_guide_data);
        setShowPaymentGuide(true);
      }
      
      // 임시 메시지를 성공적인 메시지로 교체하거나 새 메시지 추가
      setMessages(prev => {
        const existingIndex = prev.findIndex(msg => 
          msg.isTemporary && 
          msg.senderId === data.sender_id && 
          msg.message === data.message
        );
        
        if (existingIndex !== -1) {
          // 임시 메시지를 실제 메시지로 교체
          const updated = [...prev];
          updated[existingIndex] = { ...newMessage, status: 'sent' };
          return updated;
        } else {
          // 새 메시지 추가
          return [...prev, newMessage];
        }
      });
    };

    // 메시지 상태 확인 (읽음, 전송 완료 등)
    const handleMessageAck = (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, status: data.status }
          : msg
      ));
    };

    // 메시지 전송 실패 핸들러
    const handleMessageError = (data: { tempId: string; error: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.tempId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    };

    // 🆕 모집 상태 변경 이벤트 핸들러
    const handleReservationStatusChanged = (data: ReservationStatusChangedEventDTO) => {
      console.log('🔄 [소켓] 모집 상태 변경 이벤트 수신:', data);
      
      // 상태 업데이트
      setReservationStatus(data.new_status);
      
      // 시스템 메시지 추가
      const statusMessage = data.new_status === 1 ? '모집이 마감되었습니다' : '모집이 다시 열렸습니다';
      const systemMessage: ChatMessage = {
        id: `system-status-${Date.now()}`,
        senderId: 'system',
        senderName: '시스템',
        senderAvatar: '⚙️',
        message: `📢 ${statusMessage}`,
        timestamp: new Date(),
        type: 'system',
        message_type: 'system_join'
      };
      
      setMessages(prev => [systemMessage, ...prev]);
      
      // 토스트 알림
      if (data.new_status === 1) {
        showInfo('모집이 마감되었습니다 🔒');
      } else {
        showInfo('모집이 다시 열렸습니다 🔓');
      }
    };

    // 🆕 사용자 퇴장 이벤트 핸들러
    const handleUserLeft = (data: UserLeftRoomEventDTO) => {
      console.log('🚪 [소켓] 사용자 퇴장 이벤트 수신:', data);
      
      // 시스템 메시지 추가
      const systemMessage: ChatMessage = {
        id: `system-left-${Date.now()}`,
        senderId: 'system',
        senderName: '시스템',
        senderAvatar: '⚙️',
        message: `👋 ${data.user_name}님이 나갔습니다`,
        timestamp: new Date(data.left_at),
        type: 'system',
        message_type: 'system_leave'
      };
      
      setMessages(prev => [systemMessage, ...prev]);
      
      // 방장이 나간 경우 추가 처리
      if (data.is_host_left) {
        if (data.new_host_id) {
          showWarning(`방장이 나가서 권한이 이양되었습니다\n(남은 참여자: ${data.remaining_participants}명)`);
        } else {
          showError('모임이 해산되었습니다');
          // 모임 해산 시 채팅방 목록으로 이동
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        }
      }
    };

    // 🆕 방장 권한 이양 이벤트 핸들러
    const handleHostTransferred = (data: HostTransferredEventDTO) => {
      console.log('👑 [소켓] 방장 권한 이양 이벤트 수신:', data);
      
      // 시스템 메시지 추가
      const systemMessage: ChatMessage = {
        id: `system-host-${Date.now()}`,
        senderId: 'system',
        senderName: '시스템',
        senderAvatar: '⚙️',
        message: `👑 방장 권한이 ${data.new_host}님에게 이양되었습니다`,
        timestamp: new Date(data.transferred_at),
        type: 'system',
        message_type: 'system_join'
      };
      
      setMessages(prev => [systemMessage, ...prev]);
      
      // 현재 사용자가 새 방장이 된 경우
      if (data.new_host === user?.id) {
        showSuccess('축하합니다! 방장 권한을 받았습니다 👑');
      }
    };

    // 🆕 참여자 강퇴 이벤트 핸들러
    const handleParticipantKicked = (data: ParticipantKickedEventDTO) => {
      console.log('🚨 [소켓] 참여자 강퇴 이벤트 수신:', data);
      
      // 자신이 강퇴당한 경우
      if (data.kicked_user_id === user?.id) {
        Alert.alert(
          '모임에서 강퇴되었습니다',
          `방장님에 의해 모임에서 강퇴되었습니다.`,
          [
            {
              text: '확인',
              onPress: () => {
                socketManager.leaveRoom(chatRoom.chat_room_id || 1);
                navigation.goBack();
              }
            }
          ],
          { cancelable: false }
        );
        return;
      }
      
      // 다른 참여자가 강퇴된 경우 시스템 메시지 추가
      const systemMessage: ChatMessage = {
        id: `system-kicked-${Date.now()}`,
        senderId: 'system',
        senderName: '시스템',
        senderAvatar: '⚙️',
        message: `🚨 ${data.kicked_user_name}님이 강퇴되었습니다`,
        timestamp: new Date(),
        type: 'system',
        message_type: 'system_kick'
      };
      
      setMessages(prev => [systemMessage, ...prev]);
    };

    // 🆕 가게 선택 이벤트 핸들러
    const handleStoreSelected = (data: any) => {
      console.log('🏪 [소켓] 가게 선택 이벤트 수신:', data);
      
      if (data.action === 'selected') {
        // 가게 선택됨
        const newSelectedStore = {
          store_id: data.store_id,
          store_name: data.store_name,
          payment_per_person: data.payment_per_person || 25000
        };
        
        // 상태 업데이트
        setSelectedStore(newSelectedStore);
        
        // chatRoom 객체도 업데이트
        (chatRoom as any).selected_store = newSelectedStore;
        
        // 시스템 메시지 추가
        const systemMessage: ChatMessage = {
          id: `system-store-selected-${Date.now()}`,
          senderId: 'system',
          senderName: '시스템',
          senderAvatar: '🏪',
          message: `🏪 ${data.store_name}이(가) 선택되었습니다\n💰 1인당 예상 금액: ${(data.payment_per_person || 25000).toLocaleString()}원`,
          timestamp: new Date(),
          type: 'system',
          message_type: 'system_join'
        };
        
        setMessages(prev => [systemMessage, ...prev]);
        
        // 토스트 알림
        showSuccess(`가게가 선택되었습니다!\n🏪 ${data.store_name}`);
        
      } else if (data.action === 'deselected') {
        // 가게 선택 해제됨
        setSelectedStore(null);
        (chatRoom as any).selected_store = null;
        
        // 시스템 메시지 추가
        const systemMessage: ChatMessage = {
          id: `system-store-deselected-${Date.now()}`,
          senderId: 'system',
          senderName: '시스템',
          senderAvatar: '🏪',
          message: '🔄 가게 선택이 해제되었습니다',
          timestamp: new Date(),
          type: 'system',
          message_type: 'system_join'
        };
        
        setMessages(prev => [systemMessage, ...prev]);
        
        // 토스트 알림
        showInfo('가게 선택이 해제되었습니다');
      }
    };

    // 🆕 정산 시작 이벤트 핸들러
    const handlePaymentStarted = (data: any) => {
      console.log('💰 [소켓] 정산 시작 이벤트 수신:', data);
      console.log('💰 [디버깅] payment_guide_data 확인:', data.payment_guide_data);
      
      // 🆕 구조화된 예약금 안내 데이터 처리
      if (data.payment_guide_data) {
        console.log('✅ [정산 시작] PaymentGuideData 설정');
        setPaymentGuideData(data.payment_guide_data);
        setShowPaymentGuide(true);
        console.log('✅ [정산 시작] showPaymentGuide = true 설정 완료');
      } else {
        console.log('❌ [정산 시작] payment_guide_data가 없음');
      }
      
      // 간단한 시스템 메시지 추가
      const systemMessage: ChatMessage = {
        id: `system-payment-started-${Date.now()}`,
        senderId: 'system',
        senderName: '시스템',
        senderAvatar: '💰',
        message: `💰 정산이 시작되었습니다 (${data.payment_guide_data?.payment?.per_person?.toLocaleString() || ''}원)`,
        timestamp: new Date(),
        type: 'system',
        message_type: 'system_payment_start',
        payment_id: data.payment_id,
        payment_guide_data: data.payment_guide_data
      };
      
      setMessages(prev => [systemMessage, ...prev]);
      
      // 토스트 알림
      showSuccess(`${data.started_by_name || '방장'}님이 정산을 시작했습니다! 💰`);
    };

    // 🆕 개별 입금 완료 이벤트 핸들러
    const handlePaymentCompleted = (data: PaymentCompletedEventDTO) => {
      console.log('💳 [소켓] 개별 입금 완료 이벤트 수신:', data);
      
      // 간단한 시스템 메시지 추가 (진행률 포함)
      const systemMessage: ChatMessage = {
        id: `system-payment-completed-${Date.now()}`,
        senderId: 'system',
        senderName: '시스템',
        senderAvatar: '💳',
        message: `📊 입금 현황이 업데이트되었습니다 (${data.completed_payments}/${data.total_participants}명 완료)`,
        timestamp: new Date(),
        type: 'system',
        message_type: 'system_payment_update',
        payment_id: data.payment_id,
        payment_progress: {
          completed: data.completed_payments,
          total: data.total_participants,
          is_fully_completed: data.completed_payments === data.total_participants
        }
      };
      
      setMessages(prev => [systemMessage, ...prev]);
      
      // 정산 상태 새로고침
      refetchPaymentStatus();
      
      // 토스트 알림
      if (data.user_id === user?.id) {
        showSuccess('입금이 완료되었습니다! 💳');
      } else {
        showInfo(`${data.user_name}님이 입금을 완료했습니다`);
      }
    };

    // 🆕 전체 정산 완료 이벤트 핸들러
    const handlePaymentFullyCompleted = (data: PaymentFullyCompletedEventDTO) => {
      console.log('🎉 [소켓] 전체 정산 완료 이벤트 수신:', data);
      
      // 간단한 완료 시스템 메시지
      const systemMessage: ChatMessage = {
        id: `system-payment-fully-completed-${Date.now()}`,
        senderId: 'system',
        senderName: '시스템',
        senderAvatar: '🎉',
        message: '✅ 모든 참여자의 입금이 완료되었습니다!',
        timestamp: new Date(),
        type: 'system',
        message_type: 'system_payment_completed',
        payment_id: data.payment_id
      };
      
      setMessages(prev => [systemMessage, ...prev]);
      
      // 정산 상태 새로고침
      refetchPaymentStatus();
      
      // 토스트 알림
      showSuccess('모든 참여자의 입금이 완료되었습니다! 🎉');
    };

    // 🆕 메시지 업데이트 이벤트 핸들러 (필요시 ReservationDepositInfo 컴포넌트가 자동으로 업데이트됨)
    const handleMessageUpdated = (data: any) => {
      console.log('📝 [소켓] 메시지 업데이트 이벤트 수신:', data);
      
      // 정산 상태 새로고침으로 ReservationDepositInfo 컴포넌트 자동 업데이트
      refetchPaymentStatus();
    };

    // 🆕 예약금 안내 업데이트 이벤트 핸들러
    const handlePaymentGuideUpdated = (data: any) => {
      console.log('🔄 [소켓] 예약금 안내 업데이트 이벤트 수신:', data);
      
      // 예약금 안내 데이터 업데이트
      if (data.payment_guide_data) {
        setPaymentGuideData(data.payment_guide_data);
      }
      
      // 진행률 업데이트 알림
      if (data.update_type === 'progress_update') {
        showInfo(`입금 현황: ${data.completed_payments}/${data.total_participants}명 완료`);
      }
      
      // 전체 완료 시 특별 처리
      if (data.is_fully_completed) {
        setTimeout(() => {
          setShowPaymentGuide(false);
          showSuccess('모든 입금이 완료되었습니다! 🎉');
        }, 2000);
      }
    };

    // 소켓 이벤트 등록
    socketManager.onConnectionStatusChange(handleConnectionChange);
    socketManager.onNewMessage(handleNewMessage);
    socketManager.onMessageUpdated(handleMessageUpdated);
    socketManager.onMessageAck(handleMessageAck);
    socketManager.onMessageError(handleMessageError);
    socketManager.onReservationStatusChanged(handleReservationStatusChanged);
    socketManager.onUserLeftRoom(handleUserLeft);
    socketManager.onHostTransferred(handleHostTransferred);
    socketManager.onParticipantKicked(handleParticipantKicked);
    socketManager.onStoreSelected(handleStoreSelected);
    socketManager.onPaymentStarted(handlePaymentStarted);
    socketManager.onPaymentCompleted(handlePaymentCompleted);
    socketManager.onPaymentFullyCompleted(handlePaymentFullyCompleted);
    socketManager.onPaymentGuideUpdated(handlePaymentGuideUpdated);
    
    // 채팅방 입장
    socketManager.joinRoom(chatRoom.chat_room_id);
    
    // 초기 연결 상태 설정
    setIsSocketConnected(socketManager.isConnected());
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      // 이벤트 리스너 제거는 socketManager에서 자동으로 처리됨
      console.log('🧹 [ChatRoomScreen] 컴포넌트 언마운트 - 소켓 이벤트 정리');
    };
  }, [chatRoom.chat_room_id, currentUserId, user, useAuthStore.getState().isLoggedIn]);

  // 🆕 정산 메뉴 핸들러 (조건 검증 포함)
  const handlePaymentMenu = async () => {
    console.log('💰 [방장 권한] 정산하기 메뉴 클릭');
    
    // 🆕 정산 조건 확인: 모집 마감 + 가게 선택 완료
    const isRecruitmentClosed = reservationStatus === 1;
    const hasSelectedStore = selectedStore !== null || (chatRoom as any)?.selected_store !== null;
    const currentPaymentStatus = paymentStatusData?.data?.payment_status;
    const isPaymentAlreadyStarted = currentPaymentStatus === 'in_progress' || currentPaymentStatus === 'completed';
    
    // 🆕 실제 선택된 가게 정보 (상태 또는 chatRoom에서)
    const actualSelectedStore = selectedStore || (chatRoom as any)?.selected_store;
    
    console.log('💰 [정산 조건 확인]', {
      isRecruitmentClosed,
      hasSelectedStore,
      selectedStore,
      actualSelectedStore,
      currentPaymentStatus,
      isPaymentAlreadyStarted,
      reservationStatus,
      chatRoomSelectedStore: (chatRoom as any)?.selected_store
    });
    
    // 이미 정산이 시작된 경우
    if (isPaymentAlreadyStarted) {
      Alert.alert(
        '정산 진행 중 🔄',
        `현재 정산이 진행 중입니다!\n\n📊 상태: ${currentPaymentStatus === 'in_progress' ? '입금 대기 중' : '완료'}\n💡 채팅방 상단의 예약금 안내에서 진행 상황을 확인할 수 있습니다.`,
        [{ text: '확인' }]
      );
      return;
    }
    
    // 🆕 정확한 정산 조건 체크: 모집 마감 + 가게 선택 완료
    if (!isRecruitmentClosed) {
      Alert.alert(
        '모집 마감 필요',
        '정산을 시작하려면 먼저 매칭 모집을 마감해야 합니다.\n\n드롭다운 메뉴에서 "매칭 모집 마감하기"를 선택해주세요.',
        [{ text: '확인' }]
      );
      return;
    }
    
    if (!hasSelectedStore) {
      Alert.alert(
        '가게 선택 필요',
        '정산을 시작하려면 먼저 가게를 선택해야 합니다.\n\n드롭다운 메뉴에서 "가게 선택/변경"을 통해 가게를 선택해주세요.',
        [{ text: '확인' }]
      );
      return;
    }
    
    // 🆕 모든 조건 충족 시 정산 시작 확인
    const storeName = actualSelectedStore?.store_name || '선택된 가게';
    const paymentPerPerson = actualSelectedStore?.payment_per_person || 25000;
    
    Alert.alert(
      '정산 시작',
      `${storeName}에서의 정산을 시작하시겠습니까?\n\n• 1인당 금액: ${paymentPerPerson.toLocaleString()}원\n• 정산 시작 후에는 취소할 수 없습니다.\n• 모든 참여자에게 알림이 전송됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        { text: '정산 시작', style: 'default', onPress: handleStartPayment }
      ]
    );
  };

  // 🆕 정산 시작 핸들러 (조건 검증은 handlePaymentMenu에서 완료)
  const handleStartPayment = async () => {
    if (!chatRoom.chat_room_id) {
      showError('채팅방 정보를 찾을 수 없습니다');
      return;
    }

    try {
      setPaymentLoading(true);
      
      // 🆕 기존 채팅방 정보에서 가게 정보 가져오기
      const actualSelectedStore = selectedStore || (chatRoom as any)?.selected_store;
      const paymentPerPerson = actualSelectedStore?.payment_per_person || 25000; // 기본값 25,000원
      
      console.log('💰 [정산 시작] 기존 데이터 기반:', {
        selectedStore,
        actualSelectedStore,
        paymentPerPerson
      });
      
      // 🧪 테스트용: 서버 API 대신 임시로 가짜 이벤트 발생
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 [개발 모드] 테스트용 정산 시작 이벤트 생성');
        
        const testPaymentStartedData = {
          room_id: chatRoom.chat_room_id,
          payment_id: `test_payment_${Date.now()}`,
          started_by: user?.id,
          started_by_name: user?.name || '테스트 방장',
          payment_guide_data: {
            type: 'payment_guide',
            title: '예약금 안내',
            store: {
              name: actualSelectedStore?.store_name || '테스트 스포츠바'
            },
            payment: {
              per_person: paymentPerPerson,
              total_amount: paymentPerPerson * 4,
              participants_count: 4
            },
            account: {
              bank_name: '국민은행',
              account_number: '123-456-789012',
              account_holder: '테스트사장'
            },
            deadline: {
              date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              display: '30분 후 마감'
            },
            progress: {
              completed: 0,
              total: 4,
              percentage: 0
            },
            participants: [
              {
                user_id: user?.id || 'test1',
                user_name: '나',
                status: 'pending'
              },
              {
                user_id: 'test2',
                user_name: '김철수',
                status: 'pending'
              },
              {
                user_id: 'test3',
                user_name: '이영희',
                status: 'pending'
              },
              {
                user_id: 'test4',
                user_name: '박민수',
                status: 'pending'
              }
            ],
            payment_id: `test_payment_${Date.now()}`,
            started_by: user?.id,
            started_at: new Date().toISOString(),
            is_completed: false
          }
        };
        
        // 테스트용 이벤트 핸들러 직접 호출
        handlePaymentStarted(testPaymentStartedData);
        showSuccess('정산이 시작되었습니다! 💰 (테스트 모드)');
        return;
      }
      
      const result = await startPaymentMutation.mutateAsync({
        roomId: chatRoom.chat_room_id,
        data: { payment_per_person: paymentPerPerson }
      });
      
      showSuccess('정산이 시작되었습니다! 💰');
      
    } catch (error: any) {
      console.error('❌ 정산 시작 실패:', error);
      showError(error.message || '정산 시작에 실패했습니다');
    } finally {
      setPaymentLoading(false);
    }
  };

  // 🆕 입금 완료 핸들러
  const handleCompletePayment = async () => {
    if (!chatRoom.chat_room_id) {
      showError('채팅방 정보를 찾을 수 없습니다');
      return;
    }

    try {
      setPaymentLoading(true);
      
      const result = await completePaymentMutation.mutateAsync({
        roomId: chatRoom.chat_room_id,
        data: { payment_method: 'bank_transfer' }
      });
      
      showSuccess('입금이 완료되었습니다! 💳');
      
    } catch (error: any) {
      console.error('❌ 입금 완료 실패:', error);
      showError(error.message || '입금 완료에 실패했습니다');
    } finally {
      setPaymentLoading(false);
    }
  };

  // 실패한 메시지 재전송 함수
  const retryFailedMessage = (failedMessage: ChatMessage) => {
    if (!currentUserId || !chatRoom.chat_room_id) {
      return;
    }

    // 실패한 메시지 제거
    setMessages(prev => prev.filter(msg => msg.id !== failedMessage.id));

    // 새로운 임시 메시지로 재전송
    const newTempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      ...failedMessage,
      id: newTempId,
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);

    // 소켓을 통해 재전송
    const messageData = {
      room: chatRoom.chat_room_id || 1,
      message: failedMessage.message,
      sender_id: currentUserId
    };

    socketManager.sendMessage(messageData);

    // 5초 후에도 응답이 없으면 실패 처리
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newTempId && msg.status === 'sending'
          ? { ...msg, status: 'failed' }
          : msg
      ));
    }, 5000);
  };

  // 🆕 모집 상태 변경 핸들러
  const handleReservationStatusChange = async () => {
    if (!chatRoom.chat_room_id) {
      showError('채팅방 정보를 찾을 수 없습니다');
      return;
    }

    try {
      const newStatus = reservationStatus === 1 ? 0 : 1; // 토글
      const statusText = newStatus === 1 ? '마감' : '허용';
      
      console.log(`🔄 [방장 권한] 매칭 모집 ${statusText}하기 시작`);
      console.log('현재 상태:', reservationStatus, '→ 새 상태:', newStatus);
      
      // 서버에 상태 변경 요청 (직접 fetch 사용)
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await fetch(`/api/v1/chats/${chatRoom.chat_room_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `서버 오류 (${response.status})`);
      }

      const result = await response.json();
      console.log(`✅ 매칭 모집 ${statusText} 완료:`, result);
      
      // 상태 즉시 업데이트 (소켓 이벤트가 오기 전에)
      setReservationStatus(newStatus);
      
      // 성공 토스트
      showSuccess(`매칭 모집이 ${statusText}되었습니다!`);
      
    } catch (error: any) {
      console.error(`❌ 매칭 모집 상태 변경 실패:`, error);
      showError(error.message || '상태 변경에 실패했습니다');
    }
  };

  // 🚪 실제 나가기 수행
  const performLeave = async () => {
    try {
      console.log('🚪 === 모임 탈퇴 시작 ===');
      console.log('채팅방 ID:', chatRoom.chat_room_id);
      console.log('현재 사용자:', user?.id);
      
      // 채팅방 ID가 없으면 에러 처리
      if (!chatRoom.chat_room_id) {
        console.error('❌ 채팅방 ID가 없어서 나가기를 할 수 없습니다.');
        showError('채팅방 정보를 찾을 수 없습니다');
        return;
      }
      
      console.log('🚪 서버에 모임 탈퇴 요청 전송...');
      
      // 서버에 채팅방 나가기 요청 (= 모임 탈퇴)
      const response = await leaveChatRoom(chatRoom.chat_room_id);
      
      if (response.success) {
        console.log('✅ 모임 탈퇴 성공:', response);
        
        // 🆕 서버 응답 데이터 활용
        const { data } = response;
        console.log('📊 탈퇴 결과:', {
          remaining_participants: data.remaining_participants,
          is_host_left: data.is_host_left,
          new_host_id: data.new_host_id,
          meeting_status: data.meeting_status
        });
        
        // 소켓 룸에서 나가기
        socketManager.leaveRoom(chatRoom.chat_room_id);
        
        // 채팅방 목록 무효화하여 자동 새로고침
        queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
        console.log('✅ 채팅방 목록 무효화 완료');
        
        // 🆕 상황별 토스트 메시지
        if (data.is_host_left && data.new_host_id) {
          showSuccess(`방장 권한이 이양되고 모임을 나갔습니다\n(남은 참여자: ${data.remaining_participants}명)`);
        } else if (data.is_host_left && !data.new_host_id) {
          showSuccess('모임이 해산되었습니다');
        } else {
          showSuccess(`모임을 나갔습니다\n(남은 참여자: ${data.remaining_participants}명)`);
        }
        
        // 채팅방 목록으로 이동
        setTimeout(() => {
          navigation.goBack();
        }, 1500); // 토스트 메시지를 보여주고 이동
        
      } else {
        console.error('❌ 모임 탈퇴 실패:', response.message);
        showError(response.message || '모임 나가기에 실패했습니다');
      }
    } catch (error: any) {
      console.error('❌ 모임 탈퇴 API 에러:', error);
      console.error('에러 상세:', {
        status: error?.response?.status,
        message: error?.response?.data?.message,
        url: error?.config?.url,
        method: error?.config?.method
      });
      
      if (error?.response?.status === 404) {
        showError('서버에서 해당 채팅방을 찾을 수 없습니다\n서버팀에 문의해주세요');
      } else if (error?.response?.status === 403) {
        showError('채팅방을 나갈 권한이 없습니다');
      } else {
        showError(`모임 나가기 중 오류가 발생했습니다\n(${error?.response?.status || 'Unknown'})`);
      }
    }
  };

  // 🆕 방장용 드롭다운 메뉴 옵션들
  const hostMenuOptions: DropdownOption[] = [
    { 
      id: 'host_1', 
      label: '🏪 가게 선택/변경', 
      onPress: () => {
        console.log('🏪 [방장 권한] 가게 선택/변경');
        navigation.navigate('StoreList', { 
          chatRoom: chatRoom,
          isHost: true 
        });
      }
    },
    { 
      id: 'host_2', 
      label: reservationStatus === 1 ? '🔓 매칭 모집 허용하기' : '🔒 매칭 모집 마감하기', 
      onPress: handleReservationStatusChange 
    },
    { 
      id: 'host_3', 
      label: '💰 정산하기', 
      onPress: handlePaymentMenu 
    },
    { 
      id: 'host_4', 
      label: '👥 참여자 관리', 
      onPress: () => {
        console.log('👥 [방장 권한] 참여자 관리');
        setShowParticipantModal(true);
      }
    },
    { 
      id: 'host_5', 
      label: '✏️ 모임 정보 수정', 
      onPress: () => {
        console.log('✏️ [방장 권한] 모임 정보 수정');
        setShowEditMeetingModal(true);
      }
    },
    { 
      id: 'host_6', 
      label: '🚪 채팅방 나가기', 
      onPress: () => {
        Alert.alert(
          '방장 권한 이양',
          '방장이 나가면 다른 참여자에게 방장 권한이 이양됩니다.\n마지막 참여자인 경우 모임이 해산됩니다.\n\n정말 나가시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '나가기', style: 'destructive', onPress: performLeave }
          ]
        );
      }
    },
    { 
      id: 'host_8', 
      label: '🚨 신고하기', 
      isDanger: true, 
      onPress: () => {
        console.log('📖 [방장] 신고하기');
        Alert.alert('신고하기', '부적절한 사용자나 내용을 신고할 수 있습니다.');
      }
    },
  ];

  // 🆕 일반 참여자용 드롭다운 메뉴 옵션들
  const participantMenuOptions: DropdownOption[] = [
    { 
      id: 'participant_1', 
      label: '🏪 가게 둘러보기', 
      onPress: () => {
        console.log('🏪 [참여자 권한] 가게 둘러보기');
        // StoreList로 이동 (보기 전용)
        navigation.navigate('StoreList', { 
          chatRoom: chatRoom,
          isHost: false
        });
      }
    },
    { 
      id: 'participant_5', 
      label: '🚪 채팅방 나가기', 
      onPress: () => {
        // 🆕 모집 마감 시 일반 참여자 나가기 차단
        if (reservationStatus === 1 && !isCurrentUserHost) {
          Alert.alert(
            '나가기 불가',
            '모집이 마감된 모임에서는 나갈 수 없습니다.\n방장이 모집을 다시 허용해야 나갈 수 있습니다.',
            [{ text: '확인' }]
          );
          return;
        }
        
        Alert.alert(
          '채팅방 나가기',
          '채팅방을 나가면 모임에서도 제외됩니다.\n그래도 하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '나가기', style: 'destructive', onPress: performLeave }
          ]
        );
      }
    },
    { 
      id: 'participant_6', 
      label: '🚨 신고하기', 
      isDanger: true, 
      onPress: () => {
        console.log('📖 [참여자] 신고하기');
        Alert.alert('신고하기', '부적절한 사용자나 내용을 신고할 수 있습니다.');
      }
    },
  ];

  // 현재 사용자의 메뉴 옵션 결정 (방장 여부에 따라)
  const menuOptions = isCurrentUserHost ? hostMenuOptions : participantMenuOptions;

  // 메시지 그룹화 로직
  const groupedMessages = useMemo(() => {
    
    if (!currentUserId || !user || !useAuthStore.getState().isLoggedIn) {
      return [];
    }
    
    return groupMessages(messages, currentUserId);
  }, [messages, currentUserId, user, useAuthStore.getState().isLoggedIn]); // 의존성 추가

  const handleSendMessage = () => {
    console.log('🔥 === 메시지 전송 핸들러 시작 ===');
    console.log('🧑 user 전체 객체:', user);
    console.log('🆔 user?.id:', user?.id);
    console.log('📋 useAuthStore.getState():', useAuthStore.getState());
    console.log('🔑 currentUserId:', currentUserId);
    console.log('✅ isUserLoaded:', isUserLoaded);
    console.log('💬 message.trim():', message.trim());
    console.log('🏠 chatRoom.chat_room_id:', chatRoom.chat_room_id);
    console.log('🔌 소켓 연결 상태:', socketManager.isConnected());
    
    if (!isUserLoaded) {
      console.error('❌ 사용자 정보가 제대로 로드되지 않았습니다.');
      return;
    }

    if (!isSocketConnected) {
      Alert.alert('연결 오류', '서버와 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    if (message.trim() && currentUserId) {
      const roomId = chatRoom.chat_room_id || 1;
      const messageData = {
        room: roomId,
        message: message.trim(),
        sender_id: currentUserId
      };
      
      console.log('📤 === 메시지 전송 데이터 상세 ===', {
        room: roomId,
        message: message.trim(),
        sender_id: currentUserId,
        messageLength: message.trim().length,
        chatRoomData: {
          chat_room_id: chatRoom.chat_room_id,
          name: chatRoom.name || chatRoom.title,
          host_id: chatRoom.host_id
        }
      });
      
      console.log('📝 생성된 메시지 데이터:', messageData);
      
      // 🚀 카카오톡 스타일: "전송 중" 상태로 즉시 표시
      const tempMessageId = `temp-${Date.now()}`;
      const tempMessage: ChatMessage = {
        id: tempMessageId,
        senderId: currentUserId,
        senderName: '나',
        senderAvatar: '나',
        message: message.trim(),
        timestamp: new Date(),
        type: 'text',
        isTemporary: true,
        status: 'sending' // 🕐 전송 중 상태
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setMessage(''); // 입력창 즉시 비우기
      
      console.log('💬 전송 중 메시지 추가됨:', tempMessage);
      console.log('📊 현재 메시지 개수:', messages.length + 1);
      
      // 소켓을 통해 메시지 전송
      try {
        // 🐌 테스트용: 전송 중 상태를 보기 위한 인위적 지연 (제거 예정)
        setTimeout(() => {
          socketManager.sendMessage(messageData);
          console.log('📡 소켓 메시지 전송 호출 완료');
        }, 200); // 200ms로 단축
        
        // 5초 후에도 응답이 없으면 실패 처리
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessageId && msg.status === 'sending'
              ? { ...msg, status: 'failed' }
              : msg
          ));
        }, 5000);
        
      } catch (error) {
        console.error('❌ 소켓 메시지 전송 에러:', error);
        // 즉시 실패 상태로 변경
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId 
            ? { ...msg, status: 'failed' }
            : msg
        ));
      }
      
    } else if (!currentUserId) {
      console.error('❌ 사용자 ID가 없어서 메시지를 보낼 수 없습니다.');
      console.log('사용자 상태:', { user, currentUserId, isUserLoaded });
    } else if (!message.trim()) {
      console.error('❌ 메시지가 비어있습니다.');
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
        participants: prev.participants.map(p => p.id === selectedParticipantId ? { ...p, hasDeposited: true } : p )
      }));
    }
    setShowPaymentModal(false);
    setSelectedParticipantId(null);
  };

  const renderMessageGroup = (group: MessageGroup, index: number) => {
    // 시스템 메시지 그룹
    if (group.type === 'system') {
      return group.messages.map((msg: ChatMessage) => {
        // 정산 관련 메시지는 SystemMessage 컴포넌트 사용
        if (msg.message_type === 'system_payment_start' || 
            msg.message_type === 'system_payment_update' || 
            msg.message_type === 'system_payment_completed') {
          return (
            <SystemMessage
              key={msg.id}
              message={msg.message}
              messageType={msg.message_type}
              paymentId={msg.payment_id}
              paymentProgress={msg.payment_progress}
            />
          );
        }
        
        // 기존 시스템 메시지는 ChatStatusMessage 사용
        return (
          <ChatStatusMessage 
            key={msg.id}
            message={msg.message} 
          />
        );
      });
    }

    // 사용자 메시지 그룹 - 시간 순서대로 정렬된 메시지 배열 생성
    const sortedMessages = group.messages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(msg => ({
        id: msg.id,
        type: msg.type as 'text' | 'store',
        content: msg.message,
        storeInfo: msg.storeInfo,
        status: msg.status, // 🔥 메시지 상태 전달!
        store_id: msg.store_id // 🏪 가게 ID 전달!
      }));
    
    return (
      <ChatBubble
        key={group.id}
        messages={sortedMessages}
        isMyMessage={group.isMyMessage}
        senderName={group.senderName}
        senderAvatar={group.senderAvatar}
        onRetryMessage={(messageId) => {
          // 실패한 메시지 찾기
          const failedMessage = messages.find(msg => msg.id === messageId);
          if (failedMessage) {
            retryFailedMessage(failedMessage);
          }
        }}
        chatRoom={chatRoom}
        isHost={isCurrentUserHost}
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
        <View className="flex-row items-center px-6 pt-12 pb-4 bg-white border-b border-gray-100 shadow-sm">
          <TouchableOpacity 
            onPress={() => {
              // 현재 채팅방에서만 나가기 (소켓 연결은 유지)
              socketManager.leaveRoom(chatRoom.chat_room_id || 1);
              // 채팅방 목록 새로고침
              queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
              console.log('🔙 [ChatRoomScreen] 뒤로가기: 채팅방 나가기 완료');
              navigation.goBack();
            }}
            className="mr-3"
          >
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-gray-900 mr-2">
                {chatRoom.title || chatRoom.name}
              </Text>
              {/* 👑 방장 표시 */}
              {isCurrentUserHost && (
                <HostBadge size="small" style="crown" />
              )}
              {/* 🔥 모임 상태 표시 */}
              {reservationStatus !== null && (
                <View className="ml-2">
                  <MeetingStatusBadge status={reservationStatus} size="small" />
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              {/* 🆕 경기 정보 또는 기본 부제목 */}
              <Text className="text-sm text-gray-600 mr-2">
                {(chatRoom as any)?.match_title ? `⚽ ${(chatRoom as any).match_title}` : (chatRoom.subtitle || '채팅방')}
              </Text>
              
              {/* 🆕 참여자 정보 */}
              {(chatRoom as any)?.participant_info && (
                <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">
                  👥 {(chatRoom as any).participant_info}
                </Text>
              )}
              
              {/* 🆕 선택된 가게 정보 */}
              {(selectedStore || (chatRoom as any)?.selected_store) && (
                <Text className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mr-2">
                  🏪 {(selectedStore || (chatRoom as any)?.selected_store)?.store_name}
                </Text>
              )}
                        {/* 연결 상태 표시 */}
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => {
              if (!isSocketConnected) {
                console.log('🔄 수동 소켓 재연결 시도');
                console.log('소켓 디버그 정보:', socketManager.getDebugInfo());
                // 🆕 이미 연결 중이거나 연결된 경우 재연결하지 않음
                if (!socketManager.isConnected() && !socketManager.isConnecting()) {
                  socketManager.connect();
                } else {
                  console.log('⚠️ 소켓이 이미 연결 중이거나 연결되어 있음');
                }
              }
            }}
          >
            <View 
              className={`w-2 h-2 rounded-full mr-1 ${
                isSocketConnected ? 'bg-green-500' : 'bg-red-500'
              }`} 
            />
            <Text className={`text-xs ${
              isSocketConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isSocketConnected ? '실시간' : '오프라인 (탭해서 재연결)'}
            </Text>
          </TouchableOpacity>
            </View>
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
           isVisible={showMenu}
           onClose={() => setShowMenu(false)}
           options={isCurrentUserHost ? hostMenuOptions : participantMenuOptions}
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
       <FlatList
         className="flex-1 px-4 py-2"
         showsVerticalScrollIndicator={false}
         data={[...groupedMessages].reverse()}
         keyExtractor={(item, index) => `group-${index}`}
         renderItem={({ item, index }) => {
           return <View key={`group-${index}`}>{renderMessageGroup(item, groupedMessages.length - 1 - index)}</View>;
         }}
                 ListFooterComponent={() => {
          // 🔍 디버깅: 현재 상태 확인
          console.log('🔍 [ListFooterComponent 렌더링 조건 확인]', {
            showPaymentGuide,
            paymentGuideData: !!paymentGuideData,
            paymentGuideDataContent: paymentGuideData,
            paymentStatusData: paymentStatusData?.data,
            user: user?.id
          });
          
          // 🧪 테스트용: 임시 PaymentGuideData 생성 (테스트 후 제거 예정)
          const testPaymentGuideData = {
            type: 'payment_guide' as const,
            title: '예약금 안내',
            store: {
              name: '테스트 스포츠바',
              address: '강남구 어딘가'
            },
            payment: {
              per_person: 5000,
              total_amount: 20000,
              participants_count: 4
            },
            account: {
              bank_name: '국민은행',
              account_number: '123-456-789012',
              account_holder: '테스트사장'
            },
            deadline: {
              date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              display: '30분 후 마감'
            },
            progress: {
              completed: 1,
              total: 4,
              percentage: 25
            },
            participants: [
              {
                user_id: user?.id || 'test1',
                user_name: '나',
                status: 'pending' as const
              },
              {
                user_id: 'test2',
                user_name: '김철수',
                status: 'completed' as const,
                completed_at: new Date().toISOString()
              },
              {
                user_id: 'test3',
                user_name: '이영희',
                status: 'pending' as const
              },
              {
                user_id: 'test4',
                user_name: '박민수',
                status: 'pending' as const
              }
            ],
            payment_id: 'test_payment_123',
            started_by: 'test2',
            started_at: new Date().toISOString(),
            is_completed: false
          };

          // 🧪 테스트용: 항상 PaymentGuideUI 표시 (실제 데이터가 없을 때)
          if (!showPaymentGuide && !paymentGuideData) {
            console.log('🧪 테스트용 PaymentGuideUI 표시');
            return (
              <PaymentGuideUI
                data={testPaymentGuideData}
                currentUserId={user?.id}
                onPaymentComplete={handleCompletePayment}
                isLoading={paymentLoading}
              />
            );
          }
          
          // 🆕 구조화된 예약금 안내 데이터가 있으면 PaymentGuideUI 사용
          if (showPaymentGuide && paymentGuideData) {
            console.log('✅ PaymentGuideUI 렌더링 중');
            return (
              <PaymentGuideUI
                data={paymentGuideData}
                currentUserId={user?.id}
                onPaymentComplete={handleCompletePayment}
                isLoading={paymentLoading}
              />
            );
          }
          
          // 🆕 기존 정산 상태 API로 표시 (구조화된 데이터가 없는 경우)
          const shouldShowPaymentUI = paymentStatusData?.data.payment_status && 
                                    paymentStatusData.data.payment_status !== 'not_started';
          
          console.log('🔍 기존 PaymentUI 조건:', {
            shouldShowPaymentUI,
            paymentStatus: paymentStatusData?.data.payment_status
          });
          
          if (shouldShowPaymentUI) {
            console.log('✅ ReservationDepositInfo 렌더링 중');
            return (
              <ReservationDepositInfo
                participants={depositInfo.participants}
                depositAmount={depositInfo.depositAmount}
                timeLimit={depositInfo.timeLimit}
                onDeposit={handleDeposit}
                // 🆕 정산 관련 props
                paymentMode={true}
                paymentId={paymentStatusData?.data.payment_id}
                storeName={paymentStatusData?.data.store_info?.store_name}
                storeAccount={paymentStatusData?.data.store_info ? {
                  bank_name: paymentStatusData.data.store_info.bank_name,
                  account_number: paymentStatusData.data.store_info.account_number,
                  account_holder: paymentStatusData.data.store_info.account_holder
                } : undefined}
                paymentParticipants={paymentStatusData?.data.participants}
                currentUserId={user?.id}
                isHost={isCurrentUserHost}
                deadline={paymentStatusData?.data.payment_deadline}
                onPaymentComplete={handleCompletePayment}
                onPaymentStart={undefined}
                isLoading={paymentLoading}
              />
            );
          }
          
          console.log('❌ 예약금 UI 표시 안함 - 조건 미충족');
          return null; // 정산이 시작되지 않았으면 UI 숨김
        }}
         refreshControl={
           <RefreshControl
             refreshing={isRefreshing}
             onRefresh={onRefresh}
             tintColor="#FF6B35"
             title="최신 메시지 불러오는 중..."
             titleColor="#666"
           />
         }
         inverted={true}
       />

      {/* 메시지 입력 영역 */}
      <View className="flex-row items-center px-6 py-4 bg-white border-t border-gray-100 shadow-lg" style={{paddingBottom: 34}}>
        {/* 왼쪽 가게 둘러보기 버튼 */}
        <TouchableOpacity
          onPress={() => {
            console.log('=== 가게 둘러보기 버튼 클릭 ===');
            console.log('isCurrentUserHost:', isCurrentUserHost);
            console.log('chatRoom:', chatRoom);
            console.log('user?.id:', user?.id);
            console.log('chatRoom.host_id:', chatRoom.host_id);
            
            navigation.navigate('StoreList', { 
              chatRoom: chatRoom,
              isHost: isCurrentUserHost 
            });
          }}
          className="justify-center items-center mr-3 w-10 h-10 rounded-full bg-mainOrange"
          activeOpacity={0.8}
        >
            <Feather name="map-pin" size={15} color="#F5F5F5" />
        </TouchableOpacity>
        
        {/* 메시지 입력 필드 (전송 버튼 포함) */}
        <View className="flex-row flex-1 items-center px-4 py-3 mr-3 bg-gray-50 rounded-2xl border border-gray-200">
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
            className={`w-9 h-9 rounded-full items-center justify-center shadow-sm ${
              message.trim() && isUserLoaded ? 'bg-mainOrange' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
          >
            <Feather name="send" size={16} color="#F5F5F5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🆕 참여자 관리 모달 */}
      <ParticipantManagementModal
        isVisible={showParticipantModal}
        onClose={() => setShowParticipantModal(false)}
        chatRoomId={chatRoom.chat_room_id || 1}
        isCurrentUserHost={isCurrentUserHost}
      />

      {/* 🆕 모임 정보 수정 모달 */}
      <MeetingEditModal
        isVisible={showEditMeetingModal}
        onClose={() => setShowEditMeetingModal(false)}
        chatRoomId={chatRoom.chat_room_id || 1}
        isCurrentUserHost={isCurrentUserHost}
        currentMeetingInfo={{
          title: chatRoom.title || chatRoom.name,
          description: '함께 즐거운 시간을 보내요!',
          maxParticipants: 8,
          location: '강남역 스포츠 펍',
          startTime: '19:00',
          endTime: '22:00'
        }}
      />

      {/* 🆕 토스트 알림 */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        duration={toastConfig.duration}
        onHide={hideToast}
        actionText={toastConfig.actionText}
        onActionPress={toastConfig.onActionPress}
      />
    </KeyboardAvoidingView>
  );
}