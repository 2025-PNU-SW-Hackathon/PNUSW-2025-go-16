import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatRooms,
  enterChatRoom,
  getChatMessages,
  getChatRoomDetail,
  kickUserFromChatRoom,
} from '@/apis/chat';
import type {
  ChatRoomListResponseDTO,
  ChatMessagesResponseDTO,
  EnterChatRoomRequestDTO,
} from '@/types/DTO/chat';

// 채팅방 목록 조회 (polling 최적화)
export const useChatRooms = (enablePolling = true) => {
  return useQuery<ChatRoomListResponseDTO>({
    queryKey: ['chatRooms'],
    queryFn: getChatRooms,
    staleTime: 60000, // 1분으로 증가
    refetchInterval: enablePolling ? 60000 : false, // 조건부 polling
    refetchOnWindowFocus: false, // 포커스 시 자동 새로고침 비활성화
  });
};

// 채팅방 메시지 조회 (실시간 소켓 사용 시 polling 최소화)
export const useChatMessages = (roomId: number, enablePolling = false) => {
  return useQuery<ChatMessagesResponseDTO>({
    queryKey: ['chatMessages', roomId],
    queryFn: () => getChatMessages(roomId),
    enabled: !!roomId,
    staleTime: 300000, // 5분으로 증가 (소켓으로 실시간 처리하므로)
    refetchInterval: enablePolling ? 60000 : false, // 소켓 비활성화 시에만 1분마다 폴링
    retry: 1, // 재시도 횟수 제한
    refetchOnWindowFocus: false, // 포커스 시 자동 새로고침 비활성화
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

// 🆕 채팅방 상세 정보 조회
export const useChatRoomDetail = (roomId: number) => {
  return useQuery({
    queryKey: ['chatRoomDetail', roomId],
    queryFn: () => getChatRoomDetail(roomId),
    enabled: !!roomId,
    staleTime: 30000, // 30초
    refetchOnWindowFocus: false,
  });
}; 