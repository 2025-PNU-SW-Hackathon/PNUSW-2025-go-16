import apiClient from '../apiClient';
import type {
  CreateReservationRequestDTO,
  CreateReservationResponseDTO,
  JoinReservationResponseDTO,
  GetReservationsQueryDTO,
  GetReservationsResponseDTO,
  CancelReservationResponseDTO,
  GetReservationDetailResponseDTO,
  ErrorResponseDTO,
} from '../../types/DTO/reservations';

// POST /reservations - 모임 생성
export const createReservation = async (
  data: CreateReservationRequestDTO
): Promise<CreateReservationResponseDTO> => {
  const response = await apiClient.post<CreateReservationResponseDTO>(
    '/reservations',
    data
  );
  return response.data;
};

// POST /reservations/{reservation_id}/join - 모임 참여
export const joinReservation = async (
  reservationId: number
): Promise<JoinReservationResponseDTO> => {
  const response = await apiClient.post<JoinReservationResponseDTO>(
    `/reservations/${reservationId}/join`
  );
  return response.data;
};

// GET /reservations - 모임 조회
export const getReservations = async (
  queryParams?: GetReservationsQueryDTO
): Promise<GetReservationsResponseDTO> => {
  const response = await apiClient.get<GetReservationsResponseDTO>(
    '/reservations',
    {
      params: queryParams,
    }
  );
  return response.data;
};

// DELETE /reservations/{reservation_id} - 모임 취소
export const cancelReservation = async (
  reservationId: number
): Promise<CancelReservationResponseDTO> => {
  const response = await apiClient.delete<CancelReservationResponseDTO>(
    `/reservations/${reservationId}`
  );
  return response.data;
};

// GET /reservations/{reservation_id} - 모임 상세 조회
export const getReservationDetail = async (
  reservationId: number
): Promise<GetReservationDetailResponseDTO> => {
  const response = await apiClient.get<GetReservationDetailResponseDTO>(
    `/reservations/${reservationId}`
  );
  return response.data;
};
