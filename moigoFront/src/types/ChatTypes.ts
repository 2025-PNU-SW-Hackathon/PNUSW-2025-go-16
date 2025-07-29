export interface ChatRoom {
  id: string;
  type: 'matching' | 'store';
  title: string;
  subtitle: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isHost: boolean; // 방장 여부
  icon: {
    text: string;
    backgroundColor: string;
    textColor: string;
  };
  location?: string; // 가게 채팅의 경우 위치 정보
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isMyMessage: boolean;
}

export interface ChatRoomDetail {
  id: string;
  type: 'matching' | 'store';
  title: string;
  participants: number;
  messages: ChatMessage[];
} 