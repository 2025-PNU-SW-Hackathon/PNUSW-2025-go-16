-- 🏪 가게 선택 기능을 위한 reservation_table 필드 추가
-- 실행 방법: MySQL에서 이 파일을 실행하거나 각 라인을 개별적으로 실행

-- 1. 선택된 가게 ID 필드 추가
ALTER TABLE reservation_table ADD COLUMN selected_store_id VARCHAR(50) NULL;

-- 2. 선택된 가게 이름 필드 추가 (캐싱용)
ALTER TABLE reservation_table ADD COLUMN selected_store_name VARCHAR(255) NULL;

-- 3. 가게 선택 시간 필드 추가
ALTER TABLE reservation_table ADD COLUMN selected_at TIMESTAMP NULL;

-- 4. 가게 선택한 사용자 ID 필드 추가
ALTER TABLE reservation_table ADD COLUMN selected_by VARCHAR(255) NULL;

-- 5. 외래키 제약조건 추가 (선택사항)
-- ALTER TABLE reservation_table 
-- ADD CONSTRAINT fk_selected_store 
-- FOREIGN KEY (selected_store_id) REFERENCES store_table(store_id);

-- 6. 인덱스 추가 (성능 최적화)
CREATE INDEX idx_reservation_selected_store ON reservation_table(selected_store_id);
CREATE INDEX idx_reservation_selected_at ON reservation_table(selected_at);

-- 7. 확인 쿼리
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'reservation_table' 
-- AND COLUMN_NAME LIKE 'selected_%';
