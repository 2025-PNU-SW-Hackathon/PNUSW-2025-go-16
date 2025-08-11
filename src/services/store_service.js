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

// 가게 상세 정보 조회
exports.getStoreDetail = async (storeId) => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT 
        store_id, store_name, store_address, store_bio,
        store_open_hour, store_close_hour, store_holiday,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt, store_max_screen_cnt,
        store_phonenumber, store_thumbnail, store_review_cnt, store_rating,
        bank_code, account_number, account_holder_name, business_number
       FROM store_table 
       WHERE store_id = ?`,
      [storeId]
    );
    
    if (rows.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    return rows[0];
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '가게 상세 정보 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 가게 결제 정보 조회
exports.getStorePaymentInfo = async (storeId) => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT 
        store_id, bank_code, account_number, account_holder_name, business_number
       FROM store_table 
       WHERE store_id = ?`,
      [storeId]
    );
    
    if (rows.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    return rows[0];
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 정보 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 가게 결제 정보 수정
exports.updateStorePaymentInfo = async (storeId, paymentData) => {
  const conn = getConnection();
  const { bank_code, account_number, account_holder_name, business_number } = paymentData;
  
  try {
    const [result] = await conn.query(
      `UPDATE store_table 
       SET bank_code = ?, account_number = ?, account_holder_name = ?, business_number = ?
       WHERE store_id = ?`,
      [bank_code, account_number, account_holder_name, business_number, storeId]
    );
    
    if (result.affectedRows === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    return {
      store_id: storeId,
      bank_code,
      account_number,
      account_holder_name,
      business_number
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '결제 정보 수정 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 은행 코드 목록 조회
exports.getBankCodes = async () => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT bank_code, bank_name FROM bank_codes ORDER BY bank_code`
    );
    return rows;
  } catch (error) {
    // bank_codes 테이블이 없을 경우 기본 데이터 반환
    return [
      { bank_code: '001', bank_name: '한국은행' },
      { bank_code: '002', bank_name: '산업은행' },
      { bank_code: '003', bank_name: '기업은행' },
      { bank_code: '004', bank_name: '국민은행' },
      { bank_code: '005', bank_name: '하나은행' },
      { bank_code: '006', bank_name: '신한은행' },
      { bank_code: '007', bank_name: '우리은행' },
      { bank_code: '008', bank_name: '농협은행' },
      { bank_code: '009', bank_name: '수협은행' },
      { bank_code: '010', bank_name: '케이뱅크' },
      { bank_code: '011', bank_name: '카카오뱅크' }
    ];
  }
}; 