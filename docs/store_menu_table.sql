-- 🍽️ 매장 메뉴 정보 테이블 생성
-- 매장별로 메뉴 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS `store_menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` varchar(64) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT '메뉴명',
  `price` int NOT NULL COMMENT '가격',
  `description` text COMMENT '메뉴 설명',
  `category` varchar(50) DEFAULT NULL COMMENT '메뉴 카테고리',
  `is_available` tinyint(1) DEFAULT 1 COMMENT '판매 가능 여부',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_store_id` (`store_id`),
  CONSTRAINT `fk_store_menu_store` FOREIGN KEY (`store_id`) REFERENCES `store_table` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 📝 샘플 메뉴 데이터 추가
INSERT INTO `store_menu` (`store_id`, `name`, `price`, `description`, `category`) VALUES
('store_123', '치킨 세트', 28000, '바삭한 치킨과 감자튀김, 콜라가 포함된 세트', '메인'),
('store_123', '수제 맥주 세트', 25000, '프리미엄 수제 맥주와 안주가 포함된 세트', '음료'),
('store_456', '골든볼 특제 치킨', 32000, '골든볼만의 특별한 양념으로 만든 치킨', '메인'),
('store_456', '스포츠 음료', 8000, '운동 후 마시기 좋은 이온 음료', '음료'); 