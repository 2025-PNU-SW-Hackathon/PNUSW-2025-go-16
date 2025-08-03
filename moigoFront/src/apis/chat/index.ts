import apiClient from '../apiClient';
import type {
  GetChatRoomsResponseDTO,
  LeaveChatRoomResponseDTO,
  UpdateChatRoomStatusRequestDTO,
  UpdateChatRoomStatusResponseDTO,
  KickUserResponseDTO,
  GetChatMessagesResponseDTO,
  EnterChatRoomRequestDTO,
  EnterChatRoomResponseDTO,
} from '../../types/DTO/chat';

// GET /chat/rooms - 채팅방 목록 조회
export const getChatRooms = async (): Promise<GetChatRoomsResponseDTO> => {
  const response = await apiClient.get<GetChatRoomsResponseDTO>('/chat/rooms');
  return response.data;
};

// DELETE /chat/rooms/:roomId/leave - 채팅방 나가기
export const leaveChatRoom = async (roomId: number): Promise<LeaveChatRoomResponseDTO> => {
  const response = await apiClient.delete<LeaveChatRoomResponseDTO>(`/chat/rooms/${roomId}/leave`);
  return response.data;
};

// PATCH /chat/rooms/:roomId/status - 채팅방 상태 변경
export const updateChatRoomStatus = async (
  roomId: number,
  data: UpdateChatRoomStatusRequestDTO
): Promise<UpdateChatRoomStatusResponseDTO> => {
  const response = await apiClient.patch<UpdateChatRoomStatusResponseDTO>(
    `/chat/rooms/${roomId}/status`,
    data
  );
  return response.data;
};

// DELETE /chat/rooms/:roomId/kick/:userId - 채팅방 강퇴
export const kickUserFromChatRoom = async (
  roomId: number,
  userId: string
): Promise<KickUserResponseDTO> => {
  const response = await apiClient.delete<KickUserResponseDTO>(
    `/chat/rooms/${roomId}/kick/${userId}`
  );
  return response.data;
};

// GET /chat/rooms/:roomId/all-messages - 채팅방 전체 메시지 조회
export const getChatMessages = async (roomId: number): Promise<GetChatMessagesResponseDTO> => {
  const response = await apiClient.get<GetChatMessagesResponseDTO>(`/chat/rooms/${roomId}/all-messages`);
  return response.data;
};

// POST /chat/rooms/enter - 채팅방 입장
export const enterChatRoom = async (
  data: EnterChatRoomRequestDTO
): Promise<EnterChatRoomResponseDTO> => {
  const response = await apiClient.post<EnterChatRoomResponseDTO>('/chat/rooms/enter', data);
  return response.data;
}; 