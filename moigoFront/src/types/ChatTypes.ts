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
  host_id?: string; // 방장 ID
  icon: {
    text: string;
    backgroundColor: string;
    textColor: string;
  };
  location?: string; // 가게 채팅의 경우 위치 정보
}

// 시스템 메시지 타입 정의
export type SystemMessageType = 'system_join' | 'system_leave' | 'system_kick' | 'store_share' | 'payment_started' | 'payment_completed' | 'system_payment_start' | 'system_payment_update' | 'system_payment_completed';

// 메시지 전송 상태 타입
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// 백엔드에서 받는 기본 메시지 구조
export interface ChatMessage {
  id: string;
  senderId: string; // 'system' | 'user123' | 'user456' 등
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: Date;
  type: 'system' | 'text' | 'store' | 'store_share'; // system: 시스템 메시지, text: 일반 텍스트, store: 가게 공유, store_share: 가게 공유 메시지
  isTemporary?: boolean; // 임시 메시지 여부 (Optimistic UI용)
  status?: MessageStatus; // 메시지 전송 상태
  // 시스템 메시지 관련 필드
  message_type?: SystemMessageType; // 시스템 메시지 타입
  user_name?: string; // 관련 사용자 이름
  user_id?: string; // 관련 사용자 ID
  kicked_by?: string; // 강퇴한 사용자 ID
  // 가게 공유 메시지 관련 필드
  store_id?: number; // 가게 ID
  store_name?: string; // 가게 이름
  store_address?: string; // 가게 주소
  store_rating?: number; // 가게 평점
  store_thumbnail?: string; // 가게 썸네일
  storeInfo?: {
    storeName: string;
    rating: number;
    reviewCount: number;
    imageUrl: string;
  };
  // 정산 시스템 메시지 관련 필드
  payment_id?: string; // 정산 ID
  payment_progress?: {
    completed: number;
    total: number;
    is_fully_completed: boolean;
  };
  updated?: boolean; // 메시지 업데이트 여부
  // 🆕 구조화된 예약금 안내 데이터
  payment_guide_data?: PaymentGuideData;
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

// 🆕 구조화된 예약금 안내 데이터 타입
export interface PaymentGuideData {
  type: 'payment_guide';
  title: string;
  store: {
    name: string;
    address?: string;
  };
  payment: {
    per_person: number;
    total_amount: number;
    participants_count: number;
  };
  account: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  };
  deadline: {
    date: string;
    display: string;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  participants: Array<{
    user_id: string;
    user_name: string;
    status: 'pending' | 'completed';
    completed_at?: string;
  }>;
  payment_id: string;
  started_by: string;
  started_at: string;
  is_completed?: boolean;
  updated_at?: string;
}

export interface ChatRoomDetail {
  id: string;
  type: 'matching' | 'store';
  title: string;
  participants: number;
  messages: ChatMessage[];
} 