import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { ChatRoom, ChatMessage, MessageGroup } from '@/types/ChatTypes';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatStatusMessage from '@/components/chat/ChatStatusMessage';
import StoreShareMessage from '@/components/chat/StoreShareMessage';
import ReservationDepositInfo from '@/components/chat/ReservationDepositInfo';
import PaymentModal from '@/components/common/PaymentModal';
import DropdownMenu, { DropdownOption } from '@/components/common/DropdownMenu';
import HostBadge from '@/components/chat/HostBadge';
import MeetingStatusBadge from '@/components/chat/MeetingStatusBadge';
import ParticipantManagementModal from '@/components/chat/ParticipantManagementModal';
import MeetingEditModal from '@/components/chat/MeetingEditModal';
import Toast from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import type { UserLeftRoomEventDTO, HostTransferredEventDTO } from '@/types/DTO/auth';
import Feather from 'react-native-vector-icons/Feather';
import { groupMessages } from '@/utils/chatUtils';
import { useChatMessages } from '@/hooks/queries/useChatQueries';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '@/utils/socketUtils';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessageDTO, NewMessageDTO, ReservationStatusChangedEventDTO } from '@/types/DTO/chat';
import { signup, checkUserIdDuplicate, checkStoreIdDuplicate, signupWithDuplicateCheck, storeSignupWithDuplicateCheck, leaveChatRoom } from '@/apis/auth';
// import { enterChatRoom } from '@/apis/chat'; // ⚠️ 제거: 모임 참여 방지

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
  
  // 🆕 모임 상태 추가
  const [reservationStatus, setReservationStatus] = useState<number | null>(null);
  
  // 🆕 참여자 관리 모달 상태
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  
  // 🆕 모임 정보 수정 모달 상태
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  
  // 새로고침 처리 함수 (아래로 당겨서 최신 메시지 불러오기)
  const onRefresh = async () => {
    // 이미 새로고침 중이면 중복 실행 방지
    if (isRefreshing) {
      console.log('🚫 이미 새로고침 중이므로 건너뜀');
      return;
    }
    
    console.log('🔄 아래로 당겨서 새로고침 시작 - 최신 메시지 불러오기');
    setIsRefreshing(true);
    
    try {
      // API에서 최신 메시지 다시 가져오기
      await refetch();
      console.log('✅ 최신 메시지 새로고침 완료');
    } catch (error) {
      console.error('❌ 새로고침 에러:', error);
    } finally {
      // 최소 1초는 보여주기 (너무 빠른 깜빡임 방지)
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // 🆕 모임 상태 변경 이벤트 핸들러
  const handleReservationStatusChanged = (data: ReservationStatusChangedEventDTO) => {
    console.log('🔔 [소켓] 모임 상태 변경 알림:', data);
    
    // 현재 채팅방과 관련된 모임인지 확인
    const currentReservationId = chatRoom.chat_room_id; // 또는 별도 reservation_id 필드
    if (data.reservation_id === currentReservationId) {
      console.log('🎯 현재 채팅방 모임 상태 변경:', {
        old_status: reservationStatus,
        new_status: data.new_status,
        status_message: data.status_message,
        changed_by: data.changed_by
      });
      
      // 상태 업데이트
      setReservationStatus(data.new_status);
      
      // 사용자에게 토스트 알림 표시
      showSuccess(
        `모임 상태가 "${data.status_message}"로 변경되었습니다`,
        '확인'
      );
      
      // 채팅 메시지로도 시스템 알림 추가 (선택사항)
      const systemMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: 'S',
        message: `모임 상태가 "${data.status_message}"로 변경되었습니다.`,
        timestamp: new Date(data.timestamp), // 문자열을 Date 객체로 변환
        type: 'system',
        message_type: 'system_join' // 적절한 시스템 메시지 타입
      };
      
      setMessages(prev => [...prev, systemMessage]);
    } else {
      console.log('🚫 다른 모임의 상태 변경 이벤트, 무시함');
    }
  };

  // 🆕 사용자 퇴장 이벤트 핸들러
  const handleUserLeftRoom = (data: UserLeftRoomEventDTO) => {
    console.log('🚪 [소켓] 사용자 퇴장 알림:', data);
    
    // 현재 채팅방의 퇴장인지 확인
    if (data.room_id === chatRoom.chat_room_id) {
      // 시스템 메시지 추가
      const systemMessage: ChatMessage = {
        id: `system_left_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: 'S',
        message: `${data.user_name}님이 모임을 나갔습니다. (남은 참여자: ${data.remaining_participants}명)`,
        timestamp: new Date(data.left_at),
        type: 'system',
        message_type: 'system_leave'
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // 모임 상태 업데이트
      setReservationStatus(data.meeting_status);
      
      // 채팅방 목록 갱신 (참여자 수 변경 반영)
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      
      console.log(`✅ [UserLeft] ${data.user_name} 퇴장 처리 완료, 남은 참여자: ${data.remaining_participants}명`);
    }
  };

  // 🆕 방장 권한 이양 이벤트 핸들러
  const handleHostTransferred = (data: HostTransferredEventDTO) => {
    console.log('👑 [소켓] 방장 권한 이양 알림:', data);
    
    // 현재 채팅방의 권한 이양인지 확인
    if (data.room_id === chatRoom.chat_room_id) {
      const currentUserId = user?.id;
      
      // 시스템 메시지 추가
      const systemMessage: ChatMessage = {
        id: `system_host_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: 'S',
        message: `방장이 ${data.previous_host}님에서 ${data.new_host}님으로 변경되었습니다.`,
        timestamp: new Date(data.transferred_at),
        type: 'system',
        message_type: 'system_join' // 기존 타입 사용
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // 새 방장이 된 경우 토스트 알림
      if (currentUserId === data.new_host) {
        showSuccess('축하합니다! 방장 권한을 획득했습니다', '확인');
      } else {
        showInfo(`방장이 ${data.new_host}님으로 변경되었습니다`);
      }
      
      // 채팅방 목록 갱신 (방장 정보 변경 반영)
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      
      console.log(`✅ [HostTransfer] ${data.previous_host} → ${data.new_host} 권한 이양 처리 완료`);
    }
  };

  // 🔄 실패한 메시지 재시도 함수
  const retryFailedMessage = (failedMessage: ChatMessage) => {
    console.log('🔄 메시지 재시도:', failedMessage);
    
    // 실패한 메시지를 다시 전송 중 상태로 변경
    setMessages(prev => prev.map(msg => 
      msg.id === failedMessage.id 
        ? { ...msg, status: 'sending' }
        : msg
    ));

    // 소켓으로 재전송
    const messageData = {
      room: chatRoom.chat_room_id || 1,
      message: failedMessage.message,
      sender_id: user?.id
    };
    
    setTimeout(() => {
      socketManager.sendMessage(messageData);
      console.log('📡 재시도 메시지 전송 완료');
    }, 200);
    
    // 5초 후에도 응답이 없으면 다시 실패 처리
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === failedMessage.id && msg.status === 'sending'
          ? { ...msg, status: 'failed' }
          : msg
      ));
    }, 5000);
  };
  
  // API에서 메시지 데이터 가져오기 (소켓 비연결 시에만 폴링 활성화)
  const { data: apiData, isLoading, error, refetch } = useChatMessages(
    chatRoom.chat_room_id || 1, 
    !isSocketConnected // 소켓이 연결되지 않은 경우에만 폴링 활성화
  );
  
  // 채팅방 진입 시 최신 메시지 강제 로드
  useEffect(() => {
    console.log('🚪 [ChatRoomScreen] 채팅방 진입 - 디버깅 정보:', {
      chatRoomId: chatRoom.chat_room_id,
      currentMessagesCount: messages.length,
      messagesPreview: messages.slice(-3).map(m => ({
        id: m.id,
        message: m.message.substring(0, 15) + '...',
        isTemporary: m.isTemporary,
        senderId: m.senderId,
        timestamp: m.timestamp.toISOString().substring(11, 19)
      }))
    });
    
    // React Query 캐시 무효화 후 강제 새로고침
    queryClient.invalidateQueries({ 
      queryKey: ['chatMessages', chatRoom.chat_room_id || 1] 
    });
    
    // 추가로 refetch도 호출
    setTimeout(() => {
      refetch();
    }, 200); // 무효화 후 잠깐 기다렸다가 refetch
    
  }, [chatRoom.chat_room_id, queryClient, refetch]);
  
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
  const currentUserId = useMemo(() => {
    const authState = useAuthStore.getState();
    const userId = user?.id || authState.user?.id || '';
    console.log('🔄 [ChatRoomScreen] currentUserId 재계산:', {
      userFromHook: user?.id,
      userFromStore: authState.user?.id,
      finalUserId: userId
    });
    return userId;
  }, [user?.id]); // user?.id가 변경될 때마다 재계산
  
  // 사용자 ID가 제대로 로드되었는지 확인
  const isUserLoaded = !!user?.id;
  
  // 🔍 디버깅: 사용자 상태 변화 추적
  useEffect(() => {
    console.log('👤 [ChatRoomScreen] 사용자 상태 변화 감지:', {
      user: user,
      userId: user?.id,
      currentUserId: currentUserId,
      isUserLoaded: isUserLoaded,
      isLoggedIn: useAuthStore.getState().isLoggedIn,
      storeUser: useAuthStore.getState().user
    });
  }, [user, currentUserId, isUserLoaded]);
  
  // 🆕 개선된 방장 판별 로직 (서버 정보 우선 사용)
  const isCurrentUserHost = useMemo(() => {
    const currentUserId = user?.id;
    
    // 🎯 서버에서 제공하는 is_host 정보 우선 사용 (가장 정확)
    const serverIsHost = chatRoom.isHost;
    
    // 🔍 추가 검증: host_id 기준 판별
    const hostId = chatRoom.host_id;
    const hostIdMatch = hostId && currentUserId && hostId === currentUserId;
    
    // 🎯 최종 판별: 서버 정보를 우선하되, host_id로 추가 검증
    const finalIsHost = serverIsHost || hostIdMatch;
    
    console.log('🔍 [ChatRoomScreen] 개선된 방장 판별 로직:', {
      'chatRoom.isHost (서버)': serverIsHost,
      'chatRoom.host_id': hostId,
      'user?.id': currentUserId,
      'host_id 매칭': hostIdMatch,
      '🎯 최종 결과': finalIsHost,
      '✅ 상태': finalIsHost ? '방장 권한 활성' : '일반 참여자'
    });
    
    return !!finalIsHost;
  }, [chatRoom.isHost, chatRoom.host_id, user?.id]);
  
  // 🔍 방장 권한 상태 로그
  React.useEffect(() => {
    console.log('👑 [ChatRoomScreen] 방장 권한 최종 상태:', {
      'chatRoom 정보': {
        title: chatRoom.title,
        host_id: chatRoom.host_id,
        isHost: chatRoom.isHost
      },
      '현재 사용자': {
        id: user?.id,
        name: user?.email
      },
      '방장 여부': isCurrentUserHost,
      '권한 상태': isCurrentUserHost ? '🔓 방장 권한 활성' : '🔒 일반 참여자'
    });
  }, [isCurrentUserHost, chatRoom, user]);
  
  // 사용자 로그아웃 시 메시지 초기화
  useEffect(() => {
    
    if (!user || !useAuthStore.getState().isLoggedIn) {
      setMessages([]);
      
      // 로그아웃 시에만 소켓 연결 완전히 해제
      socketManager.disconnect();
      console.log('🔌 [ChatRoomScreen] 로그아웃으로 인한 소켓 해제');
    } else {
      // 새로운 사용자로 로그인된 경우 소켓 재연결
      socketManager.connect();
    }
  }, [user, useAuthStore.getState().isLoggedIn]);

  // API 데이터를 ChatMessage 형식으로 변환 (실시간 메시지 보존)
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
        
        // 가게 공유 메시지인지 확인
        if (msg.message_type === 'store_share' && msg.store_id) {
          const isMyMessage = msg.sender_id === currentUserId;
          
          return {
            id: msg.id.toString(),
            senderId: msg.sender_id,
            senderName: isMyMessage ? '나' : msg.sender_id,
            senderAvatar: isMyMessage ? '나' : msg.sender_id.charAt(0),
            message: msg.message,
            timestamp: new Date(msg.created_at),
            type: 'store' as const,
            status: 'delivered',
            // 가게 정보 추가
            store_id: msg.store_id,
            store_name: msg.store_name,
            store_address: msg.store_address,
            store_rating: msg.store_rating,
            store_thumbnail: msg.store_thumbnail,
            storeInfo: {
              storeName: msg.store_name || '가게명 없음',
              rating: msg.store_rating || 0,
              reviewCount: 0, // API에서 제공되지 않는 경우 기본값
              imageUrl: msg.store_thumbnail || ''
            }
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
          type: 'text' as const,
          status: 'delivered' // API에서 온 메시지는 전달됨 상태
        };
      });

      // 🔥 핵심 수정: 기존 실시간 메시지와 병합
      setMessages(prevMessages => {
        // API 메시지 ID들
        const apiMessageIds = new Set(convertedMessages.map(msg => msg.id));
        
        // 기존 메시지들 중에서 API에 없는 메시지들 찾기 (소켓으로만 받은 메시지들)
        const socketOnlyMessages = prevMessages.filter(msg => {
          // API에 이미 포함된 메시지는 제외
          if (apiMessageIds.has(msg.id)) {
            return false;
          }
          
          // 임시 메시지는 내용으로 매칭 확인
          if (msg.isTemporary) {
            const matchingApiMessage = convertedMessages.find(apiMsg => 
              apiMsg.message === msg.message && 
              apiMsg.senderId === msg.senderId &&
              Math.abs(apiMsg.timestamp.getTime() - msg.timestamp.getTime()) < 5000 // 5초 이내
            );
            return !matchingApiMessage;
          }
          
          // 소켓으로만 받은 일반 메시지들도 보존
          return true;
        });
        
        console.log('📊 메시지 병합 상세:', {
          apiMessages: convertedMessages.length,
          previousMessages: prevMessages.length,
          socketOnlyMessages: socketOnlyMessages.length,
          apiMessageIds: Array.from(apiMessageIds),
          previousMessageIds: prevMessages.map(m => ({ id: m.id, isTemporary: m.isTemporary, senderId: m.senderId })),
          preservedMessages: socketOnlyMessages.map(m => ({
            id: m.id,
            message: m.message.substring(0, 15) + '...',
            isTemporary: m.isTemporary,
            senderId: m.senderId,
            status: m.status
          }))
        });
        
        // API 메시지 + 소켓으로만 받은 메시지들 결합
        const combinedMessages = [...convertedMessages, ...socketOnlyMessages];
        return combinedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    } else {
      setMessages([]);
    }
  }, [apiData, currentUserId, user, useAuthStore.getState().isLoggedIn]); // 의존성 추가

  // 소켓 연결 및 실시간 메시지 처리
  useEffect(() => {
    console.log('🔄 [ChatRoomScreen] useEffect 시작 - 소켓 설정');
    
    // 사용자가 로그인하지 않은 경우 소켓 연결하지 않음
    if (!user || !useAuthStore.getState().isLoggedIn || !currentUserId) {
      console.log('🚫 [ChatRoomScreen] 소켓 연결 조건 미충족');
      return;
    }

    // 🧹 이전 콜백들 정리 (중복 방지)
    console.log('🧹 [ChatRoomScreen] 이전 콜백들 정리');
    socketManager.clearRoomCallbacks();
    
    // 소켓 연결
    socketManager.connect();
    
    // 새 메시지 수신 콜백 등록
    const handleNewMessage = (newMessage: NewMessageDTO) => {
      console.log('🔔 새 메시지 수신:', newMessage);
      console.log('📊 현재 메시지 수:', messages.length);
      
      // 시스템 메시지인지 확인
      if (newMessage.sender_id === 'system') {
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
      
      // 가게 공유 메시지인지 확인
      if (newMessage.message_type === 'store_share' && newMessage.store_id) {
        const convertedMessage: ChatMessage = {
          id: newMessage.id.toString(),
          senderId: newMessage.sender_id,
          senderName: isMyMessage ? '나' : newMessage.sender_id,
          senderAvatar: isMyMessage ? '나' : newMessage.sender_id.charAt(0),
          message: newMessage.message,
          timestamp: new Date(newMessage.created_at),
          type: 'store',
          status: 'delivered',
          isTemporary: false,
          // 가게 정보 추가
          store_id: newMessage.store_id,
          store_name: newMessage.store_name,
          store_address: newMessage.store_address,
          store_rating: newMessage.store_rating,
          store_thumbnail: newMessage.store_thumbnail,
          storeInfo: {
            storeName: newMessage.store_name || '가게명 없음',
            rating: newMessage.store_rating || 0,
            reviewCount: 0, // 실시간 메시지에는 리뷰 수 정보가 없음
            imageUrl: newMessage.store_thumbnail || ''
          }
        };
        
        setMessages(prev => [...prev, convertedMessage]);
        console.log('🏪 [ChatRoomScreen] 가게 공유 메시지 추가:', {
          storeName: convertedMessage.storeInfo?.storeName,
          rating: convertedMessage.storeInfo?.rating,
          senderId: convertedMessage.senderId
        });
        return;
      }
      
      // 일반 텍스트 메시지
      const convertedMessage: ChatMessage = {
        id: newMessage.id.toString(),
        senderId: newMessage.sender_id,
        senderName: isMyMessage ? '나' : newMessage.sender_id,
        senderAvatar: isMyMessage ? '나' : newMessage.sender_id.charAt(0),
        message: newMessage.message,
        timestamp: new Date(newMessage.created_at),
        type: 'text',
        status: 'delivered', // 서버에서 받은 메시지는 전달됨 상태
        isTemporary: false // 서버에서 받은 메시지는 확정된 메시지
      };
      
      setMessages(prev => {
        // 🔄 내 메시지인 경우, 임시 메시지를 실제 메시지로 교체
        if (isMyMessage) {
          const updatedMessages = [...prev];
          const tempMessageIndex = updatedMessages.findIndex(
            msg => msg.isTemporary && 
                   msg.message === convertedMessage.message && 
                   msg.senderId === convertedMessage.senderId
          );
          
          if (tempMessageIndex !== -1) {
            // ✅ 최소 표시 시간 후 "전달됨" 상태로 교체
            const tempMessage = updatedMessages[tempMessageIndex];
            const timeSinceSent = Date.now() - new Date(tempMessage.timestamp).getTime();
            
            console.log('🔄 임시 메시지 교체:', {
              tempMessageId: tempMessage.id,
              newMessageId: convertedMessage.id,
              timeSinceSent,
              tempMessage: tempMessage.message.substring(0, 10) + '...',
              isTemporary: tempMessage.isTemporary,
              status: tempMessage.status
            });
            
            if (timeSinceSent < 800) {
              // 800ms 미만이면 지연 후 교체
              setTimeout(() => {
                setMessages(prevMessages => prevMessages.map(msg => 
                  msg.id === tempMessage.id ? convertedMessage : msg
                ));
                console.log('⏰ 지연 후 메시지 교체 완료');
              }, 800 - timeSinceSent);
              return updatedMessages; // 일단 그대로 유지
            } else {
              // 충분한 시간이 지났으면 즉시 교체
              updatedMessages[tempMessageIndex] = convertedMessage;
              console.log('⚡ 즉시 메시지 교체 완료');
              return updatedMessages;
            }
          }
        }
        
        // 새로운 메시지 추가 (다른 사용자의 메시지 또는 중복되지 않은 내 메시지)
        console.log('➕ [ChatRoomScreen] 새 메시지 추가:', {
          message: convertedMessage.message.substring(0, 20) + '...',
          isMyMessage,
          senderId: convertedMessage.senderId,
          currentUserId,
          shouldTriggerGlobalRefresh: true
        });
        const newMessages = [...prev, convertedMessage];
        console.log('📊 [ChatRoomScreen] 업데이트된 메시지 수:', newMessages.length);
        return newMessages;
      });
    };

    // 📨 메시지 전송 성공 처리
    const handleMessageAck = (data: any) => {
      console.log('✅ 메시지 전송 성공:', data);
      
      // 📱 최소 표시 시간 보장 (카카오톡 스타일)
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.isTemporary && msg.status === 'sending'
            ? { 
                ...msg, 
                status: 'sent',
                isTemporary: false // 🔥 핵심: 전송 성공 시 임시 상태 해제
              }
            : msg
        ));
        console.log('✅ 메시지 상태 업데이트: sending → sent, isTemporary → false');
      }, 500); // 최소 500ms는 "전송 중" 상태 표시
    };

    // ❌ 메시지 전송 실패 처리  
    const handleMessageError = (error: any) => {
      console.error('❌ 메시지 전송 실패:', error);
      
      // 전송 중인 메시지를 실패 상태로 변경 (재시도 가능)
      setMessages(prev => prev.map(msg => 
        msg.isTemporary && msg.status === 'sending'
          ? { ...msg, status: 'failed' }
          : msg
      ));
    };



    // 소켓 연결 상태 추적
    const handleConnectionStatus = (isConnected: boolean) => {
      console.log('🔗 소켓 연결 상태 변경:', isConnected);
      setIsSocketConnected(isConnected);
    };

    // 소켓 이벤트 리스너 등록
    socketManager.onNewMessage(handleNewMessage);
    socketManager.onConnectionStatusChange(handleConnectionStatus);
    socketManager.onMessageAck(handleMessageAck);
    socketManager.onMessageError(handleMessageError);
    
    // 🆕 모임 상태 변경 이벤트 리스너 등록
    socketManager.onReservationStatusChanged(handleReservationStatusChanged);
    
    // 🆕 사용자 퇴장 이벤트 리스너 등록
    socketManager.onUserLeftRoom(handleUserLeftRoom);
    
    // 🆕 방장 권한 이양 이벤트 리스너 등록
    socketManager.onHostTransferred(handleHostTransferred);
    
    // 🚪 채팅방 접속 (모임 참여 없이 단순 채팅방 입장)
    const joinChatRoom = () => {
      const roomId = chatRoom.chat_room_id || 1;
      
      console.log('🚪 === 채팅방 접속 시작 (조회 전용) ===');
      console.log('채팅방 ID:', roomId);
      console.log('사용자 ID:', user?.id);
      console.log('⚠️ 주의: enterChatRoom API 호출하지 않음 (모임 참여 방지)');
      
      // 🔌 소켓 룸 조인 (모임 참여 없이)
      console.log('🔌 소켓 룸 조인 시작');
      socketManager.joinRoom(roomId);
      console.log('✅ 소켓 룸 조인 완료');
      
      // 🔄 최신 메시지 동기화는 기존 React Query가 담당
      console.log('🔄 메시지 동기화는 React Query가 담당');
    };
    
    // 채팅방 접속 시작
    joinChatRoom();
    setTimeout(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['chatMessages', chatRoom.chat_room_id || 1] 
      });
    }, 500); // 소켓 연결 후 잠시 기다렸다가 API 새로고침

    return () => {
      console.log('🧹 [ChatRoomScreen] useEffect cleanup 시작');
      
      // 특정 콜백들 개별 제거
      socketManager.removeCallback(handleNewMessage);
      socketManager.removeConnectionStatusCallback(handleConnectionStatus);
      socketManager.removeMessageAckCallback(handleMessageAck);
      socketManager.removeMessageErrorCallback(handleMessageError);
      
      // 채팅방 나가기
      const roomId = chatRoom.chat_room_id || 1;
      console.log('🚪 [ChatRoomScreen] 채팅방 나가기:', roomId);
      socketManager.leaveRoom(roomId);
      
      console.log('✅ [ChatRoomScreen] useEffect cleanup 완료');
    };
  }, [chatRoom.chat_room_id, currentUserId, user, useAuthStore.getState().isLoggedIn]); // 의존성 추가

  // 🆕 방장 전용 기능 구현
  const handleCloseRecruitment = async () => {
    try {
      console.log('👑 [방장 권한] 모집 마감 처리 시작');
      
      // TODO: 실제 API 호출 구현
      // await updateReservationStatus(chatRoom.chat_room_id, 1); // 1: 모집마감
      
      console.log('✅ 모집 마감 완료');
      showSuccess('모집이 마감되었습니다');
      
      // 상태 업데이트
      setReservationStatus(1);
      
    } catch (error: any) {
      console.error('❌ 모집 마감 실패:', error);
      
      // 🆕 403 에러 처리 - 토스트로 표시
      if (error?.response?.status === 403) {
        showError('방장만 이 기능을 사용할 수 있습니다');
      } else {
        showError('모집 마감에 실패했습니다. 다시 시도해주세요', '재시도', handleCloseRecruitment);
      }
    }
  };

  const handleManageParticipants = () => {
    console.log('👑 [방장 권한] 참여자 관리 모달 열기');
    setShowParticipantModal(true);
  };

  const handleEditMeetingInfo = () => {
    console.log('👑 [방장 권한] 모임 정보 수정 모달 열기');
    setShowEditMeetingModal(true);
  };

  // 방장용 메뉴 옵션
  const hostMenuOptions: DropdownOption[] = [
    { 
      id: 'host_1', 
      label: '👑 매칭 정보 보기', 
      onPress: () => {
        console.log('👑 [방장 권한] 매칭 정보 보기');
        Alert.alert('매칭 정보', `모임 ID: ${chatRoom.chat_room_id}\n상태: ${reservationStatus === 1 ? '모집마감' : '모집중'}`);
      }
    },
    { 
      id: 'host_2', 
      label: '✏️ 매칭 정보 수정하기', 
      onPress: handleEditMeetingInfo
    },
    { 
      id: 'host_3', 
      label: '🚫 매칭 모집 마감하기', 
      onPress: () => {
        console.log('👑 [방장 권한] 매칭 모집 마감하기');
        Alert.alert(
          '모집 마감',
          '매칭 모집을 마감하시겠습니까?\n마감 후에는 새로운 참여자가 들어올 수 없습니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '마감하기', style: 'destructive', onPress: handleCloseRecruitment }
          ]
        );
      }
    },
    { 
      id: 'host_4', 
      label: '👥 참여자 관리', 
      onPress: handleManageParticipants
    },
    { 
      id: 'host_5', 
      label: '🏪 가게 선택/변경', 
      onPress: () => {
        console.log('👑 [방장 권한] 가게 선택/변경');
        // StoreList로 이동
        navigation.navigate('StoreList', { 
          chatRoom: chatRoom,
          isHost: true
        });
      }
    },
    { 
      id: 'host_6', 
      label: '🚪 채팅방 나가기', 
      onPress: () => {
        Alert.alert(
          '채팅방 나가기',
          '⚠️ 방장이 나가면 모임이 해체됩니다.\n정말로 나가시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '나가기', style: 'destructive', onPress: handleLeaveChatRoom }
          ]
        );
      }
    },
    { 
      id: 'host_7', 
      label: '🚨 신고하기', 
      isDanger: true, 
      onPress: () => {
        console.log('👑 [방장 권한] 신고하기');
        Alert.alert('신고하기', '부적절한 사용자를 신고할 수 있습니다.');
      }
    },
  ];

  // 일반 참여자용 메뉴 옵션
  const participantMenuOptions: DropdownOption[] = [
    { 
      id: 'participant_1', 
      label: 'ℹ️ 모임 정보 보기', 
      onPress: () => {
        console.log('📖 [참여자] 모임 정보 보기');
        Alert.alert('모임 정보', '모임의 세부 정보를 확인할 수 있습니다.');
      }
    },
    { 
      id: 'participant_2', 
      label: '👥 참여자 목록', 
      onPress: () => {
        console.log('📖 [참여자] 참여자 목록');
        Alert.alert('참여자 목록', '함께하는 멤버들을 확인할 수 있습니다.');
      }
    },
    { 
      id: 'participant_3', 
      label: '🔔 알림 설정', 
      onPress: () => {
        console.log('📖 [참여자] 알림 설정');
        Alert.alert('알림 설정', '채팅방 알림을 관리할 수 있습니다.');
      }
    },
    { 
      id: 'participant_4', 
      label: '🏪 가게 정보 보기', 
      onPress: () => {
        console.log('📖 [참여자] 가게 정보 보기');
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
        Alert.alert(
          '채팅방 나가기',
          '채팅방을 나가면 모임에서도 제외됩니다.\n그래도 하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '나가기', style: 'destructive', onPress: handleLeaveChatRoom }
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

  // 🚪 채팅방 나가기 처리 (= 모임 완전 탈퇴)
  const handleLeaveChatRoom = async () => {
    try {
      console.log('🚪 === 모임 탈퇴 시작 ===');
      console.log('채팅방 ID:', chatRoom.chat_room_id);
      console.log('현재 사용자:', user?.id);
      console.log('방장 여부:', isCurrentUserHost);
      
      // 채팅방 ID가 없으면 에러 처리
      if (!chatRoom.chat_room_id) {
        console.error('❌ 채팅방 ID가 없어서 나가기를 할 수 없습니다.');
        showError('채팅방 정보를 찾을 수 없습니다');
        return;
      }

      // 🆕 방장인 경우 추가 확인
      if (isCurrentUserHost) {
        Alert.alert(
          '방장 모임 나가기',
          '방장이 나가면 다른 참여자에게 방장 권한이 자동으로 이양되거나 모임이 해산될 수 있습니다.\n정말 나가시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '나가기', style: 'destructive', onPress: () => performLeave() }
          ]
        );
      } else {
        Alert.alert(
          '모임 나가기',
          '모임을 나가면 다시 참여할 수 없습니다.\n정말 나가시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '나가기', style: 'destructive', onPress: () => performLeave() }
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ 채팅방 나가기 에러:', error);
      showError('채팅방 나가기 중 오류가 발생했습니다');
    }
  };

  // 🚪 실제 나가기 수행
  const performLeave = async () => {
    try {
      console.log('🚪 서버에 모임 탈퇴 요청 전송...');
      
      // 서버에 채팅방 나가기 요청 (= 모임 탈퇴)
      const response = await leaveChatRoom(chatRoom.chat_room_id!);
      
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
        socketManager.leaveRoom(chatRoom.chat_room_id!);
        
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
              <Text className="text-sm text-gray-600 mr-2">
                {chatRoom.subtitle || '채팅방'}
              </Text>
                        {/* 연결 상태 표시 */}
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => {
              if (!isSocketConnected) {
                console.log('🔄 수동 소켓 재연결 시도');
                console.log('소켓 디버그 정보:', socketManager.getDebugInfo());
                socketManager.connect();
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
         ListFooterComponent={() => (
           <ReservationDepositInfo
             participants={depositInfo.participants}
             depositAmount={depositInfo.depositAmount}
             timeLimit={depositInfo.timeLimit}
             onDeposit={handleDeposit}
           />
         )}
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