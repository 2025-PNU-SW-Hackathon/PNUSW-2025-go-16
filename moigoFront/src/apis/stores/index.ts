import apiClient from '../apiClient';
import type { 
  StoreListRequestDTO, 
  StoreListResponseDTO, 
  StoreDetailResponseDTO,
  ChatStoreListRequestDTO,
  ChatStoreListResponseDTO,
  ShareStoreRequestDTO,
  ShareStoreResponseDTO,
  SelectStoreRequestDTO,
  SelectStoreResponseDTO
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
    console.error('❌ 가게 목록 조회 API 에러:', error.message);
    
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
export const getStoreDetail = async (storeId: string): Promise<StoreDetailResponseDTO> => {
  // storeId 유효성 검사
  if (!storeId || storeId.trim().length === 0) {
    console.log('=== 가게 상세 정보 조회 API 에러 ===');
    console.log('유효하지 않은 storeId:', storeId, '타입:', typeof storeId);
    throw new Error('유효하지 않은 가게 ID입니다.');
  }
  
  const url = `/stores/${storeId}/detail`;
  
  console.log('=== 가게 상세 정보 조회 API 요청 ===');
  console.log('URL:', url);
  console.log('storeId:', storeId, '타입:', typeof storeId);
  
  try {
    const response = await apiClient.get<StoreDetailResponseDTO>(url);
    
    console.log('=== 가게 상세 정보 조회 API 응답 ===');
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', response.data);
    
    // API 응답 형식 확인
    if (response.data.success === false) {
      throw new Error(response.data.message || '가게 상세 정보 조회에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    console.log('=== 가게 상세 정보 조회 API 에러 ===');
    console.log('에러 타입:', error.constructor.name);
    console.log('에러 메시지:', error.message);
    console.log('응답 상태:', error.response?.status);
    console.log('응답 데이터:', error.response?.data);
    
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

// 채팅용 가게 리스트 조회
export const getChatStoreList = async (params?: ChatStoreListRequestDTO): Promise<ChatStoreListResponseDTO> => {
  const queryParams = new URLSearchParams();
  
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = queryString ? `/chats/stores?${queryString}` : '/chats/stores';
  
  try {
    const response = await apiClient.get<ChatStoreListResponseDTO>(url);
    
    // API 응답 형식 확인
    if (response.data.success === false) {
      throw new Error(response.data.message || '채팅용 가게 목록 조회에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ 채팅용 가게 목록 조회 API 에러:', error.message);
    
    if (error.response?.status === 404) {
      throw new Error('가게를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다.');
    } else {
      throw new Error(error.message || '채팅용 가게 목록 조회에 실패했습니다.');
    }
  }
};

// 가게 공유 기능
export const shareStore = async (roomId: number, storeId: string): Promise<ShareStoreResponseDTO> => {
  const url = `/chats/${roomId}/share-store`;
  
  console.log('=== 가게 공유 API 요청 ===');
  console.log('URL:', url);
  console.log('roomId:', roomId);
  console.log('storeId:', storeId);
  
  try {
    const response = await apiClient.post<ShareStoreResponseDTO>(url, {
      store_id: storeId
    });
    
    console.log('=== 가게 공유 API 응답 ===');
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', response.data);
    
    // API 응답 형식 확인
    if (response.data.success === false) {
      throw new Error(response.data.message || '가게 공유에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    console.log('=== 가게 공유 API 에러 ===');
    console.log('에러 타입:', error.constructor.name);
    console.log('에러 메시지:', error.message);
    console.log('응답 상태:', error.response?.status);
    console.log('응답 데이터:', error.response?.data);
    
    if (error.response?.status === 404) {
      throw new Error('채팅방을 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다.');
    } else {
      throw new Error(error.message || '가게 공유에 실패했습니다.');
    }
  }
};

// 🆕 가게 선택 기능 (방장만 가능)
export const selectStore = async (roomId: number, storeId: string | null): Promise<SelectStoreResponseDTO> => {
  const url = `/chats/${roomId}/store`;
  
  console.log('=== 가게 선택 API 요청 ===');
  console.log('URL:', url);
  console.log('roomId:', roomId);
  console.log('storeId:', storeId);
  
  try {
    const response = await apiClient.patch<SelectStoreResponseDTO>(url, {
      store_id: storeId
    });
    
    console.log('=== 가게 선택 API 응답 ===');
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', response.data);
    
    // API 응답 형식 확인
    if (response.data.success === false) {
      throw new Error(response.data.message || '가게 선택에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    console.log('=== 가게 선택 API 에러 ===');
    console.log('에러 타입:', error.constructor.name);
    console.log('에러 메시지:', error.message);
    console.log('응답 상태:', error.response?.status);
    console.log('응답 데이터:', error.response?.data);
    
    if (error.response?.status === 403) {
      throw new Error('방장만 가게를 선택할 수 있습니다.');
    } else if (error.response?.status === 404) {
      const errorData = error.response?.data;
      if (errorData?.error_code === 'STORE_NOT_FOUND') {
        throw new Error('존재하지 않는 가게입니다.');
      } else if (errorData?.error_code === 'CHAT_ROOM_NOT_FOUND') {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else {
        throw new Error('요청한 정보를 찾을 수 없습니다.');
      }
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다.');
    } else {
      throw new Error(error.message || '가게 선택에 실패했습니다.');
    }
  }
};
