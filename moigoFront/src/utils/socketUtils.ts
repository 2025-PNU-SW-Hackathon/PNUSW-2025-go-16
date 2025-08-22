import { useAuthStore } from '@/store/authStore';
import Constants from 'expo-constants';
import type { NewMessageDTO, SocketMessageDTO, ReservationStatusChangedEventDTO } from '@/types/DTO/chat';

// Socket.IO 클라이언트를 any로 import
const io = require('socket.io-client');

// 환경변수에서 WebSocket URL 가져오기
const { WS_URL } = (Constants.expoConfig?.extra ?? {}) as any;
if (!WS_URL) {
  console.warn('WS_URL missing: check app.json extra.WS_URL');
}

const SOCKET_URL = WS_URL || 'wss://spotple.kr';

console.log('Socket Manager 초기화 - SOCKET_URL:', SOCKET_URL);

class SocketManager {
  private socket: any = null;
  private messageCallbacks: ((message: NewMessageDTO) => void)[] = [];
  private errorCallbacks: ((error: any) => void)[] = [];
  private connectionStatusCallbacks: ((isConnected: boolean) => void)[] = [];
  private messageAckCallbacks: ((data: any) => void)[] = [];
  private messageErrorCallbacks: ((error: any) => void)[] = [];
  private reservationStatusCallbacks: ((data: ReservationStatusChangedEventDTO) => void)[] = []; // 🆕 추가
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval: any = null;
  private currentRoomId: number | null = null; // 현재 참여 중인 방 ID

  // Socket 연결
  connect() {
    const { token, user } = useAuthStore.getState();
    
    console.log('=== 소켓 연결 시도 ===');
    console.log('토큰 존재 여부:', !!token);
    console.log('사용자 정보:', user);
    console.log('사용자 ID:', user?.id);
    console.log('로그인 상태:', useAuthStore.getState().isLoggedIn);
    
    if (!token) {
      console.error('토큰이 없어서 소켓 연결을 할 수 없습니다.');
      return;
    }

    if (!user?.id) {
      console.error('사용자 ID가 없어서 소켓 연결을 할 수 없습니다.');
      return;
    }

    if (!useAuthStore.getState().isLoggedIn) {
      console.error('로그인 상태가 아니어서 소켓 연결을 할 수 없습니다.');
      return;
    }

    // 🚀 이미 연결된 경우 재연결하지 않고 기존 연결 사용
    if (this.socket?.connected) {
      console.log('✅ 이미 소켓이 연결되어 있습니다. 기존 연결을 재사용합니다.');
      return;
    }

    // 연결 중인 경우 기다리기
    if (this.socket && this.socket.connecting) {
      console.log('⏳ 소켓 연결 중입니다. 잠시 기다려주세요.');
      return;
    }

    console.log('🔌 새로운 소켓 연결 시도 - 사용자 ID:', user.id);

    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
        userId: user.id
      },
      transports: ['websocket', 'polling'],
      timeout: 10000, // 10초 타임아웃
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  // 이벤트 리스너 설정
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ 소켓 연결됨:', this.socket?.id);
      this.reconnectAttempts = 0; // 연결 성공 시 재연결 카운터 리셋
      
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }

      // 🔄 연결 상태 콜백 호출
      this.connectionStatusCallbacks.forEach(callback => callback(true));
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ 소켓 연결 해제:', reason);
      
      // 🔄 연결 상태 콜백 호출
      this.connectionStatusCallbacks.forEach(callback => callback(false));
      
      // 수동 해제가 아닌 경우에만 재연결 시도
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('🔴 소켓 연결 에러:', error);
      this.attemptReconnect();
    });

    this.socket.on('newMessage', (message: NewMessageDTO) => {
      console.log('📨 === 새 메시지 수신 ===');
      console.log('메시지 데이터:', message);
      console.log('콜백 개수:', this.messageCallbacks.length);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // 메시지 전송 확인 이벤트 추가
    this.socket.on('messageAck', (data: any) => {
      console.log('✅ 메시지 전송 확인:', data);
      this.messageAckCallbacks.forEach(callback => callback(data));
    });

    // 메시지 전송 실패 이벤트 추가
    this.socket.on('messageError', (error: any) => {
      console.error('❌ 메시지 전송 실패:', error);
      this.messageErrorCallbacks.forEach(callback => callback(error));
    });

    // 🆕 모임 상태 변경 이벤트 추가
    this.socket.on('reservationStatusChanged', (data: ReservationStatusChangedEventDTO) => {
      console.log('🔔 모임 상태 변경 이벤트 수신:', data);
      this.reservationStatusCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('error', (error: any) => {
      console.error('⚠️ === 소켓 에러 ===');
      console.error('에러 내용:', error);
      console.error('에러 타입:', typeof error);
      console.error('에러 메시지:', error?.message || error);
      this.errorCallbacks.forEach(callback => callback(error));
    });
  }

  // 재연결 시도
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚫 최대 재연결 시도 횟수 도달. 재연결을 중단합니다.');
      return;
    }

    if (this.reconnectInterval) return; // 이미 재연결 시도 중

    this.reconnectAttempts++;
    console.log(`🔄 소켓 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect();
    }, 2000 * this.reconnectAttempts); // 지수적 백오프
  }

  // 채팅방 입장
  joinRoom(roomId: number) {
    if (!this.socket?.connected) {
      console.error('❌ 소켓이 연결되지 않아서 채팅방에 입장할 수 없습니다.');
      return;
    }

    // 🔄 이미 같은 방에 있는지 확인 (중복 입장 방지)
    if (this.currentRoomId === roomId) {
      console.log('⚠️ [joinRoom] 이미 같은 채팅방에 참여 중입니다:', roomId);
      return;
    }

    // 🚪 다른 방에 있다면 먼저 나가기
    if (this.currentRoomId !== null) {
      console.log('🔄 [joinRoom] 기존 채팅방에서 나가기:', this.currentRoomId);
      this.leaveRoom(this.currentRoomId);
    }

    const { user, token, isLoggedIn } = useAuthStore.getState();
    
    // 사용자 인증 정보 확인
    console.log('🚪 === 채팅방 입장 시도 ===');
    console.log('채팅방 ID:', roomId);
    console.log('이전 방 ID:', this.currentRoomId);
    console.log('사용자 ID:', user?.id);
    console.log('토큰 존재:', !!token);
    console.log('로그인 상태:', isLoggedIn);

    if (!user?.id) {
      console.error('❌ 사용자 ID가 없어서 채팅방에 입장할 수 없습니다.');
      return;
    }

    if (!isLoggedIn) {
      console.error('❌ 로그인 상태가 아니어서 채팅방에 입장할 수 없습니다.');
      return;
    }

    // 더 상세한 정보로 채팅방 입장 요청
    const joinData = {
      room_id: roomId,
      user_id: user.id,
      token: token
    };

    console.log('📤 채팅방 입장 데이터:', joinData);

    this.socket.emit('joinRoom', joinData);
    this.currentRoomId = roomId; // 현재 방 ID 업데이트
    console.log('✅ 채팅방 입장 요청 전송 완료:', roomId);
  }

  // 채팅방 나가기
  leaveRoom(roomId: number) {
    if (!this.socket?.connected) {
      console.error('❌ 소켓이 연결되지 않았습니다.');
      return;
    }

    console.log('🚪 === 채팅방 나가기 시도 ===');
    console.log('나갈 방 ID:', roomId);
    console.log('현재 방 ID:', this.currentRoomId);

    this.socket.emit('leaveRoom', roomId);
    
    // 현재 방 ID 초기화 (해당 방에서 나간 경우에만)
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
      console.log('✅ 현재 방 ID 초기화됨');
    }
    
    console.log('✅ 채팅방 나가기 요청 전송 완료:', roomId);
  }

  // 메시지 전송
  sendMessage(data: SocketMessageDTO) {
    console.log('🚀 === 메시지 전송 시도 ===');
    console.log('소켓 존재 여부:', !!this.socket);
    console.log('소켓 연결 상태:', this.socket?.connected);
    console.log('소켓 ID:', this.socket?.id);
    
    if (!this.socket?.connected) {
      console.error('❌ 소켓이 연결되지 않았습니다.');
      return;
    }

    const { user, token, isLoggedIn } = useAuthStore.getState();
    console.log('📝 사용자 정보 확인:', {
      userId: user?.id,
      hasToken: !!token,
      isLoggedIn,
      userType: user?.userType
    });

    console.log('📤 전송할 메시지 데이터:', data);

    // 사용자 ID가 없으면 추가
    if (!data.sender_id && user?.id) {
      data.sender_id = user.id;
      console.log('✅ sender_id 추가됨:', data.sender_id);
    }

    // 최종 데이터 확인
    console.log('📋 최종 전송 데이터:', {
      room: data.room,
      message: data.message,
      sender_id: data.sender_id,
      messageLength: data.message?.length
    });

    try {
      this.socket.emit('sendMessage', data);
      console.log('✅ 메시지 전송 emit 완료');
    } catch (error) {
      console.error('❌ 메시지 전송 중 에러:', error);
    }
  }

  // 새 메시지 콜백 등록
  onNewMessage(callback: (message: NewMessageDTO) => void) {
    this.messageCallbacks.push(callback);
  }

  // 에러 콜백 등록
  onError(callback: (error: any) => void) {
    this.errorCallbacks.push(callback);
  }

  // 연결 상태 콜백 등록
  onConnectionStatusChange(callback: (isConnected: boolean) => void) {
    this.connectionStatusCallbacks.push(callback);
    // 현재 연결 상태를 즉시 콜백으로 전달
    callback(this.isConnected());
  }

  // 메시지 전송 성공 콜백 등록
  onMessageAck(callback: (data: any) => void) {
    this.messageAckCallbacks.push(callback);
  }

  // 메시지 전송 실패 콜백 등록
  onMessageError(callback: (error: any) => void) {
    this.messageErrorCallbacks.push(callback);
  }

  // 🆕 모임 상태 변경 이벤트 리스너 등록
  onReservationStatusChanged(callback: (data: ReservationStatusChangedEventDTO) => void) {
    this.reservationStatusCallbacks.push(callback);
  }

  // 메시지 콜백 제거
  removeCallback(callback: (message: NewMessageDTO) => void) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  // 연결 상태 콜백 제거
  removeConnectionStatusCallback(callback: (isConnected: boolean) => void) {
    const index = this.connectionStatusCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionStatusCallbacks.splice(index, 1);
    }
  }

  // 메시지 전송 성공 콜백 제거
  removeMessageAckCallback(callback: (data: any) => void) {
    const index = this.messageAckCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageAckCallbacks.splice(index, 1);
    }
  }

  // 메시지 전송 실패 콜백 제거
  removeMessageErrorCallback(callback: (error: any) => void) {
    const index = this.messageErrorCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageErrorCallbacks.splice(index, 1);
    }
  }

  // 🧹 모든 콜백 정리 (채팅방 나갈 때 사용)
  clearRoomCallbacks() {
    console.log('🧹 [SocketManager] 모든 룸 관련 콜백 정리');
    console.log('정리 전 콜백 수:', {
      messageCallbacks: this.messageCallbacks.length,
      connectionStatusCallbacks: this.connectionStatusCallbacks.length,
      messageAckCallbacks: this.messageAckCallbacks.length,
      messageErrorCallbacks: this.messageErrorCallbacks.length
    });
    
    // 모든 콜백 배열 초기화 (전역 리스너는 유지)
    this.messageCallbacks = [];
    this.messageAckCallbacks = [];
    this.messageErrorCallbacks = [];
    // connectionStatusCallbacks는 전역 상태이므로 유지
    
    console.log('정리 후 콜백 수:', {
      messageCallbacks: this.messageCallbacks.length,
      messageAckCallbacks: this.messageAckCallbacks.length,
      messageErrorCallbacks: this.messageErrorCallbacks.length
    });
  }

  // 소켓 연결 해제
  disconnect() {
    console.log('=== 소켓 연결 해제 ===');
    if (this.socket) {
      console.log('기존 소켓 연결 해제 중...');
      this.socket.disconnect();
      this.socket = null;
      this.messageCallbacks = [];
      this.errorCallbacks = [];
      this.currentRoomId = null; // 방 ID 초기화
      console.log('소켓 연결 해제 완료');
    } else {
      console.log('연결된 소켓이 없습니다.');
    }
  }

  // 연결 상태 확인
  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    console.log('🔗 소켓 연결 상태 체크:', {
      hasSocket: !!this.socket,
      connected,
      socketId: this.socket?.id,
      readyState: this.socket?.readyState
    });
    return connected;
  }

  // 소켓 상태 디버그 정보
  getDebugInfo() {
    return {
      hasSocket: !!this.socket,
      connected: this.socket?.connected,
      connecting: this.socket?.connecting,
      disconnected: this.socket?.disconnected,
      socketId: this.socket?.id,
      readyState: this.socket?.readyState,
      reconnectAttempts: this.reconnectAttempts,
      messageCallbacksCount: this.messageCallbacks.length,
      errorCallbacksCount: this.errorCallbacks.length
    };
  }
}

// 싱글톤 인스턴스
export const socketManager = new SocketManager();
