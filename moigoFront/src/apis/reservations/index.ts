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

// GET /api/v1/reservations - 예약 목록 조회
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
  const url = `/api/v1/reservations${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<ReservationResponseDTO>(url);
  return response.data;
};

// GET /api/v1/matches - 경기 목록 조회
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
  const url = `/api/v1/matches${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<MatchResponseDTO>(url);
  return response.data;
};

// GET /api/v1/matches/:match_id - 특정 경기 상세 정보 조회
export const getMatchDetail = async (
  matchId: number
): Promise<MatchDetailResponseDTO> => {
  const response = await apiClient.get<MatchDetailResponseDTO>(`/api/v1/matches/${matchId}`);
  return response.data;
};

// GET /api/v1/matches/:match_id/reservations - 경기별 모임 조회
export const getMatchReservations = async (
  matchId: number
): Promise<MatchReservationsResponseDTO> => {
  const response = await apiClient.get<MatchReservationsResponseDTO>(`/api/v1/matches/${matchId}/reservations`);
  return response.data;
};

// POST /api/v1/reservations - 모임 생성
export const createReservation = async (
  data: CreateReservationRequestDTO
): Promise<CreateReservationResponseDTO> => {
  const response = await apiClient.post<CreateReservationResponseDTO>('/api/v1/reservations', data);
  return response.data;
};
