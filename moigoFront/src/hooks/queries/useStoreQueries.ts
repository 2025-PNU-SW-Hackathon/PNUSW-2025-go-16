import { useQuery } from '@tanstack/react-query';
import { getStoreList, getStoreDetail } from '@/apis/stores';
import type { StoreListRequestDTO } from '@/types/DTO/stores';

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
