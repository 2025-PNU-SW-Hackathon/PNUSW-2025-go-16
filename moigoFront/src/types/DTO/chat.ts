// 채팅방 정보 DTO
export interface ChatRoomDTO {
  chat_room_id: number;
  chat_room_name: string;
  last_message: string;
  last_message_time: string; // ISO 8601 형식
}

// 채팅방 목록 조회 응답 DTO
export interface GetChatRoomsResponseDTO {
  success: boolean;
  data: ChatRoomDTO[];
}

// 채팅방 나가기 응답 DTO
export interface LeaveChatRoomResponseDTO {
  success: boolean;
  message: string;
}

// 채팅방 상태 변경 요청 DTO
export interface UpdateChatRoomStatusRequestDTO {
  status: number;
}

// 채팅방 상태 변경 응답 DTO
export interface UpdateChatRoomStatusResponseDTO {
  success: boolean;
  message: string;
}

// 채팅방 강퇴 응답 DTO
export interface KickUserResponseDTO {
  success: boolean;
  message: string;
}

// 사용자 프로필 정보 DTO
export interface UserProfileDTO {
  user_id: string;
  nickname: string;
  profile_image_url: string;
}

// 사용자 정보 조회 응답 DTO
export interface GetUserProfileResponseDTO {
  success: boolean;
  data: UserProfileDTO;
}

// 채팅 메시지 DTO
export interface ChatMessageDTO {
  message_id: number;
  sender_id: number;
  message: string;
  created_at: string; // ISO 8601 형식
  read_count: number;
}

// 채팅방 메시지 조회 응답 DTO
export interface GetChatMessagesResponseDTO {
  success: boolean;
  data: ChatMessageDTO[];
}

// 채팅방 입장 요청 DTO
export interface EnterChatRoomRequestDTO {
  group_id: number;
}

// 채팅방 입장 응답 DTO
export interface EnterChatRoomResponseDTO {
  success: boolean;
  data: {
    chat_room_id: number;
    message: string;
  };
} 