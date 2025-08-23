-- 💰 채팅방 정산 시스템을 위한 데이터베이스 테이블 생성
-- 실행 방법: MySQL에서 이 파일을 실행

-- 1. 정산 세션 테이블 생성
CREATE TABLE IF NOT EXISTS payment_sessions (
  payment_id VARCHAR(50) PRIMARY KEY,
  chat_room_id INT NOT NULL,
  reservation_id INT NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  payment_status ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
  payment_per_person DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  total_participants INT NOT NULL,
  completed_payments INT DEFAULT 0,
  started_by VARCHAR(255) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  payment_deadline TIMESTAMP NOT NULL,
  
  INDEX idx_chat_room_id (chat_room_id),
  INDEX idx_reservation_id (reservation_id),
  INDEX idx_store_id (store_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_started_at (started_at)
);

-- 2. 정산 기록 테이블 생성
CREATE TABLE IF NOT EXISTS payment_records (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  payment_status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  payment_method ENUM('bank_transfer', 'card', 'cash') NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (payment_id) REFERENCES payment_sessions(payment_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_payment (payment_id, user_id),
  INDEX idx_payment_id (payment_id),
  INDEX idx_user_id (user_id),
  INDEX idx_payment_status (payment_status)
);

-- 3. store_table에 정산 관련 필드 추가
ALTER TABLE store_table 
ADD COLUMN payment_per_person DECIMAL(10,2) DEFAULT 25000 COMMENT '1인당 정산 금액',
ADD COLUMN bank_name VARCHAR(100) DEFAULT '국민은행' COMMENT '은행명',
ADD COLUMN account_number VARCHAR(50) DEFAULT '123-456-789012' COMMENT '계좌번호',
ADD COLUMN account_holder VARCHAR(100) DEFAULT '강남스포츠바' COMMENT '예금주';

-- 4. 기존 store_table 데이터 업데이트 (샘플 데이터)
UPDATE store_table SET 
  payment_per_person = 25000,
  bank_name = '국민은행',
  account_number = '123-456-789012',
  account_holder = CONCAT(store_name, ' 대표')
WHERE store_id IN ('test1', 'test2', 'store_123');

-- 5. 인덱스 추가
CREATE INDEX idx_store_payment ON store_table(payment_per_person);

-- 6. 확인 쿼리
-- SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME IN ('payment_sessions', 'payment_records')
-- ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 7. 샘플 정산 데이터 (테스트용 - 운영에서는 제거)
-- INSERT INTO payment_sessions VALUES 
-- ('payment_test_001', 1, 1, 'test1', 'in_progress', 25000.00, 125000.00, 5, 2, 'test1', NOW(), NULL, DATE_ADD(NOW(), INTERVAL 3 DAY));

-- INSERT INTO payment_records (payment_id, user_id, user_name, payment_status, payment_method, paid_at) VALUES
-- ('payment_test_001', 'test1', '방장', 'completed', 'bank_transfer', NOW()),
-- ('payment_test_001', 'test2', '참여자1', 'pending', NULL, NULL),
-- ('payment_test_001', 'test3', '참여자2', 'completed', 'card', NOW()),
-- ('payment_test_001', 'test4', '참여자3', 'pending', NULL, NULL),
-- ('payment_test_001', 'test5', '참여자4', 'pending', NULL, NULL);
