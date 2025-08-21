import { useAuthStore } from '@/store/authStore';
import Constants from 'expo-constants';
import type { NewMessageDTO, SocketMessageDTO } from '@/types/DTO/chat';

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

  // Socket 연결
  connect() {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      console.error('토큰이 없어서 소켓 연결을 할 수 없습니다.');
      return;
    }

    if (this.socket?.connected) {
      console.log('이미 소켓이 연결되어 있습니다.');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  // 이벤트 리스너 설정
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('소켓 연결됨:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('소켓 연결 해제:', reason);
    });

    this.socket.on('newMessage', (message: NewMessageDTO) => {
      console.log('새 메시지 수신:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('error', (error: any) => {
      console.error('소켓 에러:', error);
      this.errorCallbacks.forEach(callback => callback(error));
    });
  }

  // 채팅방 입장
  joinRoom(roomId: number) {
    if (!this.socket?.connected) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }

    this.socket.emit('joinRoom', roomId);
    console.log('채팅방 입장:', roomId);
  }

  // 채팅방 나가기
  leaveRoom(roomId: number) {
    if (!this.socket?.connected) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }

    this.socket.emit('leaveRoom', roomId);
    console.log('채팅방 나가기:', roomId);
  }

  // 메시지 전송
  sendMessage(data: SocketMessageDTO) {
    if (!this.socket?.connected) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }

    this.socket.emit('sendMessage', data);
    console.log('메시지 전송:', data);
  }

  // 새 메시지 콜백 등록
  onNewMessage(callback: (message: NewMessageDTO) => void) {
    this.messageCallbacks.push(callback);
  }

  // 에러 콜백 등록
  onError(callback: (error: any) => void) {
    this.errorCallbacks.push(callback);
  }

  // 콜백 제거
  removeCallback(callback: (message: NewMessageDTO) => void) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  // 소켓 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.messageCallbacks = [];
      this.errorCallbacks = [];
      console.log('소켓 연결 해제됨');
    }
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// 싱글톤 인스턴스
export const socketManager = new SocketManager();
