import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatRooms,
  leaveChatRoom,
  updateChatRoomStatus,
  kickUserFromChatRoom,
  getChatMessages,
  enterChatRoom,
} from '../../apis/chat';
import type { UpdateChatRoomStatusRequestDTO, EnterChatRoomRequestDTO } from '../../types/DTO/chat';

// GET /chat/rooms - 채팅방 목록 조회 훅
export const useGetChatRooms = () => {
  return useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => getChatRooms(),
    staleTime: 1 * 60 * 1000, // 1분 (채팅방 목록은 자주 변경될 수 있음)
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// GET /chat/rooms/:roomId/all-messages - 채팅방 메시지 조회 훅
export const useGetChatMessages = (roomId: number) => {
  return useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => getChatMessages(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30초 (메시지는 자주 업데이트됨)
    gcTime: 2 * 60 * 1000, // 2분
  });
};

// DELETE /chat/rooms/:roomId/leave - 채팅방 나가기 훅
export const useLeaveChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: () => {
      // 채팅방 나가기 성공 시 채팅방 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
    onError: (error) => {
      console.error('채팅방 나가기 실패:', error);
    },
  });
};

// PATCH /chat/rooms/:roomId/status - 채팅방 상태 변경 훅
export const useUpdateChatRoomStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: UpdateChatRoomStatusRequestDTO }) =>
      updateChatRoomStatus(roomId, data),
    onSuccess: () => {
      // 채팅방 상태 변경 성공 시 채팅방 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
    onError: (error) => {
      console.error('채팅방 상태 변경 실패:', error);
    },
  });
};

// DELETE /chat/rooms/:roomId/kick/:userId - 채팅방 강퇴 훅
export const useKickUserFromChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: string }) =>
      kickUserFromChatRoom(roomId, userId),
    onSuccess: () => {
      // 강퇴 성공 시 채팅방 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
    onError: (error) => {
      console.error('채팅방 강퇴 실패:', error);
    },
  });
};

// POST /chat/rooms/enter - 채팅방 입장 훅
export const useEnterChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnterChatRoomRequestDTO) => enterChatRoom(data),
    onSuccess: () => {
      // 채팅방 입장 성공 시 채팅방 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
    onError: (error) => {
      console.error('채팅방 입장 실패:', error);
    },
  });
}; 