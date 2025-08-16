// 채팅방 목록 조회 응답
export interface ChatRoomListResponseDTO {
  success: boolean;
  data: ChatRoomDTO[];
}

export interface ChatRoomDTO {
  chat_room_id: number;
  name: string;
  last_message: string;
  last_message_time: string;
  sender_id: string;
}

// 채팅방 입장/생성 요청
export interface EnterChatRoomRequestDTO {
  group_id: number;
}

// 채팅방 입장/생성 응답
export interface EnterChatRoomResponseDTO {
  success: boolean;
  data: {
    reservation_id: number;
    message: string;
  };
}

// 채팅 메시지 조회 응답
export interface ChatMessagesResponseDTO {
  success: boolean;
  data: ChatMessageDTO[];
}

export interface ChatMessageDTO {
  id: number;
  sender_id: string;
  message: string;
  created_at: string;
  read_count: number;
  // 시스템 메시지 관련 필드
  message_type?: 'system_join' | 'system_leave' | 'system_kick';
  user_name?: string;
  user_id?: string;
  kicked_by?: string;
}

// 채팅방 상태 변경 요청
export interface UpdateChatRoomStatusRequestDTO {
  status: number;
}

// 채팅방 상태 변경 응답
export interface UpdateChatRoomStatusResponseDTO {
  success: boolean;
  message: string;
}

// 일반 응답
export interface ChatResponseDTO {
  success: boolean;
  message: string;
}

// 소켓 메시지 타입
export interface SocketMessageDTO {
  room: number;
  message: string;
  sender_id?: string; // 사용자 ID 추가
}

export interface NewMessageDTO {
  id: number;
  sender_id: string;
  message: string;
  created_at: string;
  room_id: number;
  read_count?: number; // 선택적 필드로 추가
  // 시스템 메시지 관련 필드
  message_type?: 'system_join' | 'system_leave' | 'system_kick';
  user_name?: string;
  user_id?: string;
  kicked_by?: string;
}

// 에러 응답
export interface ChatErrorResponseDTO {
  success: false;
  message: string;
  errorCode: string;
} 