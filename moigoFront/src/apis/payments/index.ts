import apiClient from '../apiClient';
import type {
  RequestPaymentRequestDTO,
  RequestPaymentResponseDTO,
  InitiatePaymentRequestDTO,
  InitiatePaymentResponseDTO,
  PaymentCallbackRequestDTO,
  PaymentCallbackResponseDTO,
  ReservationApprovalRequestDTO,
  ReservationApprovalResponseDTO,
  PaymentStatusResponseDTO,
  KickParticipantResponseDTO,
} from '../../types/DTO/payments';

// POST /chat/rooms/{roomId}/payments/request - 예약금 결제 요청
export const requestPayment = async (
  roomId: number,
  data: RequestPaymentRequestDTO
): Promise<RequestPaymentResponseDTO> => {
  const response = await apiClient.post<RequestPaymentResponseDTO>(
    `/chat/rooms/${roomId}/payments/request`,
    data
  );
  return response.data;
};

// POST /chat/rooms/{roomId}/payments/initiate - 결제 시작
export const initiatePayment = async (
  roomId: number,
  data: InitiatePaymentRequestDTO
): Promise<InitiatePaymentResponseDTO> => {
  const response = await apiClient.post<InitiatePaymentResponseDTO>(
    `/chat/rooms/${roomId}/payments/initiate`,
    data
  );
  return response.data;
};

// POST /api/payments/callback - 결제 결과 콜백
export const paymentCallback = async (
  data: PaymentCallbackRequestDTO
): Promise<PaymentCallbackResponseDTO> => {
  const response = await apiClient.post<PaymentCallbackResponseDTO>(
    '/api/payments/callback',
    data
  );
  return response.data;
};

// POST /api/reservations/{reservationId}/approval - 예약 승인/거절
export const approveReservation = async (
  reservationId: number,
  data: ReservationApprovalRequestDTO
): Promise<ReservationApprovalResponseDTO> => {
  const response = await apiClient.post<ReservationApprovalResponseDTO>(
    `/api/reservations/${reservationId}/approval`,
    data
  );
  return response.data;
};

// GET /chat/rooms/{roomId}/payments/status - 결제 현황 조회
export const getPaymentStatus = async (roomId: number): Promise<PaymentStatusResponseDTO> => {
  const response = await apiClient.get<PaymentStatusResponseDTO>(
    `/chat/rooms/${roomId}/payments/status`
  );
  return response.data;
};

// DELETE /chat/rooms/{roomId}/participants/{userId} - 결제 미완료 참가자 강퇴
export const kickParticipant = async (
  roomId: number,
  userId: string
): Promise<KickParticipantResponseDTO> => {
  const response = await apiClient.delete<KickParticipantResponseDTO>(
    `/chat/rooms/${roomId}/participants/${userId}`
  );
  return response.data;
}; 