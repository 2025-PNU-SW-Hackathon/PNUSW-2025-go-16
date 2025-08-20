-- store_table 스키마 업데이트 스크립트
-- store_id를 VARCHAR에서 INT로 변경

-- 1. 기존 테이블 백업 (선택사항)
-- CREATE TABLE store_table_backup AS SELECT * FROM store_table;

-- 2. 기존 데이터 삭제 (새로운 스키마로 재생성하기 위해)
DROP TABLE IF EXISTS store_table;

-- 3. 새로운 스키마로 테이블 생성
CREATE TABLE store_table (
  store_id INT AUTO_INCREMENT PRIMARY KEY,
  store_pwd VARCHAR(255) NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  business_number VARCHAR(20),
  store_address VARCHAR(200),
  store_phonenumber VARCHAR(20),
  store_open_hour INT DEFAULT 9,
  store_close_hour INT DEFAULT 22,
  store_max_people_cnt INT DEFAULT 50,
  store_max_table_cnt INT DEFAULT 10,
  store_max_parking_cnt INT DEFAULT 20,
  store_max_screen_cnt INT DEFAULT 5,
  store_bio TEXT,
  store_holiday INT DEFAULT 0,
  store_review_cnt INT DEFAULT 0,
  store_rating DECIMAL(3,2) DEFAULT 0.00,
  store_thumbnail VARCHAR(500),
  bank_code VARCHAR(10),
  account_number VARCHAR(50),
  account_holder_name VARCHAR(50),
  owner_name VARCHAR(50),
  email VARCHAR(100),
  address_detail VARCHAR(200),
  postal_code VARCHAR(10),
  cancellation_policy TEXT,
  deposit_amount INT DEFAULT 0,
  available_times JSON,
  business_certificate_url VARCHAR(500),
  business_registration_status ENUM('pending', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. 샘플 데이터 삽입 (숫자 ID 사용)
INSERT INTO store_table (store_pwd, store_name, business_number, store_address, store_phonenumber, store_bio) VALUES
('$2a$10$hashedpassword', '테스트 가게 1', '123-45-67890', '서울시 강남구 테헤란로 123', '02-1234-5678', '테스트용 가게입니다.'),
('$2a$10$hashedpassword', '테스트 가게 2', '123-45-67891', '서울시 서초구 서초대로 456', '02-2345-6789', '두 번째 테스트 가게입니다.'),
('$2a$10$hashedpassword', '챔피언 스포츠 펍', '123-45-67892', '서울시 강남구 테헤란로 789', '02-3456-7890', '최고의 스포츠 관람 공간입니다.');
