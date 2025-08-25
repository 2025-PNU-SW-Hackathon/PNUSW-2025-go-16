import apiClient from '../apiClient';
import type { 
  StartPaymentRequestDTO,
  StartPaymentResponseDTO,
  CompletePaymentRequestDTO,
  CompletePaymentResponseDTO,
  GetPaymentStatusResponseDTO
} from '@/types/DTO/payment';

// 정산 시작 (방장만 가능) - 서버에서 자동 계산
export const startPayment = async (roomId: number): Promise<StartPaymentResponseDTO> => {
  const url = `/chats/${roomId}/payment/start`;
  
  console.log('=== 정산 시작 API 요청 ===');
  console.log('URL:', url);
  console.log('roomId:', roomId);
  console.log('요청 데이터: 없음 (서버에서 자동 계산)');
  
  try {
    const response = await apiClient.post<StartPaymentResponseDTO>(url, {});
    
    console.log('=== 정산 시작 API 응답 ===');
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || '정산 시작에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    console.log('=== 정산 시작 API 에러 ===');
    console.log('에러 타입:', error.constructor.name);
    console.log('에러 메시지:', error.message);
    console.log('응답 상태:', error.response?.status);
    console.log('응답 데이터:', error.response?.data);
    
    if (error.response?.status === 403) {
      throw new Error('방장만 정산을 시작할 수 있습니다.');
    } else if (error.response?.status === 400) {
      const errorData = error.response?.data;
      if (errorData?.error_code === 'INVALID_CONDITIONS') {
        throw new Error('모집이 마감되고 가게가 선택된 후에만 정산을 시작할 수 있습니다.');
      } else if (errorData?.error_code === 'NO_DEPOSIT_AMOUNT') {
        throw new Error('가게에서 예약금이 설정되지 않았습니다. 가게에 문의해주세요.');
      } else {
        throw new Error('잘못된 요청입니다.');
      }
    } else if (error.response?.status === 409) {
      throw new Error('이미 정산이 진행 중입니다.');
    } else if (error.response?.status === 404) {
      throw new Error('채팅방을 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else {
      throw new Error(error.message || '정산 시작에 실패했습니다.');
    }
  }
};

// 개별 입금 완료
export const completePayment = async (roomId: number, data: CompletePaymentRequestDTO): Promise<CompletePaymentResponseDTO> => {
  const url = `/chats/${roomId}/payment/complete`;
  
  console.log('=== 입금 완료 API 요청 ===');
  console.log('URL:', url);
  console.log('roomId:', roomId);
  console.log('payment_method:', data.payment_method);
  
  try {
    const response = await apiClient.post<CompletePaymentResponseDTO>(url, data);
    
    console.log('=== 입금 완료 API 응답 ===');
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || '입금 완료 처리에 실패했습니다.');
    }
    
    return response.data;
  } catch (error: any) {
    console.log('=== 입금 완료 API 에러 ===');
    console.log('에러 타입:', error.constructor.name);
    console.log('에러 메시지:', error.message);
    console.log('응답 상태:', error.response?.status);
    console.log('응답 데이터:', error.response?.data);
    
    if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다.');
    } else if (error.response?.status === 404) {
      throw new Error('정산 정보를 찾을 수 없습니다.');
    } else if (error.response?.status === 409) {
      throw new Error('이미 입금이 완료되었습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else {
      throw new Error(error.message || '입금 완료 처리에 실패했습니다.');
    }
  }
};

// 정산 상태 조회
export const getPaymentStatus = async (roomId: number): Promise<GetPaymentStatusResponseDTO> => {
  const url = `/chats/${roomId}/payment`;
  
  console.log('=== 정산 상태 조회 API 요청 ===');
  console.log('URL:', url);
  console.log('roomId:', roomId);
  
  try {
    const response = await apiClient.get<GetPaymentStatusResponseDTO>(url);
    
    console.log('=== 정산 상태 조회 API 응답 ===');
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', response.data);
    console.log('응답 데이터 타입:', typeof response.data.data);
    console.log('응답 데이터 키들:', response.data.data ? Object.keys(response.data.data) : 'null');
    
    if (response.data.success === false) {
      throw new Error('정산 상태 조회에 실패했습니다.');
    }
    
    // ✅ 서버가 올바른 응답을 보내고 있음 - 구 버전 처리 코드 제거됨
    
    return response.data;
  } catch (error: any) {
    console.log('=== 정산 상태 조회 API 에러 ===');
    console.log('에러 타입:', error.constructor.name);
    console.log('에러 메시지:', error.message);
    console.log('응답 상태:', error.response?.status);
    console.log('응답 데이터:', error.response?.data);
    
    if (error.response?.status === 404) {
      // 정산이 시작되지 않은 경우는 에러가 아님
      return {
        success: true,
        data: {
          payment_status: 'not_started',
          message: '정산이 시작되지 않았습니다.'
        }
      };
    } else if (error.response?.status === 500) {
      throw new Error('서버 내부 오류가 발생했습니다.');
    } else {
      throw new Error(error.message || '정산 상태 조회에 실패했습니다.');
    }
  }
};


