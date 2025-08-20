# 🏪 가게 API 명세서 (업데이트됨)

## 📋 개요
가게 관련 API들의 최신 명세서입니다. `store_id`는 데이터베이스에서는 `VARCHAR` 타입으로 저장되지만, API 응답에서는 `number` 타입으로 반환됩니다.

---

## 🔍 1. 가게 목록 조회 API

### **GET** `/api/v1/stores`

가게 목록을 조회합니다.

#### 📝 요청 파라미터 (Query Parameters)
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `region` | string | ❌ | 지역 필터 (가게 주소에서 검색) |
| `date` | string | ❌ | 날짜 필터 (YYYY-MM-DD 형식) |
| `category` | string | ❌ | 카테고리 필터 |
| `keyword` | string | ❌ | 키워드 검색 (가게명, 주소, 소개) |

#### 📤 응답 예시
```json
{
  "success": true,
  "data": [
    {
      "store_id": 1,
      "store_name": "테스트 가게 1",
      "store_address": "서울시 강남구 테헤란로 123",
      "store_phonenumber": "02-1234-5678",
      "store_rating": 4.5,
      "store_thumbnail": "https://example.com/image.jpg"
    },
    {
      "store_id": 2,
      "store_name": "테스트 가게 2",
      "store_address": "서울시 서초구 서초대로 456",
      "store_phonenumber": "02-2345-6789",
      "store_rating": 4.2,
      "store_thumbnail": "https://example.com/image2.jpg"
    }
  ]
}
```

#### ⚠️ 에러 응답
```json
{
  "success": false,
  "message": "가게 목록 조회 중 오류가 발생했습니다."
}
```

---

## 🔍 2. 가게 상세 정보 조회 API

### **GET** `/api/v1/stores/{storeId}/detail`

특정 가게의 상세 정보를 조회합니다.

#### 📝 요청 파라미터 (Path Parameters)
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `storeId` | number | ✅ | 가게 고유 ID |

#### 📤 응답 예시
```json
{
  "success": true,
  "data": {
    "store_id": 1,
    "store_name": "테스트 가게 1",
    "store_address": "서울시 강남구 테헤란로 123",
    "store_bio": "테스트용 가게입니다.",
    "store_open_hour": 9,
    "store_close_hour": 22,
    "store_holiday": 0,
    "store_max_people_cnt": 50,
    "store_max_table_cnt": 10,
    "store_max_parking_cnt": 20,
    "store_max_screen_cnt": 5,
    "store_phonenumber": "02-1234-5678",
    "store_thumbnail": "https://example.com/image.jpg",
    "store_review_cnt": 0,
    "store_rating": 4.5,
    "bank_code": "004",
    "account_number": "123-456789-01-234",
    "account_holder_name": "홍길동",
    "business_number": "123-45-67890"
  }
}
```

#### ⚠️ 에러 응답

**400 Bad Request** (잘못된 storeId)
```json
{
  "success": false,
  "message": "유효하지 않은 가게 ID입니다."
}
```

**404 Not Found** (존재하지 않는 가게)
```json
{
  "success": false,
  "message": "가게를 찾을 수 없습니다."
}
```

**500 Internal Server Error** (서버 오류)
```json
{
  "success": false,
  "message": "가게 상세 정보 조회 중 오류가 발생했습니다."
}
```

---

## 🔍 3. 가게 결제 정보 조회 API

### **GET** `/api/v1/stores/{storeId}/payment`

가게의 결제 정보를 조회합니다.

#### 📝 요청 파라미터 (Path Parameters)
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `storeId` | number | ✅ | 가게 고유 ID |

#### 📤 응답 예시
```json
{
  "success": true,
  "data": {
    "store_id": 1,
    "bank_code": "004",
    "account_number": "123-456789-01-234",
    "account_holder_name": "홍길동",
    "business_number": "123-45-67890"
  }
}
```

---

## 🔍 4. 가게 결제 정보 수정 API

### **PUT** `/api/v1/stores/{storeId}/payment`

가게의 결제 정보를 수정합니다.

#### 📝 요청 파라미터 (Path Parameters)
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `storeId` | number | ✅ | 가게 고유 ID |

#### 📝 요청 본문 (Request Body)
```json
{
  "bank_code": "004",
  "account_number": "123-456789-01-234",
  "account_holder_name": "홍길동",
  "business_number": "123-45-67890"
}
```

#### 📤 응답 예시
```json
{
  "success": true,
  "data": {
    "store_id": 1,
    "bank_code": "004",
    "account_number": "123-456789-01-234",
    "account_holder_name": "홍길동",
    "business_number": "123-45-67890"
  }
}
```

---

## 🔍 5. 내 가게 정보 조회 API

### **GET** `/api/v1/stores/me`

현재 로그인한 사용자의 가게 정보를 조회합니다.

#### 📝 요청 헤더
| 헤더 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `Authorization` | string | ✅ | Bearer 토큰 |

#### 📤 응답 예시
```json
{
  "success": true,
  "data": {
    "store_id": 1,
    "store_name": "테스트 가게 1",
    "store_address": "서울시 강남구 테헤란로 123",
    "store_bio": "테스트용 가게입니다.",
    "store_open_hour": 9,
    "store_close_hour": 22,
    "store_holiday": 0,
    "store_max_people_cnt": 50,
    "store_max_table_cnt": 10,
    "store_max_parking_cnt": 20,
    "store_max_screen_cnt": 5,
    "store_phonenumber": "02-1234-5678",
    "store_thumbnail": "https://example.com/image.jpg",
    "store_review_cnt": 0,
    "store_rating": 4.5,
    "bank_code": "004",
    "account_number": "123-456789-01-234",
    "account_holder_name": "홍길동",
    "business_number": "123-45-67890"
  }
}
```

---

## 🔍 6. 은행 코드 목록 조회 API

### **GET** `/api/v1/stores/bank-codes`

사용 가능한 은행 코드 목록을 조회합니다.

#### 📤 응답 예시
```json
{
  "success": true,
  "data": [
    {
      "bank_code": "001",
      "bank_name": "한국은행"
    },
    {
      "bank_code": "004",
      "bank_name": "국민은행"
    },
    {
      "bank_code": "005",
      "bank_name": "하나은행"
    }
  ]
}
```

---

## 📊 데이터 타입 설명

### store_id 타입 처리
- **데이터베이스**: `VARCHAR(50)` - 문자열로 저장
- **API 응답**: `number` - 숫자로 변환하여 반환
- **변환 로직**: `parseInt(store_id) || 0`

### 주요 데이터 타입
| 필드 | 타입 | 설명 |
|------|------|------|
| `store_id` | number | 가게 고유 ID (API 응답에서만) |
| `store_name` | string | 가게명 |
| `store_address` | string | 가게 주소 |
| `store_rating` | number | 평점 (0.00 ~ 5.00) |
| `store_review_cnt` | number | 리뷰 개수 |
| `store_max_*_cnt` | number | 최대 수용 가능한 개수들 |

---

## 🔧 기술적 구현 사항

### 데이터 변환 처리
```javascript
// store_service.js에서 구현된 변환 로직
const convertedRows = rows.map(row => ({
  ...row,
  store_id: parseInt(row.store_id) || 0
}));
```

### 에러 처리
- **400**: 잘못된 파라미터 (storeId가 숫자가 아님)
- **404**: 존재하지 않는 리소스
- **500**: 서버 내부 오류

### 데이터베이스 스키마
```sql
CREATE TABLE store_table (
  store_id VARCHAR(50) PRIMARY KEY,  -- 문자열로 저장
  store_name VARCHAR(100) NOT NULL,
  -- ... 기타 필드들
);
```

---

## 🧪 테스트 방법

### 1. 가게 목록 조회 테스트
```bash
curl -X GET "http://localhost:3000/api/v1/stores"
```

### 2. 가게 상세 정보 조회 테스트
```bash
curl -X GET "http://localhost:3000/api/v1/stores/1/detail"
```

### 3. 잘못된 storeId 테스트
```bash
curl -X GET "http://localhost:3000/api/v1/stores/invalid/detail"
```

### 4. 존재하지 않는 가게 테스트
```bash
curl -X GET "http://localhost:3000/api/v1/stores/999/detail"
```

---

## 📝 변경 이력

### v1.1 (현재)
- ✅ `store_id`를 API 응답에서 `number` 타입으로 반환
- ✅ 데이터베이스 스키마는 `VARCHAR` 유지
- ✅ 서비스 레이어에서 데이터 변환 처리
- ✅ 에러 처리 개선

### v1.0 (이전)
- ❌ `store_id`가 문자열로 반환됨
- ❌ 클라이언트에서 타입 불일치 문제 발생
