
# 📌 사용자 프로필 이미지 API

사용자 프로필 이미지를 **업로드(저장)**하고 **조회**하기 위한 API 명세입니다.  
이미지 저장은 로컬 디스크(`uploads/images`)와 `images` 테이블 메타를 사용하며, 조회는 **바이너리 스트리밍**으로 응답합니다.

---

## 1) 프로필 이미지 업로드

### `POST /api/v1/users/me/thumbnail`

사용자의 프로필 이미지를 업로드합니다. (한 번에 1장)

- **Content-Type**: `multipart/form-data`
- **인증**: jwt로 구현.

### Form-data Parameters

| Key        | Type | Required | Description                |
|------------|------|----------|----------------------------|
| `thumbnail`| file | ✅       | 업로드할 이미지 파일 (1장) |

### 성공 응답 (200)

```json
{
  "ok": true,
  "image_id": 2001,
  "object_key": "images/17351520-xxxx.jpg"
}
```

### 오류 응답 예시

- `400` : 필드 누락, 허용되지 않는 MIME 타입, 사이즈 0 등
- `404` : 사용자 미존재 시(선택적 처리 정책)
- `500` : 내부 오류

### 비고

- 저장 시 `images` 테이블에 레코드가 생성됩니다.
- 동일 사용자의 기존 이미지가 있다면 비공개 처리(`is_public = 0`)로 갱신하는 정책을 권장합니다.

---

## 2) 프로필 이미지 조회

### `GET /api/v1/users/:userId/thumbnail`

해당 사용자의 **현재 프로필 이미지**를 바이너리 스트리밍으로 반환합니다.

- **Response Content-Type**: 업로드된 이미지의 MIME(`image/jpeg` 등)
- **Cache-Control**: `public, max-age=3600`

#### 성공 (200)

응답 본문은 **이미지 바이너리**입니다. (예: JPEG/PNG/WebP)

#### 실패

- `404` : 프로필 이미지가 없을 때
- `500` : 내부 오류

#### 사용 예 (클라이언트)

```tsx
<Image
  source={{ uri: "http://<HOST>:<PORT>/api/v1/users/user_123/thumbnail" }}
  style={{ width: 120, height: 120, borderRadius: 60 }}
/>
```

---

## 3) (참고) 단건 이미지 조회 API

여러 곳에서 공통으로 사용하는 단건 이미지 스트리밍 API입니다.

### `GET /api/v1/images/:imageId`

- **Response Content-Type**: 저장된 이미지의 MIME
- 성공 시 이미지 바이너리 스트리밍

#### 예시

```http
GET /api/v1/images/2001
```

---

## 스키마 참고 (`images`)

```sql
CREATE TABLE images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_type ENUM('user','store','reservation','review') NOT NULL,
  owner_id   VARCHAR(64) NOT NULL,
  storage_type ENUM('local','s3') NOT NULL DEFAULT 'local',
  bucket     VARCHAR(128) NULL,
  object_key VARCHAR(512) NOT NULL,
  mime_type  VARCHAR(64) NOT NULL,
  byte_size  INT UNSIGNED NOT NULL,
  is_public  TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_type, owner_id)
);
```
---

## Postman 샘플

**POST /api/v1/users/me/thumbnail** **(form-data)**

| Key        | Value            | Type |
|------------|------------------|------|
| thumbnail  | avatar.jpg       | File |

**GET /api/v1/users/user_123/thumbnail** → 이미지 바이너리 응답
