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

    // 가게 등록
    const [result] = await conn.query(
      `INSERT INTO store_table (
        store_id, store_pwd, store_name, business_number, store_address,
        store_phonenumber, store_open_hour, store_close_hour,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt,
        store_max_screen_cnt, store_bio, store_holiday, store_review_cnt, store_rating,
        ex1, ex2, bank_code, account_number, account_holder_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        store_id, hashedPassword, store_name, business_number, store_address,
        store_phonenumber, store_open_hour, store_close_hour,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt,
        store_max_screen_cnt, store_bio, store_holiday, store_review_cnt, store_rating,
        '기본값', '기본값', '000', '000000000000', '가게명'
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
    // 기본 매장 정보 조회
    const [storeRows] = await conn.query(
      `SELECT 
        store_name, store_address, store_phonenumber, business_number,
        store_bio, store_open_hour, store_close_hour, store_holiday,
        store_max_people_cnt, store_max_table_cnt, store_max_parking_cnt, store_max_screen_cnt,
        store_thumbnail, store_review_cnt, store_rating,
        bank_code, account_number, account_holder_name
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
    
    // 시설 정보 (기본값으로 설정)
    const facilities = {
      wifi: true,
      parking: store.store_max_parking_cnt > 0,
      restroom: true,
      no_smoking: true,
      sound_system: true,
      private_room: false,
      tv_screen: store.store_max_screen_cnt > 0,
      booth_seating: true
    };
    
    // 사진 정보 (기본값)
    const photos = store.store_thumbnail ? [store.store_thumbnail] : [];
    
    // 스포츠 카테고리 (기본값)
    const sports_categories = ['축구', '야구', '농구'];
    
    // 예약 설정 (기본값)
    const reservation_settings = {
      cancellation_policy: '취소/환불 규정',
      deposit_amount: 5000,
      available_times: [
        { day: 'MON', start: '18:00', end: '24:00' },
        { day: 'TUE', start: '18:00', end: '24:00' },
        { day: 'WED', start: '18:00', end: '24:00' },
        { day: 'THU', start: '18:00', end: '24:00' },
        { day: 'FRI', start: '18:00', end: '24:00' },
        { day: 'SAT', start: '12:00', end: '24:00' },
        { day: 'SUN', start: '12:00', end: '22:00' }
      ]
    };
    
    // 알림 설정 (기본값)
    const notification_settings = {
      reservation_alerts: true,
      payment_alerts: true,
      system_alerts: true,
      marketing_alerts: false
    };
    
    // 결제 정보
    const payment_info = {
      bank_account_number: store.account_number || '000000000000',
      bank_name: await getBankNameByCode(store.bank_code || '000')
    };
    
    return {
      store_info: {
        store_name: store.store_name,
        address_main: store.store_address,
        address_detail: store.store_address,
        phone_number: store.store_phonenumber,
        business_reg_no: store.business_number,
        owner_name: store.store_name,
        email: 'store@example.com',
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
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '매장 정보 조회 중 오류가 발생했습니다.';
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
    email,
    bio
  } = basicInfo;
  
  try {
    const [result] = await conn.query(
      `UPDATE store_table 
       SET store_name = ?, store_address = ?, store_phonenumber = ?, 
           business_number = ?, store_bio = ?
       WHERE store_id = ?`,
      [store_name, store_address, store_phonenumber, business_number, bio, store_id]
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
      bio
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '매장 기본 정보 수정 중 오류가 발생했습니다.';
    }
    throw error;
  }
};

// 🆕 매장 상세 정보 수정 (사장님 전용)
exports.updateMyStoreDetails = async (store_id, details) => {
  const conn = getConnection();
  const { menu, facilities, photos, sports_categories } = details;
  
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
      await conn.query(
        'UPDATE store_table SET store_thumbnail = ? WHERE store_id = ?',
        [photos[0], store_id]
      );
    }
    
    return {
      store_id,
      menu: menu || [],
      facilities: facilities || {},
      photos: photos || [],
      sports_categories: sports_categories || []
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
exports.updateMyStoreReservationSettings = async (store_id, settings) => {
  const conn = getConnection();
  const { cancellation_policy, deposit_amount, available_times } = settings;
  
  try {
    console.log('🔍 예약 설정 수정 시작:', { store_id, settings });
    
    // 예약 설정을 기존 필드들에 저장
    // store_bio에 취소 정책, store_holiday에 예약금 정보 저장
    const bioUpdate = cancellation_policy || '취소/환불 규정';
    const holidayUpdate = deposit_amount || 0;
    
    console.log('📝 저장할 데이터:', { bioUpdate, holidayUpdate });
    
    const [result] = await conn.query(
      `UPDATE store_table 
       SET store_bio = ?, store_holiday = ?
       WHERE store_id = ?`,
      [bioUpdate, holidayUpdate, store_id]
    );
    
    console.log('✅ 쿼리 실행 결과:', result);
    
    if (result.affectedRows === 0) {
      const err = new Error('가게를 찾을 수 없습니다.');
      err.statusCode = 404;
      throw err;
    }
    
    return {
      cancellation_policy: bioUpdate,
      deposit_amount: holidayUpdate,
      available_times: available_times || []
    };
  } catch (error) {
    console.error('❌ 예약 설정 수정 에러 상세:', error);
    console.error('❌ 에러 스택:', error.stack);
    
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '예약 설정 수정 중 오류가 발생했습니다.';
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
    // 오늘 예약 수 조회
    const [todayResult] = await conn.query(
      `SELECT COUNT(*) as count FROM reservation_table 
       WHERE store_id = ? AND DATE(reservation_start_time) = CURDATE()`,
      [store_id]
    );
    
    // 이번 주 예약 수 조회
    const [weekResult] = await conn.query(
      `SELECT COUNT(*) as count FROM reservation_table 
       WHERE store_id = ? AND YEARWEEK(reservation_start_time) = YEARWEEK(NOW())`,
      [store_id]
    );
    
    // 평균 평점 조회
    const [ratingResult] = await conn.query(
      `SELECT AVG(store_rating) as avg_rating FROM store_table WHERE store_id = ?`,
      [store_id]
    );
    
    return {
      today_reservations_count: todayResult[0].count,
      this_week_reservations_count: weekResult[0].count,
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
        r.reservation_match,
        r.reservation_start_time,
        r.reservation_participant_cnt,
        r.reservation_max_participant_cnt,
        r.reservation_status,
        GROUP_CONCAT(u.user_name SEPARATOR ', ') as participant_names
       FROM reservation_table r
       LEFT JOIN reservation_participant_table rp ON r.reservation_id = rp.reservation_id
       LEFT JOIN user_table u ON rp.user_id = u.user_id
       WHERE r.store_id = ?
       GROUP BY r.reservation_id
       ORDER BY r.reservation_start_time DESC`,
      [store_id]
    );
    
    return rows.map(row => ({
      reservation_id: row.reservation_id,
      reservation_match: row.reservation_match,
      reservation_start_time: row.reservation_start_time,
      reservation_participant_info: row.participant_names || '참가자 없음',
      reservation_table_info: '테이블 정보', // 실제 테이블 정보가 있다면 추가
      reservation_status: row.reservation_status === 0 ? 'PENDING_APPROVAL' : 'CONFIRMED'
    }));
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '예약 목록 조회 중 오류가 발생했습니다.';
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
      const err = new Error('삭제할 스포츠 카테고리를 찾을 수 없습니다.');
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
    // store_table의 관련 필드 업데이트
    const [result] = await conn.query(
      `UPDATE store_table 
       SET cancellation_policy = ?, deposit_amount = ?, 
           store_max_people_cnt = ?, ex1 = ?
       WHERE store_id = ?`,
      [cancellation_policy, deposit_amount, max_participants || 50, min_participants || 2, store_id]
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
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '예약 설정 수정 중 오류가 발생했습니다.';
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

// 🆕 매장 회원 탈퇴
exports.deleteMyStore = async (store_id) => {
  const conn = getConnection();
  try {
    // 트랜잭션 시작
    await conn.beginTransaction();
    
    try {
      // 1. 관련된 예약 데이터 삭제
      await conn.query('DELETE FROM reservation_participant_table WHERE reservation_id IN (SELECT reservation_id FROM reservation_table WHERE store_id = ?)', [store_id]);
      await conn.query('DELETE FROM reservation_table WHERE store_id = ?', [store_id]);
      
      // 2. 리뷰 데이터 삭제
      await conn.query('DELETE FROM review_table WHERE store_id = ?', [store_id]);
      
      // 3. 채팅방 관련 데이터 삭제
      await conn.query('DELETE FROM chat_room_users WHERE reservation_id IN (SELECT reservation_id FROM reservation_table WHERE store_id = ?)', [store_id]);
      await conn.query('DELETE FROM chat_rooms WHERE reservation_id IN (SELECT reservation_id FROM reservation_table WHERE store_id = ?)', [store_id]);
      await conn.query('DELETE FROM chat_messages WHERE chat_room_id IN (SELECT id FROM chat_rooms WHERE reservation_id IN (SELECT reservation_id FROM reservation_table WHERE store_id = ?))', [store_id]);
      
      // 4. 결제 관련 데이터 삭제
      await conn.query('DELETE FROM payment_table WHERE chat_room_id IN (SELECT id FROM chat_rooms WHERE reservation_id IN (SELECT reservation_id FROM reservation_table WHERE store_id = ?))', [store_id]);
      await conn.query('DELETE FROM payment_request_table WHERE chat_room_id IN (SELECT id FROM chat_rooms WHERE reservation_id IN (SELECT reservation_id FROM reservation_table WHERE store_id = ?))', [store_id]);
      
      // 5. 매장 관련 테이블 데이터 삭제
      await conn.query('DELETE FROM store_menu WHERE store_id = ?', [store_id]);
      await conn.query('DELETE FROM store_facilities WHERE store_id = ?', [store_id]);
      await conn.query('DELETE FROM store_photos WHERE store_id = ?', [store_id]);
      await conn.query('DELETE FROM store_sports_categories WHERE store_id = ?', [store_id]);
      await conn.query('DELETE FROM store_payment_info WHERE store_id = ?', [store_id]);
      
      // 6. 매장 테이블에서 삭제
      await conn.query('DELETE FROM store_table WHERE store_id = ?', [store_id]);
      
      // 트랜잭션 커밋
      await conn.commit();
      
      return {
        success: true,
        message: '매장 계정이 완전히 삭제되었습니다.'
      };
      
    } catch (error) {
      // 오류 발생 시 롤백
      await conn.rollback();
      throw error;
    }
    
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = '매장 탈퇴 중 오류가 발생했습니다.';
    }
    throw error;
  }
}; 