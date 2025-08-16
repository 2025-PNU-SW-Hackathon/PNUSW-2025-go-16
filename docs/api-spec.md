# 🏪 모이GO API 명세서

## 📋 목차
1. [사용자 인증](#사용자-인증)
2. [매장 관리](#매장-관리)
3. [예약 시스템](#예약-시스템)
4. [결제 시스템](#결제-시스템)
5. [채팅 시스템](#채팅-시스템)
6. [사용자 관리](#사용자-관리)
7. [리뷰 시스템](#리뷰-시스템)
8. [경기 정보 조회](#경기-정보-조회-api-명세서)

---

## 🔐 사용자 인증

### 1.1 일반 사용자 회원가입
- **URL**: `POST /api/v1/users/register`
- **설명**: 새로운 사용자를 등록합니다.
- **Request Body**:
```json
{
  "user_id": "testuser123",
  "user_pwd": "password123",
  "user_email": "test@example.com",
  "user_name": "홍길동",
  "user_phone_number": "010-1234-5678",
  "user_region": "서울",
  "user_gender": 1
}
```
- **Response**:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user_id": "testuser123",
    "user_name": "홍길동"
  }
}
```

### 1.2 일반 사용자 로그인
- **URL**: `POST /api/v1/users/login`
- **설명**: 사용자 로그인을 수행합니다.
- **Request Body**:
```json
{
  "user_id": "testuser123",
  "user_pwd": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "testuser123",
      "user_name": "홍길동"
    }
  }
}
```

### **1.3 사장님 회원가입 (2단계)**

#### **1단계: 기본 회원가입**
- **URL**: `POST /users/store/register/basic`
- **Request Body**:JSON
    
    ```tsx
    {
      "store_id": "store_123",
      "store_pwd": "storepass123",
      "email": "store@example.com",
      "store_phonenumber": "02-1234-5678"
    }
    ```
    
- **Response**:JSON
    
    ```tsx
    {
      "success": true,
      "message": "기본 회원가입이 완료되었습니다. 사업자 정보를 입력해주세요.",
      "data": {
        "store_id": "store_123",
        "business_registration_status": "pending"
      }
    }
    ```

#### **2단계: 사업자 정보 등록**
- **URL**: `POST /users/store/{storeId}/business-registration`
- **Request Body**:JSON
    
    ```tsx
    {
      "store_name": "챔피언 스포츠 펍",
      "owner_name": "김성훈",
      "business_number": "123-45-67890",
      "postal_code": "06123",
      "store_address": "서울특별시 강남구 강남대로 123길 45",
      "address_detail": "2층 201호",
      "business_certificate_url": "https://example.com/cert.pdf"
    }
    ```
    
- **Response**:JSON
    
    ```tsx
    {
      "success": true,
      "message": "사업자 등록이 완료되었습니다. 로그인해주세요.",
      "data": {
        "store_id": "store_123",
        "business_registration_status": "completed"
      }
    }
    ```

#### **사업자 등록 상태 확인**
- **URL**: `GET /users/store/{storeId}/business-registration/status`
- **Response**:JSON
    
    ```tsx
    {
      "success": true,
      "data": {
        "business_registration_status": "pending",
        "store_name": "새로운 매장",
        "owner_name": "사장님",
        "business_number": "000-00-00000",
        "postal_code": "00000",
        "store_address": "주소 미입력",
        "address_detail": "상세주소 미입력",
        "business_certificate_url": null,
        "registration_completed_at": null
      }
    }
    ```

### 1.4 사장님 로그인
- **URL**: `POST /api/v1/users/store/login`
- **설명**: 매장 로그인을 수행합니다.
- **Request Body**:
```json
{
  "store_id": "store_123",
  "store_pwd": "storepass123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "사장님 로그인 성공",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "store": {
      "store_id": "store_123",
      "store_name": "챔피언 스포츠 펍",
      "business_number": "123-45-67890",
      "store_address": "서울시 강남구 역삼동 123-45"
    }
  }
}
```

---

## 🏪 매장 관리

### 2.1 매장 목록 조회
- **URL**: `GET /api/v1/stores`
- **설명**: 필터링 조건에 따라 매장 목록을 조회합니다.
- **Query Parameters**:
  - `region`: 지역 검색 (예: "부산")
  - `date`: 날짜 필터 (예: "2025-07-28")
  - `category`: 스포츠 카테고리 필터 (예: 3)
  - `keyword`: 키워드 검색 (예: "영화, 치킨")
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "store_id": "store_123",
      "store_name": "챔피언 스포츠 펍",
      "store_address": "서울특별시 강남구 역삼동",
      "store_phonenumber": "02-1234-5678",
      "store_rating": 4.5,
      "store_thumbnail": "https://example.com/images/store1.jpg"
    }
  ]
}
```

### 2.2 매장 상세 정보 조회
- **URL**: `GET /api/v1/stores/{storeId}/detail`
- **설명**: 특정 매장의 상세 정보를 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": {
    "store_id": "store_123",
    "store_name": "챔피언 스포츠 펍",
    "store_address": "서울시 강남구 역삼동 123-45",
    "store_bio": "강남역 근처에 위치한 스포츠 전문 바입니다.",
    "store_phonenumber": "02-1234-5678",
    "store_rating": 4.5,
    "store_thumbnail": "https://example.com/images/store1.jpg"
  }
}
```

### 2.3 🆕 매장 정보 조회 (사장님 전용)
- **URL**: `GET /api/v1/stores/me`
- **설명**: 사장님의 가게에 대한 모든 설정 정보를 한 번에 불러옵니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "store_info": {
      "store_name": "챔피언 스포츠 펍",
      "store_address": "강남역 2번 출구 도보 3분",
      "address_detail": "상세 주소",
      "store_phonenumber": "02-1234-5678",
      "business_number": "123-45-67890",
      "owner_name": "김철수",
      "email": "sportsclub@example.com",
      "postal_code": "06123",
      "bio": "강남역 근처에 위치한 스포츠 전문 바입니다.",
      "menu": [
        { "name": "치킨 세트", "price": 28000, "description": "바삭한 치킨..." },
        { "name": "수제 맥주 세트", "price": 25000, "description": "프리미엄 수제 맥주..." }
      ],
      "facilities": {
        "wifi": true, "parking": true, "restroom": true, "no_smoking": true,
        "sound_system": true, "private_room": false, "tv_screen": true, "booth_seating": true
      },
      "photos": [
        "https://cdn.example.com/photos/store1.jpg",
        "https://cdn.example.com/photos/store2.jpg"
      ],
      "sports_categories": ["축구", "야구", "농구"]
    },
    "reservation_settings": {
      "cancellation_policy": "취소/환불 규정",
      "deposit_amount": 5000,
      "min_participants": 2,
      "max_participants": 50,
      "available_times": [
        { "day": "MON", "start": "18:00", "end": "24:00" },
        { "day": "TUE", "start": "18:00", "end": "24:00" },
        { "day": "WED", "start": "18:00", "end": "24:00" },
        { "day": "THU", "start": "18:00", "end": "24:00" },
        { "day": "FRI", "start": "18:00", "end": "24:00" },
        { "day": "SAT", "start": "12:00", "end": "24:00" },
        { "day": "SUN", "start": "12:00", "end": "22:00" }
      ]
    },
    "notification_settings": {
      "reservation_alerts": true,
      "payment_alerts": true,
      "system_alerts": true,
      "marketing_alerts": false
    },
    "payment_info": {
      "bank_account_number": "123-456-7890",
      "bank_name": "국민은행"
    }
  }
}
```

### 2.4 🆕 매장 기본 정보 수정 (사장님 전용)
- **URL**: `PUT /api/v1/stores/me/basic-info`
- **설명**: 매장의 기본 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "store_name": "챔피언 스포츠 펍",
  "store_address": "강남역 2번 출구 도보 3분",
  "store_phonenumber": "02-1234-5678",
  "business_number": "123-45-67890",
  "owner_name": "김철수",
  "postal_code": "06123",
  "bio": "강남역 근처에 위치한 스포츠 전문 바입니다."
}
```

#### 필수 필드:
- `store_name`: 상호명
- `store_address`: 사업자 주소
- `store_phonenumber`: 연락처
- `business_number`: 사업자 등록번호
- `owner_name`: 대표자명
- `postal_code`: 우편번호

#### 선택 필드:
- `bio`: 매장 소개

- **Response**:
```json
{
  "success": true,
  "message": "매장 기본 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "store_name": "챔피언 스포츠 펍",
    "store_address": "강남역 2번 출구 도보 3분",
    "store_phonenumber": "02-1234-5678",
    "business_number": "123-45-67890",
    "owner_name": "김철수",
    "postal_code": "06123",
    "bio": "강남역 근처에 위치한 스포츠 전문 바입니다."
  }
}
```

### 2.5 🆕 매장 상세 정보 수정 (사장님 전용)
- **URL**: `PUT /api/v1/stores/me/details`
- **설명**: 매장의 상세 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "menu": [
    { "name": "치킨 세트", "price": 28000, "description": "바삭한 치킨..." }
  ],
  "facilities": {
    "wifi": true, "parking": true, "restroom": true, "no_smoking": true
  },
  "photos": [
    "https://cdn.example.com/photos/store1.jpg",
    "https://cdn.example.com/photos/store2.jpg"
  ],
  "sports_categories": ["축구", "농구"],
  "bio": "강남역 근처에 위치한 스포츠 전문 바입니다."
}
```
- **Response**:
```json
{
  "success": true,
  "message": "매장 상세 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "menu": [...],
    "facilities": {...},
    "photos": [...],
    "sports_categories": [...],
    "bio": "강남역 근처에 위치한 스포츠 전문 바입니다."
  }
}
```

### 2.6 🆕 예약 설정 조회 (사장님 전용)
- **URL**: `GET /api/v1/stores/me/settings/reservation`
- **설명**: 매장의 예약 설정을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "예약 설정 조회가 성공적으로 완료되었습니다.",
  "data": {
    "cancellation_policy": "취소/환불 규정",
    "deposit_amount": 5000,
    "min_participants": 2,
    "max_participants": 50,
    "available_times": [
      { "day": "MON", "start": "09:00", "end": "22:00" },
      { "day": "TUE", "start": "09:00", "end": "22:00" },
      { "day": "WED", "start": "09:00", "end": "22:00" },
      { "day": "THU", "start": "09:00", "end": "22:00" },
      { "day": "FRI", "start": "09:00", "end": "22:00" },
      { "day": "SAT", "start": "09:00", "end": "22:00" },
      { "day": "SUN", "start": "09:00", "end": "22:00" }
    ]
  }
}
```

### 2.7 🆕 예약 설정 수정 (사장님 전용)
- **URL**: `PUT /api/v1/stores/me/settings/reservation`
- **설명**: 매장의 예약 설정을 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "cancellation_policy": "새로운 취소/환불 규정",
  "deposit_amount": 10000,
  "min_participants": 2,
  "max_participants": 50,
  "available_times": [
    { "day": "MON", "start": "18:00", "end": "24:00" },
    { "day": "TUE", "start": "18:00", "end": "24:00" },
    { "day": "WED", "start": "18:00", "end": "24:00" },
    { "day": "THU", "start": "18:00", "end": "24:00" },
    { "day": "FRI", "start": "18:00", "end": "24:00" },
    { "day": "SAT", "start": "12:00", "end": "24:00" },
    { "day": "SUN", "start": "12:00", "end": "22:00" }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "예약 설정이 성공적으로 수정되었습니다.",
  "data": {
    "cancellation_policy": "새로운 취소/환불 규정",
    "deposit_amount": 10000,
    "min_participants": 2,
    "max_participants": 50,
    "available_times": [
      { "day": "MON", "start": "18:00", "end": "24:00" },
      { "day": "TUE", "start": "18:00", "end": "24:00" },
      { "day": "WED", "start": "18:00", "end": "24:00" },
      { "day": "THU", "start": "18:00", "end": "24:00" },
      { "day": "FRI", "start": "18:00", "end": "24:00" },
      { "day": "SAT", "start": "12:00", "end": "24:00" },
      { "day": "SUN", "start": "12:00", "end": "22:00" }
    ]
  }
}
```

- **Response**:
```json
{
  "success": true,
  "message": "예약 설정이 성공적으로 수정되었습니다.",
  "data": {
    "store_id": "sehan",
    "cancellation_policy": "새로운 취소/환불 규정",
    "deposit_amount": 10000,
    "min_participants": 2,
    "max_participants": 50,
    "available_times": [
      { "day": "MON", "start": "18:00", "end": "24:00" },
      { "day": "TUE", "start": "18:00", "end": "24:00" },
      { "day": "WED", "start": "18:00", "end": "24:00" },
      { "day": "THU", "start": "18:00", "end": "24:00" },
      { "day": "FRI", "start": "18:00", "end": "24:00" },
      { "day": "SAT", "start": "12:00", "end": "24:00" },
      { "day": "SUN", "start": "12:00", "end": "22:00" }
    ]
  }
}
```

### 2.8 매장 결제 정보 조회
- **URL**: `GET /api/v1/stores/{storeId}/payment-info`
- **설명**: 특정 매장의 결제 정보를 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": {
    "store_id": "store_123",
    "bank_code": "004",
    "account_number": "123-456-7890",
    "account_holder_name": "김철수",
    "business_number": "123-45-67890"
  }
}
```

### 2.9 매장 결제 정보 수정
- **URL**: `PUT /api/v1/stores/{storeId}/payment-info`
- **설명**: 특정 매장의 결제 정보를 수정합니다.
- **Request Body**:
```json
{
  "bank_code": "004",
  "account_number": "123-456-7890",
  "account_holder_name": "김철수",
  "business_number": "123-45-67890"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "결제 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "bank_code": "004",
    "account_number": "123-456-7890",
    "account_holder_name": "김철수",
    "business_number": "123-45-67890"
  }
}
```

### 2.10 🆕 사장님 대시보드 현황 조회 (사장님 전용)
- **URL**: `GET /api/v1/stores/me/dashboard`
- **설명**: 사장님의 매장 대시보드 현황을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "today_reservations": 5,
    "weekly_reservations": 23,
    "monthly_revenue": 1500000,
    "pending_approvals": 3
  }
}
```

### 2.11 🆕 사장님 예약 목록 조회 (사장님 전용)
- **URL**: `GET /api/v1/stores/me/reservations`
- **설명**: 사장님 매장의 예약 목록을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 1,
      "user_name": "홍길동",
      "reservation_date": "2025-01-20",
      "reservation_time": "19:00-21:00",
      "status": "confirmed",
      "participants": 4
    }
  ]
}
```

### 2.12 🆕 스포츠 카테고리 삭제 (사장님 전용)
- **URL**: `DELETE /api/v1/stores/me/sports-categories/{category_name}`
- **설명**: 매장의 특정 스포츠 카테고리를 삭제합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "스포츠 카테고리가 삭제되었습니다."
}
```

### 2.13 🆕 사업자 정보 수정 (사장님 전용)
- **URL**: `PUT /api/v1/stores/me/business-info`
- **설명**: 매장의 사업자 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "store_name": "챔피언 스포츠 펍",
  "owner_name": "김철수",
  "business_number": "123-45-67890",
  "postal_code": "06123",
  "store_address": "강남역 2번 출구 도보 3분",
  "address_detail": "상세 주소",
  "business_certificate_url": "https://example.com/cert.pdf"
}
```

#### 필수 필드:
- `store_name`: 상호명
- `owner_name`: 대표자명
- `business_number`: 사업자 등록번호
- `postal_code`: 우편번호
- `store_address`: 사업자 주소

#### 선택 필드:
- `address_detail`: 상세주소
- `business_certificate_url`: 사업자등록증 URL

- **Response**:
```json
{
  "success": true,
  "message": "사업자 정보가 수정되었습니다.",
  "data": {
    "store_id": "store_123",
    "store_name": "챔피언 스포츠 펍",
    "owner_name": "김철수",
    "business_number": "123-45-67890",
    "postal_code": "06123",
    "store_address": "강남역 2번 출구 도보 3분",
    "address_detail": "상세 주소",
    "business_certificate_url": "https://example.com/cert.pdf"
  }
}
```

### 2.14 🆕 매장 회원 탈퇴 (사장님 전용)
- **URL**: `DELETE /api/v1/stores/me`
- **설명**: 매장 계정을 탈퇴합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "매장 계정이 탈퇴되었습니다."
}
```

### 2.15 🆕 편의시설 관리 (사장님 전용)

#### 편의시설 목록 조회
- **URL**: `GET /api/v1/stores/me/facilities`
- **설명**: 매장의 편의시설 목록을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "facility_type": "wifi",
      "facility_name": "WiFi",
      "is_available": 1,
      "created_at": "2025-08-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "facility_type": "parking",
      "facility_name": "주차장",
      "is_available": 1,
      "created_at": "2025-08-15T10:00:00.000Z"
    },
    {
      "id": 3,
      "facility_type": "tv_screen",
      "facility_name": "TV/스크린",
      "is_available": 1,
      "created_at": "2025-08-15T10:00:00.000Z"
    },
    {
      "id": 4,
      "facility_type": "smoking_area",
      "facility_name": "흡연구역",
      "is_available": 0,
      "created_at": "2025-08-15T10:00:00.000Z"
    }
  ]
}
```

#### 편의시설 추가
- **URL**: `POST /api/v1/stores/me/facilities`
- **설명**: 새로운 편의시설을 추가합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "facility_type": "wireless_charging",
  "facility_name": "무선충전"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "편의시설이 추가되었습니다.",
  "data": {
    "id": 5,
    "facility_type": "wireless_charging",
    "facility_name": "무선충전",
    "is_available": 1,
    "created_at": "2025-08-15T10:00:00.000Z"
  }
}
```

#### 편의시설 수정
- **URL**: `PUT /api/v1/stores/me/facilities/{facility_id}`
- **설명**: 기존 편의시설 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "facility_type": "tv_screen",
  "facility_name": "대형 TV/스크린",
  "is_available": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "편의시설이 수정되었습니다.",
  "data": {
    "id": 3,
    "facility_type": "tv_screen",
    "facility_name": "대형 TV/스크린",
    "is_available": 1,
    "created_at": "2025-08-15T10:00:00.000Z"
  }
}
```

#### 편의시설 삭제
- **URL**: `DELETE /api/v1/stores/me/facilities/{facility_id}`
- **설명**: 특정 편의시설을 삭제합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "편의시설이 삭제되었습니다."
}
```

#### 편의시설 사용 가능 여부 토글
- **URL**: `PUT /api/v1/stores/me/facilities/{facility_id}/toggle`
- **설명**: 편의시설의 사용 가능 여부를 토글합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "편의시설 상태가 변경되었습니다.",
  "data": {
    "id": 4,
    "is_available": 1
  }
}
```

**사용 예시:**
- 흡연구역 비활성화 → 활성화로 변경
- WiFi 활성화 → 비활성화로 변경

#### 편의시설 타입 가이드:
**기본 편의시설:**
- `wifi`: WiFi
- `restroom`: 화장실
- `tv_screen`: TV/스크린
- `outlet`: 콘센트
- `parking`: 주차장
- `no_smoking`: 금연구역
- `group_seating`: 단체석

**추가 편의시설:**
- `smoking_area`: 흡연구역
- `wireless_charging`: 무선충전
- `sound_system`: 음향시스템
- `private_room`: 개인실
- `booth_seating`: 부스석
- `air_conditioning`: 에어컨
- `heating`: 난방
- `custom`: 사용자 정의

**사용 예시:**
```json
{
  "facility_type": "wifi",
  "facility_name": "WiFi"
}
```

#### 프론트엔드 연동 가이드:
**편의시설 표시 방법:**
```javascript
// 편의시설 데이터 구조
const facilities = {
  wifi: { name: 'WiFi', available: true },
  parking: { name: '주차장', available: true },
  tv_screen: { name: 'TV/스크린', available: true },
  outlet: { name: '콘센트', available: true },
  no_smoking: { name: '금연구역', available: true },
  group_seating: { name: '단체석', available: true },
  smoking_area: { name: '흡연구역', available: false },
  wireless_charging: { name: '무선충전', available: false }
};

// 편의시설 상태에 따른 UI 표시
facilities.wifi.available ? '활성화 (주황색)' : '비활성화 (회색)';
```

**편의시설 관리 기능:**
- ✅ 편의시설 추가/삭제
- ✅ 편의시설 이름 수정
- ✅ 편의시설 사용 가능 여부 토글
- ✅ 실시간 상태 업데이트

### 2.16 🆕 스포츠 카테고리 조회 (사장님 전용)
- **URL**: `GET /api/v1/stores/me/sports-categories`
- **설명**: 매장의 스포츠 카테고리 목록을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "축구",
      "created_at": "2025-08-14T12:00:00"
    },
    {
      "name": "야구", 
      "created_at": "2025-08-14T12:00:00"
    },
    {
      "name": "농구",
      "created_at": "2025-08-14T12:00:00"
    }
  ]
}
```

### 2.17 🆕 스포츠 카테고리 추가 (사장님 전용)
- **URL**: `POST /api/v1/stores/me/sports-categories`
- **설명**: 매장에 새로운 스포츠 카테고리를 추가합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "category_name": "격투기"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "스포츠 카테고리가 추가되었습니다.",
  "data": {
    "store_id": "store_123",
    "category_name": "격투기",
    "message": "스포츠 카테고리가 추가되었습니다."
  }
}
```

### 2.18 🆕 스포츠 카테고리 삭제 (사장님 전용)
- **URL**: `DELETE /api/v1/stores/me/sports-categories/{category_name}`
- **설명**: 매장의 특정 스포츠 카테고리를 삭제합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "스포츠 카테고리가 삭제되었습니다."
}
```

### 2.19 은행 코드 목록 조회
- **URL**: `GET /api/v1/stores/banks`
- **설명**: 사용 가능한 은행 코드 목록을 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": [
    { "bank_code": "001", "bank_name": "한국은행" },
    { "bank_code": "004", "bank_name": "국민은행" },
    { "bank_code": "005", "bank_name": "하나은행" }
  ]
}
```

---

## 📅 예약 시스템

### 3.1 모임 생성
- **URL**: `POST /api/v1/reservations`
- **설명**: 새로운 모임을 생성합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수

#### 방법 1: 경기 기반 모임 생성 (추천)
- **Request Body**:
```json
{
  "store_id": 1,
  "match_id": 544214,
  "reservation_bio": "맥주한잔하며 즐겁게 보실분들!",
  "reservation_max_participant_cnt": 6
}
```

#### 방법 2: 수동 입력 모임 생성
- **Request Body**:
```json
{
  "store_id": 1,
  "reservation_title": "PD 볼사람",
  "reservation_description": "프리미어리그 같이 보실분!",
  "reservation_date": "2025-08-15",
  "reservation_start_time": "16:00:00",
  "reservation_end_time": "19:00:00", 
  "reservation_max_participant_cnt": 4,
  "reservation_match_category": 1
}
```

#### 필드 설명:
- `store_id`: 매장 ID (필수, 정수형)
- `match_id`: 경기 ID (방법1에서 필수, 정수형)
- `reservation_title`: 모임 제목 (방법2에서 필수, 문자열)
- `reservation_bio`: 모임 설명 (선택, 문자열)
- `reservation_description`: 모임 상세 설명 (선택, 문자열)
- `reservation_date`: 예약 날짜 (방법2에서 필수, YYYY-MM-DD 형식)
- `reservation_start_time`: 시작 시간 (HH:MM:SS 형식)
- `reservation_end_time`: 종료 시간 (HH:MM:SS 형식)
- `reservation_max_participant_cnt`: 최대 참여자 수 (필수, 정수형)
- `reservation_match_category`: 카테고리 (정수형)
  - `0`: 일반/기타
  - `1`: 프리미어리그 (PD)  
  - `2`: 리그 1 (FL1)
  - `3`: 프리미어리그 (PL)
- **Response**:
```json
{
  "success": true,
  "message": "모임이 생성되었습니다.",
  "data": {
    "reservation_id": 1,
    "created_at": "2025-08-15T01:20:00.000Z"
  }
}
```

#### 에러 응답:
```json
{
  "success": false,
  "message": "Column 'reservation_match' cannot be null",
  "statusCode": 500
}
```

#### 주의사항:
- `reservation_match` 컬럼은 NOT NULL 제약 조건이 있어 반드시 값이 필요합니다
- `reservation_match_category`는 정수형 필드입니다 (문자열 입력 시 에러 발생)
- 경기 기반 생성 시 `match_id`가 유효하지 않으면 400 에러가 발생합니다
- 수동 입력 시 `reservation_title` 또는 `reservation_match` 중 하나는 반드시 필요합니다

### 3.2 모임 참여
- **URL**: `POST /api/v1/reservations/{id}/join`
- **설명**: 기존 모임에 참여합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "모임에 참여했습니다.",
  "data": {
    "reservation_id": 1,
    "user_id": "testuser123"
  }
}
```

### 3.3 모임 조회
- **URL**: `GET /api/v1/reservations`
- **설명**: 모든 모임 목록을 조회합니다.
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 1,
      "reservation_match_name": "축구 모임",
      "reservation_start_time": "2025-01-20 19:00:00",
      "reservation_max_people": 10,
      "reservation_current_people": 5
    }
  ]
}
```

### 3.4 모임 상세 조회
- **URL**: `GET /api/v1/reservations/{id}`
- **설명**: 특정 모임의 상세 정보를 조회합니다.
- **Response**:
```json
{
    "success": true,
    "data": {
        "reservation_id": 13,
        "store_id": "store_123",
        "store_name": null,
        "reservation_start_time": "2025-07-28T10:00:00.000Z",
        "reservation_end_time": "2025-07-28T12:00:00.000Z",
        "reservation_match": "맨시티 vs 첼시",
        "reservation_bio": "치킨에 맥주까지 마시며 친해져요!",
        "reservation_status": 0,
        "reservation_participant_cnt": 2,
        "reservation_max_participant_cnt": 6,
        "participants": []
    }
}
```

### 3.5 내 예약 조회
- **URL**: `GET /api/v1/users/me/reservations`
- **설명**: 현재 사용자가 참여 중인 예약을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 1,
      "reservation_match_name": "축구 모임",
      "reservation_start_time": "2025-01-20 19:00:00",
      "reservation_status": 0
    }
  ]
}
```

### 3.6 내 매칭 조회
- **URL**: `GET /api/v1/users/me/matchings`
- **설명**: 현재 사용자가 참여 완료한 매칭을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 2,
      "reservation_match_name": "야구 모임",
      "reservation_start_time": "2025-01-15 19:00:00",
      "reservation_status": 1
    }
  ]
}
```
---

## 💬 채팅 시스템

### 5.1 채팅방 목록 조회
- **URL**: `GET /api/v1/chats/rooms`
- **설명**: 사용자가 참여 중인 채팅방 목록을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "room_id": 1,
      "room_name": "축구 모임",
      "last_message": "안녕하세요!",
      "last_message_time": "2025-01-18 20:30:00",
      "unread_count": 3
    }
  ]
}
```

### (안써도 됨)
### 5.2 채팅방 입장
- **URL**: `POST /api/v1/chats/rooms/{roomId}/enter`
- **설명**: 채팅방에 입장합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "채팅방에 입장했습니다.",
  "data": {
    "room_id": 1,
    "room_name": "축구 모임"
  }
}
```

### 5.3 채팅방 나가기
- **URL**: `DELETE /api/v1/chats/rooms/{roomId}/leave`
- **설명**: 채팅방에서 나갑니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "채팅방에서 나갔습니다."
}
```

### (상태는 자동변경 사용)
### 5.4 채팅방 상태 변경
- **URL**: `PUT /api/v1/chats/rooms/{roomId}/status`
- **설명**: 채팅방의 상태를 변경합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "status": "active"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "채팅방 상태가 변경되었습니다.",
  "data": {
    "room_id": 1,
    "status": "active"
  }
}
```

### 5.5 채팅방 강퇴
- **URL**: `DELETE /api/v1/chats/rooms/:roomId/kick/:userId`
- **설명**: 채팅방에서 특정 참가자를 강퇴시킵니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "참가자가 강퇴되었습니다."
}
```

### 5.6 모든 메시지 조회
- **URL**: `GET /api/v1/chats/rooms/{roomId}/messages`
- **설명**: 채팅방의 모든 메시지를 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "message_id": 1,
      "user_id": "user1",
      "user_name": "김철수",
      "message": "안녕하세요!",
      "message_type": "text",
      "created_at": "2025-01-18 20:30:00"
    }
  ]
}
```

---

## 📝 사용자 관리

### 6.1 내 프로필 조회
- **URL**: `GET /api/v1/users/me`
- **설명**: 현재 사용자의 프로필 정보를 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "user_id": "testuser123",
    "user_name": "홍길동",
    "user_email": "test@example.com",
    "user_phone_number": "010-1234-5678",
    "user_region": "서울",
    "user_gender": 1
  }
}
```

### 6.2 프로필 수정
- **URL**: `PUT /api/v1/users/me`
- **설명**: 현재 사용자의 프로필 정보를 수정합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "user_name": "홍길동",
  "user_email": "newemail@example.com",
  "user_phone_number": "010-9876-5432",
  "user_region": "부산"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "프로필이 수정되었습니다.",
  "data": {
    "user_id": "testuser123",
    "user_name": "홍길동"
  }
}
```

### 6.3 비밀번호 변경
- **URL**: `PUT /api/v1/users/me/password`
- **설명**: 현재 사용자의 비밀번호를 변경합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

### 6.4 사용자 프로필 조회
- **URL**: `GET /api/v1/users/{userId}/profile`
- **설명**: 특정 사용자의 프로필 정보를 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "user_name": "김철수",
    "user_region": "서울",
    "user_gender": 1
  }
}
```

### 6.5 🆕 내 리뷰 조회
- **URL**: `GET /api/v1/users/me/reviews`
- **설명**: 현재 사용자가 작성한 리뷰 목록을 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "review_id": 1,
      "store_name": "챔피언 스포츠 펍",
      "rating": 5,
      "comment": "정말 좋은 분위기였어요!",
      "created_at": "2025-01-15 20:30:00"
    }
  ]
}
```

### 6.6 🆕 사용자 설정 변경
- **URL**: `PATCH /api/v1/users/me`
- **설명**: 사용자의 설정을 부분적으로 변경합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "notification_enabled": true,
  "marketing_agree": false
}
```
- **Response**:
```json
{
  "success": true,
  "message": "사용자 설정이 변경되었습니다."
}
```

### 6.7 🆕 회원 탈퇴
- **URL**: `DELETE /api/v1/users/me`
- **설명**: 현재 사용자의 계정을 탈퇴합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "message": "회원 탈퇴가 완료되었습니다."
}
```

---

## 💳 결제 시스템

### 4.1 결제 요청 생성
- **URL**: `POST /api/v1/payment/request`
- **설명**: 새로운 결제 요청을 생성합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "chat_room_id": 1,
  "amount": 50000,
  "description": "축구 모임 예약금"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "결제 요청이 생성되었습니다.",
  "data": {
    "payment_id": "payment_123",
    "amount": 50000
  }
}
```

### 4.2 결제 시작
- **URL**: `POST /api/v1/payment/initiate`
- **설명**: 결제를 시작합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "payment_id": "payment_123",
  "payment_method": "card"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "결제가 시작되었습니다.",
  "data": {
    "payment_url": "https://payment.example.com/...",
    "payment_id": "payment_123"
  }
}
```

### 4.3 결제 정산
- **URL**: `POST /api/v1/payment/release`
- **설명**: 결제를 정산합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "chat_room_id": 1
}
```
- **Response**:
```json
{
  "success": true,
  "message": "결제가 정산되었습니다."
}
```

### 4.4 결제 상태 조회
- **URL**: `GET /api/v1/payment/status/{chatRoomId}`
- **설명**: 특정 채팅방의 결제 상태를 조회합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Response**:
```json
{
  "success": true,
  "data": {
    "chat_room_id": 1,
    "payment_status": "completed",
    "total_amount": 50000,
    "participants": [
      {
        "user_id": "user1",
        "status": "paid",
        "amount": 10000
      }
    ]
  }
}
```

### 4.5 결제 취소
- **URL**: `POST /api/v1/payment/cancel`
- **설명**: 결제를 취소합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "payment_id": "payment_123",
  "reason": "취소 사유"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "결제가 취소되었습니다."
}
```

---

## 📝 리뷰 시스템

### 7.1 리뷰 작성
- **URL**: `POST /api/v1/reviews`
- **설명**: 매장에 대한 리뷰를 작성합니다.
- **Headers**: `Authorization: Bearer <JWT>` ✅ 필수
- **Request Body**:
```json
{
  "store_id": "store_123",
  "reservation_id": 1,
  "rating": 5,
  "comment": "정말 좋은 분위기였어요!"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "리뷰가 작성되었습니다.",
  "data": {
    "review_id": 1,
    "rating": 5
  }
}
```

---

# 🏟️ 경기 정보 조회 API 명세서

## 1. 전체 경기 목록 조회

### 설명
`matches` 테이블에서 경기 정보를 조회합니다.  
기본적으로 **현재 시각 이후의 경기만** 반환하지만, `date_from` 또는 `date_to`가 주어지면 이 제한은 적용되지 않습니다.  
구단명 검색 시 홈/원정 모두를 검색합니다.

---

### **URL**
```
GET /api/v1/matches
```
### 📋 Category 번호 구분
- **Category 1 = ⚽ 축구**
  - 대회: PL(프리미어리그), PD(라리가), BL1(분데스리가), SA(세리에A), FL1(리그1), CL(챔피언스리그), EL(유로파리그), EC(유로), WC(월드컵), CLI(코파 리베르타도레스), ACL(AFC 챔피언스리그)
- **Category 2 = ⚾ 야구**
  - 대회: KBO(한국프로야구)
### **Query Parameters**
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| competition_code | string | ❌ | 대회 코드 |
| status | string | ❌ | 경기 상태(ex: SCHEDULED, FINISHED) |
| date_from | string(datetime) | ❌ | 조회 시작 날짜 (`YYYY-MM-DD` 또는 `YYYY-MM-DD HH:MM:SS`) |
| date_to | string(datetime) | ❌ | 조회 종료 날짜 |
| home | string | ❌ | 홈팀명 검색 |
| away | string | ❌ | 원정팀명 검색 |
| team | string | ❌ | 홈/원정 모두 포함 구단명 검색 |
| venue | string | ❌ | 경기장명 검색 |
| category | int | ❌ | 카테고리(숫자) |
| sort | string | ❌ | 정렬 필드와 방향 (`match_date:asc` 기본) |
| page | int | ❌ | 페이지 번호(기본 1) |
| page_size | int / `"all"` | ❌ | 페이지 크기. `"all"` 또는 `all=true`면 전체 조회 |
| all | boolean | ❌ | `true`이면 전체 조회 (page/page_size 무시) |

---

### **Request 예시**

#### 1) 전체 조회
```
GET /api/v1/matches?all=true
```

#### 2) 축구 경기만 조회
```
GET /api/v1/matches?category=1
```

#### 3) 야구 경기만 조회
```
GET /api/v1/matches?category=2
```

#### 4) 구단명 통합 검색
```
GET /api/v1/matches?team=Arsenal
```

#### 5) 날짜 범위 검색
```
GET /api/v1/matches?date_from=2025-08-15&date_to=2025-08-20
```

#### 6) 날짜+구단명+카테고리 검색
```
GET /api/v1/matches?date_from=2025-08-15&date_to=2025-08-20&team=Manchester&category=1
```

---

### **Response 예시**
```json
{
  "success": true,
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 150,
    "total_pages": 8,
    "sort": "match_date:asc",
    "filters": {
      "team": "Arsenal"
    }
  },
  "data": [
    {
      "id": 101,
      "competition_code": "PL",
      "match_date": "2025-08-17 17:00:00",
      "status": "SCHEDULED",
      "home_team": "Arsenal",
      "away_team": "Chelsea",
      "venue": "Emirates Stadium",
      "category": 1
    },
    {
      "id": 102,
      "competition_code": "KBO",
      "match_date": "2025-08-18 19:00:00",
      "status": "SCHEDULED",
      "home_team": "LG 트윈스",
      "away_team": "두산 베어스",
      "venue": "잠실야구장",
      "category": 2
    }
  ]
}
```

---

### **에러 응답 예시**
```json
{
  "success": false,
  "errorCode": "INVALID_PARAMETER",
  "message": "date_from은 date_to보다 이전이어야 합니다."
}
```

---

### **비고**
- `team` 파라미터는 홈/원정 팀명 모두를 검색
- 날짜 범위 필터가 없으면 기본적으로 `match_date > NOW()` 조건이 자동 적용
- `page_size`가 `all`이거나 `all=true`이면 모든 데이터를 반환


---

### Response (400)

```json
{
  "success": false,
  "errorCode": "INVALID_PARAMETER",
  "message": "date_from은 date_to보다 이전이어야 합니다."
}
```

### Response (500)

```json
{
  "success": false,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "message": "서버 내부 오류가 발생했습니다."
}
```

---

## 필드 정의

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | int | 경기 고유 ID (PK) |
| `competition_code` | string(10) | 대회 코드 (예: EPL, UCL 등) |
| `match_date` | datetime | 경기 시작 일시 (UTC 권장) |
| `status` | string(20) | `SCHEDULED`,`LIVE`,`FINISHED`,`POSTPONED` 등 |
| `home_team` | string(100) | 홈 팀명 |
| `away_team` | string(100) | 원정 팀명 |
| `venue` | string(255) | 경기장 |
| `category` | int | 경기 종목 분류 (1=축구, 2=야구) |

---

## 예시 요청

**EPL 9월 예정 경기만, 날짜 오름차순 1페이지(50개)**  
```
GET /api/v1/matches?competition_code=EPL&status=SCHEDULED&date_from=2025-09-01T00:00:00Z&date_to=2025-09-30T23:59:59Z&sort=match_date:asc&page=1&page_size=50
```

**맨시티가 홈인 경기 검색**  
```
GET /api/v1/matches?home=Manchester%20City
```

**경기장에 ‘Park’가 포함된 모든 경기 최신순**  
```
GET /api/v1/matches?venue=Park&sort=match_date:desc
```

---

## 응답 규칙

- 성공: `{ "success": true, "data": [...] , "meta": {...} }`
- 실패: `{ "success": false, "errorCode": "...", "message": "..." }`



---

## 🔧 에러 코드

### 공통 에러 응답 형식
```json
{
  "success": false,
  "message": "에러 메시지",
  "error_code": "ERROR_CODE"
}
```

### 주요 에러 코드
- `UNAUTHORIZED`: 인증이 필요합니다.
- `FORBIDDEN`: 접근 권한이 없습니다.
- `NOT_FOUND`: 리소스를 찾을 수 없습니다.
- `VALIDATION_ERROR`: 입력 데이터가 유효하지 않습니다.
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류가 발생했습니다.

---

## 📚 참고사항

1. **인증**: JWT 토큰이 필요한 API는 `Authorization: Bearer <JWT>` 헤더를 포함해야 합니다.
2. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD HH:mm:ss` 형식을 사용합니다.
3. **페이지네이션**: 목록 조회 API는 필요에 따라 페이지네이션을 지원할 수 있습니다.
4. **실시간 통신**: 채팅 기능은 WebSocket을 통해 실시간으로 동작합니다.

