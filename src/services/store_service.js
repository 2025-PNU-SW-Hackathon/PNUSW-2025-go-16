// 📦 storeService.js

const { getConnection } = require('../config/db_config');

// 🔍 가게 목록 조회 서비스
exports.getStoreList = async (filters) => {
  const conn = getConnection();
  const { region, date, category, keyword } = filters;

  let query = `
    SELECT 
      s.store_id,
      s.store_name,
      s.store_address,
      s.store_phonenumber,
      s.store_rating,
      s.store_thumbnail
    FROM store_table s
    WHERE 1=1
  `;
  const params = [];

  // 지역 필터 (store_address에서 검색)
  if (region) {
    query += ` AND s.store_address LIKE ?`;
    params.push(`%${region}%`);
  }

  // 날짜 필터 (해당 날짜에 예약 가능한 가게만)
  if (date) {
    query += ` AND s.store_id IN (
      SELECT DISTINCT store_id 
      FROM reservation_table 
      WHERE DATE(reservation_start_time) = ?
    )`;
    params.push(date);
  }

  // 카테고리 필터 (예약 카테고리로 필터링)
  if (category) {
    query += ` AND s.store_id IN (
      SELECT DISTINCT store_id 
      FROM reservation_table 
      WHERE reservation_match_category = ?
    )`;
    params.push(category);
  }

  // 키워드 검색 (가게명, 주소, 소개 등)
  if (keyword) {
    query += ` AND (
      s.store_name LIKE ? OR 
      s.store_address LIKE ? OR
      s.store_bio LIKE ?
    )`;
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  query += ` ORDER BY s.store_rating DESC, s.store_name ASC`;

  const [rows] = await conn.query(query, params);
  return rows;
}; 