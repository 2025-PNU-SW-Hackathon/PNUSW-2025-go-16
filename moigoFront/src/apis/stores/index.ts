import apiClient from '../apiClient';
import type { 
  StoreListRequestDTO, 
  StoreListResponseDTO, 
  StoreDetailResponseDTO 
} from '@/types/DTO/stores';

// 가게 목록 조회
export const getStoreList = async (params?: StoreListRequestDTO): Promise<StoreListResponseDTO> => {
  const queryParams = new URLSearchParams();
  
  if (params?.region) queryParams.append('region', params.region);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/stores?${queryString}` : '/stores';
  
  try {
    const response = await apiClient.get<StoreListResponseDTO>(url);
    
    // API 응답 형식 확인
    if (response.data.success === false) {
      throw new Error(response.data.message || '가게 목록 조회에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('가게를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다.');
    } else {
      throw new Error(error.message || '가게 목록 조회에 실패했습니다.');
    }
  }
};

// 가게 상세 정보 조회
export const getStoreDetail = async (storeId: number): Promise<StoreDetailResponseDTO> => {
  try {
    const response = await apiClient.get<StoreDetailResponseDTO>(`/stores/${storeId}/detail`);
    
    // API 응답 형식 확인
    if (response.data.success === false) {
      throw new Error(response.data.message || '가게 상세 정보 조회에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('가게를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다.');
    } else {
      throw new Error(error.message || '가게 상세 정보 조회에 실패했습니다.');
    }
  }
};
