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
  // 🆕 서버팀에서 추가한 방장 정보 필드들
  host_id?: string; // 실제 방장 ID
  is_host?: boolean; // 현재 사용자가 방장인지
  current_user_is_host?: boolean; // 현재 사용자가 방장인지 (대안 필드명)
  user_role?: string; // 사용자 역할 ("방장" 또는 "참가자")
  reservation_id?: number; // 연결된 모임 ID
  reservation_status?: number; // 모임 상태 (0: 모집중, 1: 마감, 2: 진행중, 3: 완료)
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
  message_type?: 'system_join' | 'system_leave' | 'system_kick' | 'store_share';
  user_name?: string;
  user_id?: string;
  kicked_by?: string;
  // 가게 공유 메시지 관련 필드
  store_id?: number;
  store_name?: string;
  store_address?: string;
  store_rating?: number;
  store_thumbnail?: string;
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
  message_type?: 'system_join' | 'system_leave' | 'system_kick' | 'store_share';
  user_name?: string;
  user_id?: string;
  kicked_by?: string;
  // 가게 공유 메시지 관련 필드
  store_id?: number;
  store_name?: string;
  store_address?: string;
  store_rating?: number;
  store_thumbnail?: string;
}

// 에러 응답
export interface ChatErrorResponseDTO {
  success: false;
  message: string;
  errorCode: string;
}

// 🆕 모임 상태 변경 소켓 이벤트 DTO
export interface ReservationStatusChangedEventDTO {
  reservation_id: number;
  new_status: number; // 0: 모집중, 1: 모집마감, 2: 진행중, 3: 완료
  status_message: string; // "모집 마감", "진행 중" 등
  changed_by: string; // 변경한 사용자 ID (방장)
  timestamp: string; // 변경 시간
}

// 🆕 채팅방 참여자 DTO
export interface ParticipantDTO {
  user_id: string;           // 사용자 ID
  name: string;              // 사용자 이름
  email?: string;            // 이메일 (선택사항)
  profile_image?: string;    // 프로필 이미지 URL
  joined_at: string;         // 참여 시간 (ISO 8601)
  is_host: boolean;          // 방장 여부
  role: string;              // "방장" | "참가자"
  is_online: boolean;        // 온라인 상태
  last_seen?: string;        // 마지막 접속 시간
}

// 🆕 참여자 목록 조회 응답 DTO
export interface ChatParticipantsResponseDTO {
  success: boolean;
  message: string;
  data: {
    room_id: number;
    total_participants: number;
    participants: ParticipantDTO[];
  };
}

// 🆕 참여자 강퇴 요청 DTO
export interface KickParticipantRequestDTO {
  action: "kick";
  reason: string;
}

// 🆕 참여자 강퇴 응답 DTO
export interface KickParticipantResponseDTO {
  success: boolean;
  message: string;
  data: {
    kicked_user_id: string;
    kicked_user_name: string;
    remaining_participants: number;
    kicked_at: string;
  };
}

// 🆕 참여자 강퇴 소켓 이벤트 DTO
export interface ParticipantKickedEventDTO {
  room_id: number;
  kicked_user_id: string;
  kicked_user_name: string;
  kicked_by: string;
  remaining_participants: number;
  timestamp: string;
} 