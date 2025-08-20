import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreList, getStoreDetail, getChatStoreList, shareStore } from '@/apis/stores';
import type { StoreListRequestDTO, ChatStoreListRequestDTO } from '@/types/DTO/stores';

// 가게 목록 조회 훅
export const useStoreList = (params?: StoreListRequestDTO) => {
  return useQuery({
    queryKey: ['stores', 'list', params],
    queryFn: () => getStoreList(params),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 2, // 실패 시 2번 재시도
    retryDelay: 1000, // 재시도 간격 1초
  });
};

// 가게 상세 정보 조회 훅
export const useStoreDetail = (storeId: number) => {
  return useQuery({
    queryKey: ['stores', 'detail', storeId],
    queryFn: () => getStoreDetail(storeId),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 2, // 실패 시 2번 재시도
    retryDelay: 1000, // 재시도 간격 1초
  });
};

// 채팅용 가게 목록 조회 훅
export const useChatStoreList = (params?: ChatStoreListRequestDTO) => {
  return useQuery({
    queryKey: ['stores', 'chat-list', params],
    queryFn: () => getChatStoreList(params),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    retry: 1, // 실패 시 1번 재시도
    retryDelay: 500, // 재시도 간격 0.5초
  });
};

// 가게 공유 훅
export const useShareStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roomId, storeId }: { roomId: number; storeId: number }) => 
      shareStore(roomId, storeId),
    onSuccess: (data, variables) => {
      console.log('가게 공유 성공:', data);
      // 채팅 메시지 목록을 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.roomId] });
    },
    onError: (error) => {
      console.error('가게 공유 실패:', error);
    },
  });
};
