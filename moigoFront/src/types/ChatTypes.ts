export interface ChatRoom {
  id: string;
  chat_room_id?: number; // API에서 사용하는 ID
  name?: string; // API에서 사용하는 이름
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

// 시스템 메시지 타입 정의
export type SystemMessageType = 'system_join' | 'system_leave' | 'system_kick';

// 백엔드에서 받는 기본 메시지 구조
export interface ChatMessage {
  id: string;
  senderId: string; // 'system' | 'user123' | 'user456' 등
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: Date;
  type: 'system' | 'text' | 'store'; // system: 시스템 메시지, text: 일반 텍스트, store: 가게 공유
  // 시스템 메시지 관련 필드
  message_type?: SystemMessageType; // 시스템 메시지 타입
  user_name?: string; // 관련 사용자 이름
  user_id?: string; // 관련 사용자 ID
  kicked_by?: string; // 강퇴한 사용자 ID
  storeInfo?: {
    storeName: string;
    rating: number;
    reviewCount: number;
    imageUrl: string;
  };
}

// 프론트엔드에서 사용할 메시지 그룹 구조
export interface MessageGroup {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isMyMessage: boolean;
  messages: ChatMessage[];
  type: 'system' | 'user'; // system: 시스템 메시지 그룹, user: 사용자 메시지 그룹
}

export interface ChatRoomDetail {
  id: string;
  type: 'matching' | 'store';
  title: string;
  participants: number;
  messages: ChatMessage[];
} 