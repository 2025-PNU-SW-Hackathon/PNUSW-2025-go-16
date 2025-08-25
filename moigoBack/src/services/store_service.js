// 📦 storeService.js

const { getConnection } = require('../config/db_config');
const bcrypt = require('bcryptjs');

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
  
  // store_id는 문자열일 수도 있으므로 변환하지 않음
  const convertedRows = rows.map(row => ({
    ...row,
    store_id: row.store_id  // 원본 값 유지
  }));
  
  return convertedRows;
};

// 가게 상세 정보 조회
exports.getStoreDetail = async (storeId) => {
  let conn;
  try {
    console.log('🔍 [DEBUG] 가게 상세 정보 조회 시작 - storeId:', storeId);
    
    // storeId 유효성 확인
    if (!storeId || storeId.toString().trim() === '') {
      const err = new Error('유효하지 않은 가게 ID입니다.');
      err.statusCode = 400;
      throw err;
    }
    
    conn = getConnection();
    if (!conn) {
      throw new Error('데이터베이스 연결을 가져올 수 없습니다.');
    }
    
    console.log('🔍 [DEBUG] 데이터베이스 연결 성공');
    
    const [rows] = await conn.query(
      `SELECT 
        store_id, store_name, store_address, store_bio,
        store_open_hour, store_close_hour, store_holiday,
        store_max_people_cnt, store_min_people_cnt, store_max_table_cnt, store_max_parking_cnt, store_max_screen_cnt,
        store_phonenumber, store_thumbnail, store_review_cnt, store_rating,
        business_number, owner_name, email
       FROM store_table 
       WHERE store_id = ?`,
      [storeId]
    );
    
    console.log('🔍 [DEBUG] 쿼리 결과:', rows);
    
    if (rows.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    // store_id는 문자열일 수도 있으므로 원본 값 유지
    const storeDetail = {
      ...rows[0],
      store_id: rows[0].store_id
    };
    
    return storeDetail;
  } catch (error) {
    console.error('❌ [ERROR] 가게 상세 정보 조회 오류:', error);
    console.error('❌ [ERROR] 오류 스택:', error.stack);
    console.error('❌ [ERROR] 오류 코드:', error.code);
    console.error('❌ [ERROR] 오류 메시지:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      error.message = 'store_table이 존재하지 않습니다. 데이터베이스를 초기화해주세요.';
    } else if (error.code === 'ECONNREFUSED') {
      error.message = '데이터베이스 서버에 연결할 수 없습니다. MySQL이 실행 중인지 확인해주세요.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      error.message = '데이터베이스 접근 권한이 없습니다.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      error.message = '데이터베이스가 존재하지 않습니다.';
    }
    
    if (!error.statusCode) {
      error.statusCode = 500;
      if (!error.message.includes('가게를 찾을 수 없습니다') && !error.message.includes('유효하지 않은 가게 ID')) {
        error.message = '가게 상세 정보 조회 중 오류가 발생했습니다.';
      }
    }
    throw error;
  }
};

// 가게 결제 정보 조회
exports.getStorePaymentInfo = async (storeId) => {
  const conn = getConnection();
  try {
    // storeId 유효성 확인
    if (!storeId || storeId.toString().trim() === '') {
      const err = new Error('유효하지 않은 가게 ID입니다.');
      err.statusCode = 400;
      throw err;
    }
    
    // 먼저 가게가 존재하는지 확인
    const [storeRows] = await conn.query(
      `SELECT store_id, business_number FROM store_table WHERE store_id = ?`,
      [storeId]
    );
    
    if (storeRows.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    // 결제 정보 테이블에서 조회 시도 (없으면 기본값 반환)
    try {
      const [paymentRows] = await conn.query(
        `SELECT store_id, bank_code, account_number, account_holder_name, business_number
         FROM store_payment_info WHERE store_id = ?`,
        [storeId]
      );
      
      if (paymentRows.length > 0) {
        return {
          ...paymentRows[0],
          store_id: paymentRows[0].store_id
        };
      }
    } catch (tableError) {
      // store_payment_info 테이블이 없는 경우
      console.log('⚠️ store_payment_info 테이블이 없습니다. 기본값을 반환합니다.');
    }
    
    // 기본값 반환
    return {
      store_id: storeId,
      bank_code: '000',
      account_number: '미설정',
      account_holder_name: '미설정',
      business_number: storeRows[0].business_number || '미설정'
    };
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
    // storeId 유효성 확인
    if (!storeId || storeId.toString().trim() === '') {
      const err = new Error('유효하지 않은 가게 ID입니다.');
      err.statusCode = 400;
      throw err;
    }
    
    // 먼저 가게가 존재하는지 확인
    const [storeRows] = await conn.query(
      `SELECT store_id FROM store_table WHERE store_id = ?`,
      [storeId]
    );
    
    if (storeRows.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    // 결제 정보 테이블이 있다면 업데이트, 없다면 기본값 반환
    try {
      // 결제 정보 테이블에 UPSERT (INSERT ON DUPLICATE KEY UPDATE)
      const [result] = await conn.query(
        `INSERT INTO store_payment_info (store_id, bank_code, account_number, account_holder_name, business_number)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         bank_code = VALUES(bank_code),
         account_number = VALUES(account_number),
         account_holder_name = VALUES(account_holder_name),
         business_number = VALUES(business_number)`,
        [storeId, bank_code, account_number, account_holder_name, business_number]
      );
    } catch (tableError) {
      // store_payment_info 테이블이 없는 경우
      console.log('⚠️ store_payment_info 테이블이 없습니다. 기본값을 반환합니다.');
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

// 🏪 사장님 아이디 중복 검사
exports.checkStoreIdDuplicate = async (store_id) => {
  const conn = getConnection();
  
  try {
    // 기본 검증
    if (!store_id || store_id.trim() === '') {
      return {
        success: false,
        message: '가게 ID를 입력해주세요.'
      };
    }

    // 아이디 길이 검증 (3-20자)
    if (store_id.length < 3 || store_id.length > 20) {
      return {
        success: false,
        message: '가게 ID는 3자 이상 20자 이하로 입력해주세요.'
      };
    }

    // 영문, 숫자, 언더스코어만 허용
    const idPattern = /^[a-zA-Z0-9_]+$/;
    if (!idPattern.test(store_id)) {
      return {
        success: false,
        message: '가게 ID는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.'
      };
    }

    // DB에서 중복 확인
    const [existingStores] = await conn.query(
      'SELECT store_id FROM store_table WHERE store_id = ?',
      [store_id]
    );

    if (existingStores.length > 0) {
      return {
        success: false,
        available: false,
        message: '이미 사용 중인 가게 ID입니다.'
      };
    }

    return {
      success: true,
      available: true,
      message: '사용 가능한 가게 ID입니다.'
    };

  } catch (error) {
    console.error('가게 ID 중복 확인 중 오류:', error);
    throw new Error('가게 ID 중복 확인 중 오류가 발생했습니다.');
  }
};

// 🆕 1단계: 기본 사업자 회원가입 (아이디/비번/이메일/휴대폰번호)
exports.registerStoreBasic = async (store_id, store_pwd, email, store_phonenumber) => {
  const conn = getConnection();
  
  try {
    // 아이디 중복 확인
    const [existingStores] = await conn.query(
      'SELECT store_id FROM store_table WHERE store_id = ?',
      [store_id]
    );

    if (existingStores.length > 0) {
      const err = new Error('이미 사용 중인 아이디입니다.');
      err.statusCode = 400;
      err.errorCode = 'STORE_ID_ALREADY_EXISTS';
      throw err;
    }

    // 비밀번호 해싱
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(store_pwd, salt);

    // 기본 정보만으로 가게 등록 (기본값 설정)
    const [result] = await conn.query(
      `INSERT INTO store_table (
        store_id, store_pwd, business_registration_status,
        store_name, owner_name, business_number, store_address, store_bio,
        store_open_hour, store_close_hour,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt, store_max_screen_cnt,
        store_phonenumber, store_holiday, store_thumbnail, store_review_cnt, store_rating,
        email, address_detail, postal_code,
        cancellation_policy, deposit_amount, available_times
      ) VALUES (?, ?, 'pending', 
        '새로운 매장', '사장님', '000-00-00000', '주소 미입력', '매장 소개를 입력해주세요',
        9, 22,
        50, 10, 20, 5,
        ?, '0', NULL, 0, 0,
        ?, '상세주소 미입력', '00000',
        '취소/환불 규정을 입력해주세요', 0, NULL
      )`,
      [store_id, hashedPassword, store_phonenumber, email]
    );

    return {
      store_id,
      business_registration_status: 'pending'
    };

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '기본 회원가입 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 2단계: 사업자 정보 등록
exports.completeBusinessRegistration = async (store_id, businessData) => {
  const conn = getConnection();
  
  try {
    console.log('🔍 사업자 정보 등록 시작:', { store_id, businessData });
    
    const {
      store_name,
      owner_name,
      business_number,
      postal_code,
      store_address,
      address_detail,
      business_certificate_url
    } = businessData;

    // 사업자등록번호 중복 확인
    const [existingStores] = await conn.query(
      'SELECT store_id FROM store_table WHERE business_number = ? AND store_id != ?',
      [business_number, store_id]
    );

    if (existingStores.length > 0) {
      const err = new Error('이미 등록된 사업자등록번호입니다.');
      err.statusCode = 400;
      err.errorCode = 'BUSINESS_NUMBER_ALREADY_EXISTS';
      throw err;
    }

    console.log('✅ 사업자등록번호 중복 확인 완료');

    // 사업자 정보 업데이트
    console.log('🔄 UPDATE 쿼리 실행 시작');
    const [updateResult] = await conn.query(
      `UPDATE store_table SET 
        store_name = ?, owner_name = ?, business_number = ?,
        postal_code = ?, store_address = ?, address_detail = ?,
        business_certificate_url = ?, business_registration_status = 'completed',
        registration_completed_at = NOW()
       WHERE store_id = ?`,
      [
        store_name, owner_name, business_number,
        postal_code, store_address, address_detail,
        business_certificate_url, store_id
      ]
    );

    console.log('📊 UPDATE 결과:', updateResult);
    console.log('📊 affectedRows:', updateResult.affectedRows);

    if (updateResult.affectedRows === 0) {
      const err = new Error('업데이트할 가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }

    console.log('✅ 사업자 정보 업데이트 완료');

    return {
      store_id,
      business_registration_status: 'completed'
    };

  } catch (error) {
    console.error('❌ 사업자 정보 등록 중 오류:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '사업자 정보 등록 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 사업자 등록 상태 확인
exports.checkBusinessRegistrationStatus = async (store_id) => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT 
        business_registration_status,
        store_name, owner_name, business_number,
        postal_code, address_main, address_detail,
        business_certificate_url, registration_completed_at
       FROM store_table 
       WHERE store_id = ?`,
      [store_id]
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
      error.message = '사업자 등록 상태 확인 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🏪 사장님 회원가입 서비스
exports.registerStore = async (storeData) => {
  const conn = getConnection();
  
  try {
    const {
      store_id,
      store_pwd,
      store_name,
      business_number,
      store_address,
      store_phonenumber,
      store_open_hour,
      store_close_hour,
      store_max_people_cnt,
      store_max_table_cnt,
      store_max_parking_cnt,
      store_max_screen_cnt,
      store_bio,
      store_holiday,
      store_review_cnt,
      store_rating
    } = storeData;

    // 사업자 등록번호 중복 확인
    const [existingStores] = await conn.query(
      'SELECT store_id FROM store_table WHERE business_number = ?',
      [business_number]
    );

    if (existingStores.length > 0) {
      const err = new Error('이미 등록된 사업자 등록번호입니다.');
      err.statusCode = 400;
      err.errorCode = 'BUSINESS_NUMBER_ALREADY_EXISTS';
      throw err;
    }

    // 비밀번호 해싱
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(store_pwd, salt);

    // 가게 등록 (존재하는 컬럼만 사용)
    const [result] = await conn.query(
      `INSERT INTO store_table (
        store_id, store_pwd, store_name, business_number, store_address,
        store_phonenumber, store_open_hour, store_close_hour,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt,
        store_max_screen_cnt, store_bio, store_holiday, store_review_cnt, store_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        store_id, hashedPassword, store_name, business_number, store_address,
        store_phonenumber, store_open_hour, store_close_hour,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt,
        store_max_screen_cnt, store_bio, store_holiday, store_review_cnt, store_rating
      ]
    );

    return {
      store_id,
      store_name,
      business_number
    };

  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '사장님 회원가입 중 오류가 발생했습니다.';
    }
    throw error;
  }
}; 

// 🆕 매장 정보 조회 (사장님 전용)
exports.getMyStoreInfo = async (store_id) => {
  const conn = getConnection();
  try {
    // 🐛 디버그 로그 추가
    console.log('🔍 [getMyStoreInfo] store_id:', store_id);
    // 기본 매장 정보 조회
    const [storeRows] = await conn.query(
      `SELECT 
        store_name, store_address, store_phonenumber, business_number,
        store_bio, store_open_hour, store_close_hour, store_holiday,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt, store_max_screen_cnt,
        store_thumbnail, store_review_cnt, store_rating,
        owner_name, email, address_detail, cancellation_policy, deposit_amount,
        available_times, postal_code, business_certificate_url
       FROM store_table 
       WHERE store_id = ?`,
      [store_id]
    );
    
    if (storeRows.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    const store = storeRows[0];
    
    // 메뉴 정보 조회 (store_menu 테이블이 있다고 가정)
    let menu = [];
    try {
      const [menuRows] = await conn.query(
        'SELECT name, price, description FROM store_menu WHERE store_id = ?',
        [store_id]
      );
      menu = menuRows;
    } catch (error) {
      // 메뉴 테이블이 없으면 빈 배열
      menu = [];
    }
    
    // 시설 정보 (DB에서 가져오기)
    let facilities = {};
    try {
      const [facilityRows] = await conn.query(
        'SELECT facility_type, facility_name, is_available FROM store_facilities WHERE store_id = ?',
        [store_id]
      );
      
      if (facilityRows.length > 0) {
        // DB에 있는 시설 정보 사용
        facilityRows.forEach(facility => {
          facilities[facility.facility_type] = {
            name: facility.facility_name,
            available: facility.is_available === 1
          };
        });
      } else {
        // 기본값으로 설정 (DB에 데이터가 없는 경우) - 이미지 기준으로 업데이트
        facilities = {
          wifi: { name: 'WiFi', available: true },
          restroom: { name: '화장실', available: true },
          tv_screen: { name: 'TV/스크린', available: store.store_max_screen_cnt > 0 },
          outlet: { name: '콘센트', available: true },
          parking: { name: '주차장', available: store.store_max_parking_cnt > 0 },
          no_smoking: { name: '금연구역', available: true },
          group_seating: { name: '단체석', available: true },
          smoking_area: { name: '흡연구역', available: false },
          wireless_charging: { name: '무선충전', available: false }
        };
      }
    } catch (error) {
      console.log('⚠️ [getMyStoreInfo] 시설 정보 조회 실패, 기본값 사용:', error.message);
      // 에러 발생 시 기본값 사용 - 이미지 기준으로 업데이트
      facilities = {
        wifi: { name: 'WiFi', available: true },
        restroom: { name: '화장실', available: true },
        tv_screen: { name: 'TV/스크린', available: store.store_max_screen_cnt > 0 },
        outlet: { name: '콘센트', available: true },
        parking: { name: '주차장', available: store.store_max_screen_cnt > 0 },
        no_smoking: { name: '금연구역', available: true },
        group_seating: { name: '단체석', available: true },
        smoking_area: { name: '흡연구역', available: false },
        wireless_charging: { name: '무선충전', available: false }
      };
    }
    
    // 사진 정보 (기본값)
    const photos = store.store_thumbnail ? store.store_thumbnail.split(',') : [];
    
    // 스포츠 카테고리 (기본값)
    const sports_categories = ['축구', '야구', '농구'];
    
    // 예약 설정 (DB에서 가져온 값 사용)
    const reservation_settings = {
      cancellation_policy: store.cancellation_policy || '취소/환불 규정',
      deposit_amount: store.deposit_amount || 0,
      available_times: (() => {
        if (!store.available_times) {
          return [
            { day: 'MON', start: '18:00', end: '24:00' },
            { day: 'TUE', start: '18:00', end: '24:00' },
            { day: 'WED', start: '18:00', end: '24:00' },
            { day: 'THU', start: '18:00', end: '24:00' },
            { day: 'FRI', start: '18:00', end: '24:00' },
            { day: 'SAT', start: '12:00', end: '24:00' },
            { day: 'SUN', start: '12:00', end: '22:00' }
          ];
        }
        
        // 이미 객체라면 그대로 반환, 문자열이라면 파싱
        if (typeof store.available_times === 'string') {
          try {
            return JSON.parse(store.available_times);
          } catch (e) {
            console.error('❌ available_times JSON 파싱 에러:', e);
            return [];
          }
        }
        
        return store.available_times;
      })()
    };
    
    // 알림 설정 (기본값)
    const notification_settings = {
      reservation_alerts: true,
      payment_alerts: true,
      system_alerts: true,
      marketing_alerts: false
    };
    
    // 결제 정보 (현재 테이블에 bank 정보가 없어서 기본값 설정)
    const payment_info = {
      bank_account_number: '미설정',
      bank_name: '미설정'
    };
    
    return {
      store_info: {
        store_name: store.store_name,
        address_main: store.store_address,
        address_detail: store.address_detail || store.store_address,
        phone_number: store.store_phonenumber,
        business_reg_no: store.business_number,
        owner_name: store.owner_name,
        email: store.email,
        postal_code: store.postal_code,  // 🆕 우편번호 추가
        bio: store.store_bio,
        menu: menu,
        facilities: facilities,
        photos: photos,
        sports_categories: sports_categories
      },
      reservation_settings: reservation_settings,
      notification_settings: notification_settings,
      payment_info: payment_info
    };
    
  } catch (error) {
    console.error('❌ [getMyStoreInfo] 에러 발생:', error);
    console.error('❌ [getMyStoreInfo] 에러 스택:', error.stack);
    console.error('❌ [getMyStoreInfo] SQL 에러:', error.sqlMessage);
    
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = `매장 정보 조회 중 오류가 발생했습니다: ${error.sqlMessage || error.message}`;
    }
    throw error;
  }
};

// 🆕 매장 기본 정보 수정 (사장님 전용)
exports.updateMyStoreBasicInfo = async (store_id, basicInfo) => {
  const conn = getConnection();
  const {
    store_name,
    store_address,
    address_detail,
    store_phonenumber,
    business_number,
    owner_name,
    postal_code,  // 🆕 postal_code 추가
    bio
  } = basicInfo;
  
  try {
    console.log('🔍 [updateMyStoreBasicInfo] 업데이트 시작:', {
      store_id,
      store_name,
      store_address,
      store_phonenumber,
      business_number,
      owner_name,
      postal_code,
      bio
    });
    
    // bio가 undefined일 때 기본값 설정
    const bioValue = bio || '매장 소개를 입력해주세요';
    
    const [result] = await conn.query(
      `UPDATE store_table 
       SET store_name = ?, store_address = ?, store_phonenumber = ?, 
           business_number = ?, owner_name = ?, postal_code = ?, store_bio = ?
       WHERE store_id = ?`,
      [store_name, store_address, store_phonenumber, business_number, 
       owner_name, postal_code, bioValue, store_id]
    );
    
    if (result.affectedRows === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    return {
      store_id,
      store_name,
      store_address,
      store_phonenumber,
      business_number,
      owner_name,
      postal_code,
      bio: bioValue
    };
  } catch (error) {
    console.error('❌ [updateMyStoreBasicInfo] SQL 에러:', error);
    console.error('❌ [updateMyStoreBasicInfo] SQL 메시지:', error.sqlMessage);
    
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = `매장 기본 정보 수정 중 오류가 발생했습니다: ${error.sqlMessage || error.message}`;
    }
    throw error;
  }
};

// 🆕 매장 상세 정보 수정 (사장님 전용)
exports.updateMyStoreDetails = async (store_id, details) => {
  const conn = getConnection();
  const { menu, facilities, photos, sports_categories, bio } = details;
  
  try {
    // 메뉴 정보 업데이트 (store_menu 테이블이 있다고 가정)
    if (menu && menu.length > 0) {
      // 기존 메뉴 삭제 후 새로 추가
      await conn.query('DELETE FROM store_menu WHERE store_id = ?', [store_id]);
      
      for (const menuItem of menu) {
        await conn.query(
          'INSERT INTO store_menu (store_id, name, price, description) VALUES (?, ?, ?, ?)',
          [store_id, menuItem.name, menuItem.price, menuItem.description]
        );
      }
    }
    
    // 시설 정보는 store_table의 관련 필드에 저장
    if (facilities) {
      const max_parking = facilities.parking ? 20 : 0;
      const max_screen = facilities.tv_screen ? 5 : 0;
      
      await conn.query(
        `UPDATE store_table 
         SET store_max_parking_cnt = ?, store_max_screen_cnt = ?
         WHERE store_id = ?`,
        [max_parking, max_screen, store_id]
      );
    }
    
    // 사진 정보 업데이트
    if (photos && photos.length > 0) {
      const photosString = photos.join(',');  // ✅ 모든 사진을 쉼표로 구분
      await conn.query(
        'UPDATE store_table SET store_thumbnail = ? WHERE store_id = ?',
        [photosString, store_id]
      );
    }
    
    // 🆕 매장 소개 업데이트
    if (bio !== undefined) {
      console.log('🔍 [updateMyStoreDetails] bio 업데이트:', bio);
      await conn.query(
        'UPDATE store_table SET store_bio = ? WHERE store_id = ?',
        [bio, store_id]
      );
      console.log('✅ [updateMyStoreDetails] bio 업데이트 완료');
    }
    
    // 🔍 실제 저장된 데이터 조회해서 반환
    const [updatedStore] = await conn.query(
      'SELECT store_bio FROM store_table WHERE store_id = ?',
      [store_id]
    );
    
    const finalBio = updatedStore[0]?.store_bio || '';
    console.log('🔍 [updateMyStoreDetails] 저장된 bio 값:', finalBio);
    
    return {
      store_id,
      menu: menu || [],
      facilities: facilities || {},
      photos: photos || [],
      sports_categories: sports_categories || [],
      bio: finalBio  // ✅ 실제 저장된 bio 값 반환
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '매장 상세 정보 수정 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 예약 설정 수정 (사장님 전용)
// 🆕 예약 설정 조회
exports.getMyStoreReservationSettings = async (store_id) => {
  const conn = getConnection();
  
  try {
    const [stores] = await conn.query(
      `SELECT 
         cancellation_policy, 
         deposit_amount, 
         available_times,
         store_max_people_cnt as max_participants,
         store_min_people_cnt as min_participants
       FROM store_table 
       WHERE store_id = ?`,
      [store_id]
    );
    
    console.log('🔍 [DEBUG] 조회된 매장 정보:', stores[0]);
    
    if (stores.length === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    const store = stores[0];
    
    return {
      cancellation_policy: store.cancellation_policy || '취소/환불 규정',
      deposit_amount: store.deposit_amount || 0,
      min_participants: store.min_participants || 2,
      max_participants: store.max_participants || 50,
      available_times: (() => {
        if (!store.available_times) {
          return [
            { day: 'MON', start: '09:00', end: '22:00' },
            { day: 'TUE', start: '09:00', end: '22:00' },
            { day: 'WED', start: '09:00', end: '22:00' },
            { day: 'THU', start: '09:00', end: '22:00' },
            { day: 'FRI', start: '09:00', end: '22:00' },
            { day: 'SAT', start: '09:00', end: '22:00' },
            { day: 'SUN', start: '09:00', end: '22:00' }
          ];
        }
        
        // 이미 객체라면 그대로 반환, 문자열이라면 파싱
        if (typeof store.available_times === 'string') {
          try {
            return JSON.parse(store.available_times);
          } catch (e) {
            console.error('❌ available_times JSON 파싱 에러:', e);
            return [];
          }
        }
        
        return store.available_times;
      })()
    };
  } catch (error) {
    console.error('❌ 예약 설정 조회 에러:', error);
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '예약 설정 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 은행 코드로 은행명 조회
async function getBankNameByCode(bankCode) {
  const bankNames = {
    '001': '한국은행',
    '002': '산업은행',
    '003': '기업은행',
    '004': '국민은행',
    '005': '하나은행',
    '006': '신한은행',
    '007': '우리은행',
    '008': '농협은행',
    '009': '수협은행',
    '010': '케이뱅크',
    '011': '카카오뱅크',
    '000': '미설정'
  };
  
  return bankNames[bankCode] || '미설정';
} 

// 🆕 사장님 대시보드 현황 조회
exports.getMyStoreDashboard = async (store_id) => {
  const conn = getConnection();
  try {
    // 오늘 승인된 예약 수 조회
    const [todayResult] = await conn.query(
      `SELECT COUNT(*) as count FROM reservation_table 
       WHERE store_id = ? AND DATE(reservation_start_time) = CURDATE() AND reservation_status = 1`,
      [store_id]
    );
    
    // 🐛 디버그 로그 추가
    console.log('🔍 [DASHBOARD DEBUG] store_id:', store_id);
    console.log('🔍 [DASHBOARD DEBUG] 오늘 승인된 예약 수:', todayResult[0].count);
    
    // 이번 주 승인된 예약 수 조회
    const [weekResult] = await conn.query(
      `SELECT COUNT(*) as count FROM reservation_table 
       WHERE store_id = ? AND YEARWEEK(reservation_start_time) = YEARWEEK(NOW()) AND reservation_status = 1`,
      [store_id]
    );
    
    // 승인 대기 중인 예약 수 조회
    const [pendingResult] = await conn.query(
      `SELECT COUNT(*) as count FROM reservation_table 
       WHERE store_id = ? AND reservation_status = 0`,
      [store_id]
    );
    
    // 평균 평점 조회
    const [ratingResult] = await conn.query(
      `SELECT AVG(store_rating) as avg_rating FROM store_table WHERE store_id = ?`,
      [store_id]
    );
    
    return {
      today_reservations_count: todayResult[0].count,        // 오늘 승인된 예약
      this_week_reservations_count: weekResult[0].count,     // 이번 주 승인된 예약
      pending_reservations_count: pendingResult[0].count,    // 승인 대기 중
      average_rating: ratingResult[0].avg_rating || 0
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '대시보드 정보 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 사장님 예약 목록 현황 조회
exports.getMyStoreReservations = async (store_id) => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT 
        r.reservation_id,
        r.reservation_match as match_name,
        r.reservation_bio as reservation_title,
        r.reservation_start_time,
        r.reservation_participant_cnt,
        r.reservation_max_participant_cnt,
        r.reservation_status,
        r.reservation_ex2,
        r.reservation_user_name as participant_names,
        r.selected_store_name,
        ps.total_amount,
        ps.payment_per_person,
        ps.payment_status,
        ps.started_at as payment_started_at,
        ps.completed_at as payment_completed_at
       FROM reservation_table r
       LEFT JOIN payment_sessions ps ON r.reservation_id = ps.chat_room_id
       WHERE r.selected_store_id = ?
       ORDER BY r.reservation_start_time DESC`,
      [store_id]
    );
    
    return rows.map(row => ({
      reservation_id: row.reservation_id,
      reservation_match: row.match_name || row.reservation_match || '경기 정보 없음',  // 경기명 매핑 수정
      reservation_title: row.reservation_title || '제목 없음',  // 예약 제목 추가
      reservation_start_time: row.reservation_start_time,
      reservation_participant_cnt: row.reservation_participant_cnt,
      reservation_max_participant_cnt: row.reservation_max_participant_cnt,
      reservation_participant_info: row.participant_names || '참가자 없음',
      reservation_table_info: '테이블 정보', // 실제 테이블 정보가 있다면 추가
      reservation_ex2: row.reservation_ex2,  // 🆕 ex2 정보 추가
      // 정산 정보 추가
      total_amount: row.total_amount,
      payment_per_person: row.payment_per_person,
      payment_status: row.payment_status,
      payment_started_at: row.payment_started_at,
      payment_completed_at: row.payment_completed_at,
      reservation_status: 
        row.reservation_status === 0 ? 'PENDING_APPROVAL' :
        row.reservation_status === 1 ? 'APPROVED' : 
        row.reservation_status === 2 ? 'PENDING_APPROVAL' : 'REJECTED'
    }));
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '예약 목록 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
}; 

// 🆕 스포츠 카테고리 조회
exports.getSportsCategories = async (store_id) => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT category_name, created_at FROM store_sports_categories WHERE store_id = ? ORDER BY created_at ASC',
      [store_id]
    );
    
    return rows.map(row => ({
      name: row.category_name,
      created_at: row.created_at
    }));
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '스포츠 카테고리 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 새 매장에 기본 스포츠 카테고리 추가
exports.initializeDefaultSportsCategories = async (store_id) => {
  const conn = getConnection();
  const defaultCategories = ['축구', '야구', '농구', '배구', '테니스'];
  
  try {
    for (const category of defaultCategories) {
      await conn.query(
        'INSERT IGNORE INTO store_sports_categories (store_id, category_name, created_at) VALUES (?, ?, NOW())',
        [store_id, category]
      );
    }
    console.log(`✅ [${store_id}] 기본 스포츠 카테고리 초기화 완료`);
  } catch (error) {
    console.error(`❌ [${store_id}] 기본 스포츠 카테고리 초기화 실패:`, error);
  }
};

// 🆕 스포츠 카테고리 추가
exports.addSportsCategory = async (store_id, category_name) => {
  const conn = getConnection();
  try {
    // 중복 체크
    const [existing] = await conn.query(
      'SELECT * FROM store_sports_categories WHERE store_id = ? AND category_name = ?',
      [store_id, category_name]
    );
    
    if (existing.length > 0) {
      const err = new Error(`'${category_name}' 카테고리가 이미 등록되어 있습니다.`);
      err.statusCode = 409;
      throw err;
    }
    
    // 카테고리 추가
    await conn.query(
      'INSERT INTO store_sports_categories (store_id, category_name, created_at) VALUES (?, ?, NOW())',
      [store_id, category_name]
    );
    
    return {
      store_id,
      category_name,
      message: '스포츠 카테고리가 추가되었습니다.'
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '스포츠 카테고리 추가 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 스포츠 카테고리 개별 삭제
exports.deleteSportsCategory = async (store_id, category_name) => {
  const conn = getConnection();
  try {
    // store_sports_categories 테이블에서 해당 카테고리 삭제
    const [result] = await conn.query(
      'DELETE FROM store_sports_categories WHERE store_id = ? AND category_name = ?',
      [store_id, category_name]
    );
    
    if (result.affectedRows === 0) {
      // 🔍 더 자세한 에러 메시지 제공
      const err = new Error(`삭제할 스포츠 카테고리 '${category_name}'를 찾을 수 없습니다. 등록된 카테고리를 확인해주세요.`);
      err.statusCode = 404;
      throw err;
    }
    
    return {
      success: true,
      message: '스포츠 카테고리가 삭제되었습니다.',
      deleted_category: category_name
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '스포츠 카테고리 삭제 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 예약 설정 수정 (최소 인원수 포함)
exports.updateMyStoreReservationSettings = async (store_id, settings) => {
  const conn = getConnection();
  const {
    cancellation_policy,
    deposit_amount,
    min_participants,
    max_participants,
    available_times
  } = settings;
  
  try {
    console.log('🔍 [DEBUG] 예약 설정 수정 시작:', { store_id, settings });
    console.log('🔍 [DEBUG] 파라미터들:', {
      cancellation_policy,
      deposit_amount,
      min_participants,
      max_participants,
      available_times
    });
    
    // store_table의 관련 필드 업데이트
    const [result] = await conn.query(
      `UPDATE store_table 
       SET cancellation_policy = ?, 
           deposit_amount = ?, 
           store_max_people_cnt = ?,
           store_min_people_cnt = ?, 
           available_times = ?
       WHERE store_id = ?`,
      [
        cancellation_policy || '취소/환불 규정', 
        deposit_amount || 0, 
        max_participants || 50,
        min_participants || 2,
        available_times ? JSON.stringify(available_times) : null,
        store_id
      ]
    );
    
    if (result.affectedRows === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    return {
      store_id,
      cancellation_policy,
      deposit_amount,
      min_participants: min_participants || 2,
      max_participants: max_participants || 50,
      available_times
    };
  } catch (error) {
    console.error('❌ [DEBUG] 예약 설정 수정 에러:', error);
    console.error('❌ [DEBUG] 에러 코드:', error.code);
    console.error('❌ [DEBUG] 에러 메시지:', error.message);
    console.error('❌ [DEBUG] SQL 상태:', error.sqlState);
    console.error('❌ [DEBUG] SQL 메시지:', error.sqlMessage);
    
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = `예약 설정 수정 중 오류가 발생했습니다: ${error.sqlMessage || error.message}`;
    }
    throw error;
  }
};

// 🆕 사업자 정보 수정
exports.updateMyStoreBusinessInfo = async (store_id, businessInfo) => {
  const conn = getConnection();
  const {
    store_name,
    owner_name,
    business_number,
    postal_code,
    store_address,
    address_detail,
    business_certificate_url
  } = businessInfo;
  
  try {
    // 사업자등록번호 중복 확인 (자신 제외)
    if (business_number) {
      const [existingStores] = await conn.query(
        'SELECT store_id FROM store_table WHERE business_number = ? AND store_id != ?',
        [business_number, store_id]
      );
      
      if (existingStores.length > 0) {
        const err = new Error('이미 등록된 사업자등록번호입니다.');
        err.statusCode = 400;
        err.errorCode = 'BUSINESS_NUMBER_ALREADY_EXISTS';
        throw err;
      }
    }
    
    // 사업자 정보 업데이트
    const [result] = await conn.query(
      `UPDATE store_table SET 
        store_name = ?, owner_name = ?, business_number = ?,
        postal_code = ?, store_address = ?, address_detail = ?,
        business_certificate_url = ?
       WHERE store_id = ?`,
      [
        store_name, owner_name, business_number,
        postal_code, store_address, address_detail,
        business_certificate_url, store_id
      ]
    );
    
    if (result.affectedRows === 0) {
      const err = new Error('업데이트할 가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    return {
      store_id,
      store_name,
      owner_name,
      business_number,
      postal_code,
      store_address,
      address_detail,
      business_certificate_url
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '사업자 정보 수정 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 사장님 비밀번호 변경
exports.updateStorePassword = async (store_id, current_password, new_password) => {
  const conn = getConnection();
  
  // 현재 비밀번호 확인
  const [rows] = await conn.query(
    'SELECT store_pwd FROM store_table WHERE store_id = ?', 
    [store_id]
  );
  
  if (rows.length === 0) {
    const err = new Error('매장을 찾을 수 없습니다.');
    err.statusCode = 404;
    throw err;
  }

  // bcrypt로 비밀번호 확인
  const isMatch = await bcrypt.compare(current_password, rows[0].store_pwd);
  if (!isMatch) {
    const err = new Error('기존 비밀번호가 일치하지 않습니다.');
    err.statusCode = 400;
    throw err;
  }

  // 새 비밀번호 해시화
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(new_password, salt);

  // 비밀번호 업데이트
  await conn.query(
    'UPDATE store_table SET store_pwd = ? WHERE store_id = ?',
    [hashedNewPassword, store_id]
  );
};

// 🆕 매장 회원 탈퇴
exports.deleteMyStore = async (store_id) => {
  const conn = getConnection();
  try {
    console.log(`🔍 [DEBUG] 매장 탈퇴 시작 - store_id: ${store_id}`);
    
    // 1. 관련된 예약 데이터 삭제
    console.log('🔍 [DEBUG] 예약 참여자 데이터 삭제 중...');
    await conn.query('DELETE FROM reservation_participant_table WHERE reservation_id IN (SELECT reservation_id FROM reservation_table WHERE store_id = ?)', [store_id]);
    
    console.log('🔍 [DEBUG] 예약 데이터 삭제 중...');
    await conn.query('DELETE FROM reservation_table WHERE store_id = ?', [store_id]);
    
    // 2. 리뷰 데이터 삭제
    console.log('🔍 [DEBUG] 리뷰 데이터 삭제 중...');
    await conn.query('DELETE FROM review_table WHERE store_id = ?', [store_id]);
    
    // 3. 스포츠 카테고리 삭제
    console.log('🔍 [DEBUG] 스포츠 카테고리 삭제 중...');
    await conn.query('DELETE FROM store_sports_categories WHERE store_id = ?', [store_id]);
    
    // 4. 매장 테이블에서 삭제
    console.log('🔍 [DEBUG] 매장 정보 삭제 중...');
    await conn.query('DELETE FROM store_table WHERE store_id = ?', [store_id]);
    
    console.log('✅ [DEBUG] 매장 탈퇴 완료');
    
    return {
      success: true,
      message: '매장 계정이 완전히 삭제되었습니다.'
    };
    
  } catch (error) {
    console.error('❌ [deleteMyStore] 에러 발생:', error);
    console.error('❌ [deleteMyStore] 에러 스택:', error.stack);
    console.error('❌ [deleteMyStore] SQL 에러:', error.sqlMessage);
    
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = `매장 탈퇴 중 오류가 발생했습니다: ${error.sqlMessage || error.message}`;
    }
    throw error;
  }
}; 

// 🆕 편의시설 관리 API들
// 편의시설 목록 조회
exports.getStoreFacilities = async (store_id) => {
  const conn = getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT id, facility_type, facility_name, is_available FROM store_facilities WHERE store_id = ? ORDER BY facility_type',
      [store_id]
    );
    return rows;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '편의시설 조회 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 편의시설 추가
exports.addStoreFacility = async (store_id, facility_type, facility_name) => {
  const conn = getConnection();
  try {
    const [result] = await conn.query(
      'INSERT INTO store_facilities (store_id, facility_type, facility_name, is_available) VALUES (?, ?, ?, 1)',
      [store_id, facility_type, facility_name]
    );
    
    return {
      id: result.insertId,
      facility_type,
      facility_name,
      is_available: 1
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '편의시설 추가 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 편의시설 수정
exports.updateStoreFacility = async (facility_id, facility_type, facility_name, is_available) => {
  const conn = getConnection();
  try {
    await conn.query(
      'UPDATE store_facilities SET facility_type = ?, facility_name = ?, is_available = ? WHERE id = ?',
      [facility_type, facility_name, is_available ? 1 : 0, facility_id]
    );
    
    return {
      id: facility_id,
      facility_type,
      facility_name,
      is_available: is_available ? 1 : 0
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '편의시설 수정 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 편의시설 삭제
exports.deleteStoreFacility = async (facility_id) => {
  const conn = getConnection();
  try {
    await conn.query('DELETE FROM store_facilities WHERE id = ?', [facility_id]);
    
    return {
      success: true,
      message: '편의시설이 삭제되었습니다.'
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '편의시설 삭제 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 편의시설 사용 가능 여부 토글
exports.toggleFacilityAvailability = async (facility_id) => {
  const conn = getConnection();
  try {
    const [current] = await conn.query(
      'SELECT is_available FROM store_facilities WHERE id = ?',
      [facility_id]
    );
    
    if (current.length === 0) {
      const err = new Error('편의시설을 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    const newStatus = current[0].is_available === 1 ? 0 : 1;
    
    await conn.query(
      'UPDATE store_facilities SET is_available = ? WHERE id = ?',
      [newStatus, facility_id]
    );
    
    return {
      id: facility_id,
      is_available: newStatus
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '편의시설 상태 변경 중 오류가 발생했습니다.';
    }
    throw error;
  }
}; 