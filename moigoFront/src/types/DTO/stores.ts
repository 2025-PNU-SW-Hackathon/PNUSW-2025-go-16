// 가게 목록 조회 요청 파라미터
export interface StoreListRequestDTO {
  region?: string;
  date?: string;
  category?: string;
  keyword?: string;
}

// 가게 목록 조회 응답
export interface StoreListResponseDTO {
  success: boolean;
  data: StoreListItemDTO[];
  message?: string;
}

// 가게 목록 아이템
export interface StoreListItemDTO {
  store_id: number;
  store_name: string;
  store_address: string;
  store_phonenumber: string;
  store_rating: number;
  store_thumbnail: string;
}

// 가게 상세 정보 조회 응답
export interface StoreDetailResponseDTO {
  success: boolean;
  data: StoreDetailDTO;
  message?: string;
}

// 가게 상세 정보
export interface StoreDetailDTO {
  store_id: number;
  store_name: string;
  store_address: string;
  store_bio: string;
  store_open_hour: string;
  store_close_hour: string;
  store_holiday: string;
  store_max_people_cnt: number;
  store_max_table_cnt: number;
  store_max_parking_cnt: number;
  store_max_screen_cnt: number;
  store_phonenumber: string;
  store_thumbnail: string;
  store_review_cnt: number;
  store_rating: number;
  bank_code: string;
  account_number: string;
  account_holder_name: string;
  business_number: string;
}

// 채팅용 가게 목록 조회 요청 파라미터
export interface ChatStoreListRequestDTO {
  keyword?: string;
  limit?: number;
}

// 채팅용 가게 목록 조회 응답
export interface ChatStoreListResponseDTO {
  success: boolean;
  data: ChatStoreListItemDTO[];
  message?: string;
}

// 채팅용 가게 목록 아이템
export interface ChatStoreListItemDTO {
  store_id: number;
  store_name: string;
  store_address: string;
  store_rating: number;
  store_thumbnail: string;
}

// 가게 공유 요청
export interface ShareStoreRequestDTO {
  store_id: number;
}

// 가게 공유 응답
export interface ShareStoreResponseDTO {
  success: boolean;
  message?: string;
}


