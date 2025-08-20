import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatRooms,
  enterChatRoom,
  getChatMessages,
  leaveChatRoom,
  updateChatRoomStatus,
  kickUserFromChatRoom,
} from '@/apis/chat';
import type {
  ChatRoomListResponseDTO,
  ChatMessagesResponseDTO,
  EnterChatRoomRequestDTO,
  UpdateChatRoomStatusRequestDTO,
} from '@/types/DTO/chat';

// 채팅방 목록 조회
export const useChatRooms = () => {
  return useQuery<ChatRoomListResponseDTO>({
    queryKey: ['chatRooms'],
    queryFn: getChatRooms,
    staleTime: 30000, // 30초
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });
};

// 채팅방 메시지 조회
export const useChatMessages = (roomId: number) => {
  return useQuery<ChatMessagesResponseDTO>({
    queryKey: ['chatMessages', roomId],
    queryFn: () => getChatMessages(roomId),
    enabled: !!roomId,
    staleTime: 30000, // 30초로 증가
    refetchInterval: 30000, // 30초로 증가 (중복 요청 방지)
    retry: 1, // 재시도 횟수 제한
  });
};

// 채팅방 입장/생성
export const useEnterChatRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EnterChatRoomRequestDTO) => enterChatRoom(data),
    onSuccess: () => {
      // 채팅방 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

// 채팅방 나가기
export const useLeaveChatRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: () => {
      // 채팅방 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

// 채팅방 상태 변경
export const useUpdateChatRoomStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: UpdateChatRoomStatusRequestDTO }) =>
      updateChatRoomStatus(roomId, data),
    onSuccess: () => {
      // 채팅방 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

// 채팅방 유저 강퇴
export const useKickUserFromChatRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: string }) =>
      kickUserFromChatRoom(roomId, userId),
    onSuccess: () => {
      // 채팅방 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}; 