import type { SelectedStoreDTO } from './stores';

// 채팅방 목록 조회 응답
export interface ChatRoomListResponseDTO {
  success: boolean;
  data: ChatRoomDTO[];
}

export interface ChatRoomDTO {
  // 🏠 기본 채팅방 정보
  chat_room_id: number;                    // 채팅방 ID (= reservation_id)
  name: string;                           // 채팅방 이름
  host_id: string;                        // 방장 사용자 ID
  reservation_status: number;             // 모집 상태 (0: 모집중, 1: 모집마감, 2: 진행중, 3: 완료)
  
  // 👥 참여자 정보
  reservation_participant_cnt: number;     // 현재 참여자 수
  reservation_max_participant_cnt: number; // 최대 참여자 수
  participant_info: string;               // 참여자 정보 문자열 ("4/6")
  
  // 📅 일정 정보
  reservation_start_time: string;         // 모임 시작 시간 (ISO 형식)
  reservation_match: string;              // 경기명
  reservation_title: string;              // 모임 제목 (reservation_bio)
  
  // 🏪 선택된 가게 정보
  selected_store_id?: string;
  selected_store_name?: string;
  selected_at?: string;                   // 가게 선택 시간
  selected_by?: string;                   // 가게 선택한 사용자
  selected_store?: {                      // 구조화된 가게 정보
    store_id: string;
    store_name: string;
    selected_at: string;
    selected_by: string;
  };
  
  // 💬 최근 메시지 정보
  last_message: string;                   // 최근 메시지 내용
  last_message_time: string;              // 최근 메시지 시간
  last_message_sender_id: string;         // 최근 메시지 보낸 사용자 ID
  sender_id: string;                      // 동일 (중복 필드)
  
  // 👑 사용자 역할 정보
  is_host: boolean;                       // 현재 사용자가 방장인지 여부
  user_role: string;                      // 사용자 역할 ("방장" 또는 "참가자")
  
  // 📊 상태 정보
  status_message: string;                 // 상태 메시지 ("모집 마감" 등)
  is_recruitment_closed: boolean;         // 모집 마감 여부
  match_name: string;                     // 경기명 (중복)
  
  // 💰 정산 정보
  payment_status: string;                 // 정산 상태 ("not_started", "in_progress", "completed")
  payment_progress?: string;              // 정산 진행률 ("2/4" 형태, 정산 중일 때만)
  
  // 추가 호환성 필드들
  match_title?: string;                   // 호환성을 위한 별칭
  unread_count?: number;                  // 읽지 않은 메시지 수 (클라이언트 계산)
}

// 채팅방 입장/생성 요청
export interface EnterChatRoomRequestDTO {
  group_id: number;
}

// 🆕 채팅방 정보 (서버에서 추가)
export interface ChatRoomInfoDTO {
  reservation_status: number; // 0: 모집중, 1: 마감, 2: 진행중, 3: 완료
  status_message: string; // "모집 중", "모집 마감" 등
  is_recruitment_closed: boolean; // 모집 마감 여부
  participant_count: number; // 현재 참여자 수
  max_participant_count: number; // 최대 참여자 수
  participant_info: string; // "3/8" 형태
  match_title: string; // 경기 제목
  reservation_start_time: string; // 모임 시작 시간
  host_id: string; // 방장 ID
  is_host: boolean; // 현재 사용자가 방장인지
  // 🆕 선택된 가게 정보
  selected_store?: SelectedStoreDTO | null; // 선택된 가게 정보
}

// 채팅방 입장/생성 응답
export interface EnterChatRoomResponseDTO {
  success: boolean;
  data: {
    reservation_id: number;
    message: string;
    // 🆕 서버에서 추가된 채팅방 정보
    room_info?: ChatRoomInfoDTO;
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
  store_id?: string;
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
  message_type?: 'system_join' | 'system_leave' | 'system_kick' | 'store_share' | 'system_payment_start' | 'system_payment_update' | 'system_payment_completed';
  user_name?: string;
  user_id?: string;
  kicked_by?: string;
  // 가게 공유 메시지 관련 필드
  store_id?: string;
  store_name?: string;
  store_address?: string;
  store_rating?: number;
  store_thumbnail?: string;
  // 🆕 정산 관련 필드
  payment_id?: string;
  payment_guide_data?: any; // PaymentGuideData 타입을 사용하면 순환 참조 문제가 발생할 수 있으므로 any 사용
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
    // 🆕 서버에서 추가된 채팅방 정보
    room_info?: ChatRoomInfoDTO;
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