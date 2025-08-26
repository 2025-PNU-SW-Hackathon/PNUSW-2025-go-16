import apiClient from '../apiClient';
import type {
  ReservationQueryDTO,
  ReservationResponseDTO,
  ReservationErrorResponseDTO,
  CreateReservationRequestDTO,
  CreateReservationResponseDTO,
  MatchQueryDTO,
  MatchResponseDTO,
  MatchDetailResponseDTO,
  MatchReservationsResponseDTO,
  MatchReservationDTO,
} from '../../types/DTO/reservations';

// GET /reservations - 예약 목록 조회
export const getReservations = async (
  query?: ReservationQueryDTO
): Promise<ReservationResponseDTO> => {
  // 쿼리 파라미터를 URL 쿼리스트링으로 변환
  const queryParams = new URLSearchParams();
  
  if (query?.region) {
    queryParams.append('region', query.region);
  }
  if (query?.date) {
    queryParams.append('date', query.date);
  }
  if (query?.category) {
    queryParams.append('category', query.category);
  }
  if (query?.keyword) {
    queryParams.append('keyword', query.keyword);
  }

  const queryString = queryParams.toString();
  const url = `/reservations${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<ReservationResponseDTO>(url);
  return response.data;
};

// GET /matches - 경기 목록 조회
export const getMatches = async (
  query?: MatchQueryDTO
): Promise<MatchResponseDTO> => {
  // 쿼리 파라미터를 URL 쿼리스트링으로 변환
  const queryParams = new URLSearchParams();
  
  if (query?.date) {
    queryParams.append('date', query.date);
  }
  if (query?.competition) {
    queryParams.append('competition', query.competition);
  }
  if (query?.status) {
    queryParams.append('status', query.status);
  }

  const queryString = queryParams.toString();
  const url = `/matches${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<MatchResponseDTO>(url);
  return response.data;
};

// GET /matches/:match_id - 특정 경기 상세 정보 조회
export const getMatchDetail = async (
  matchId: number
): Promise<MatchDetailResponseDTO> => {
  const response = await apiClient.get<MatchDetailResponseDTO>(`/matches/${matchId}`);
  return response.data;
};

// GET /matches/:match_id/reservations - 경기별 모임 조회
export const getMatchReservations = async (
  matchId: number
): Promise<MatchReservationsResponseDTO> => {
  const response = await apiClient.get<MatchReservationsResponseDTO>(`/matches/${matchId}/reservations`);
  return response.data;
};

// POST /reservations - 모임 생성
export const createReservation = async (
  data: CreateReservationRequestDTO
): Promise<CreateReservationResponseDTO> => {
  const response = await apiClient.post<CreateReservationResponseDTO>('/reservations', data);
  return response.data;
};

// POST /reservations/{reservation_id}/join - 모임 참여
export const joinReservation = async (
  reservationId: number
): Promise<{ success: boolean; message: string; participant_cnt: number }> => {
  const response = await apiClient.post(`/reservations/${reservationId}/join`);
  return response.data;
};
