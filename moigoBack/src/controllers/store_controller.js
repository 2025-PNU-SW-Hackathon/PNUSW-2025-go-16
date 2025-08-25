// 🏪 storeController.js
// 요청을 받아 가게 관련 서비스로 전달하고 응답 처리

const storeService = require('../services/store_service');

// 🔍 가게 목록 조회 컨트롤러
exports.getStoreList = async (req, res, next) => {
  try {
    const { region, date, category, keyword } = req.query;
    
    const filters = {
      region: region || null,
      date: date || null,
      category: category || null,
      keyword: keyword || null
    };

    const data = await storeService.getStoreList(filters);

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// 가게 상세 정보 조회
exports.getStoreDetail = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    console.log('🔍 [getStoreDetail] 요청된 storeId:', storeId);
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: '가게 ID가 필요합니다.'
      });
    }
    
    // storeId를 숫자로 변환
    const numericStoreId = parseInt(storeId, 10);
    
    if (isNaN(numericStoreId) || numericStoreId <= 0) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 가게 ID입니다.'
      });
    }
    
    const storeDetail = await storeService.getStoreDetail(numericStoreId);
    console.log('✅ [getStoreDetail] 조회 성공:', storeDetail);
    
    res.json({ success: true, data: storeDetail });
  } catch (err) {
    console.error('❌ [getStoreDetail] 에러 발생:', err);
    next(err);
  }
};

// 가게 결제 정보 조회
exports.getStorePaymentInfo = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    
    // storeId를 숫자로 변환
    const numericStoreId = parseInt(storeId, 10);
    
    if (isNaN(numericStoreId) || numericStoreId <= 0) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 가게 ID입니다.'
      });
    }
    
    const paymentInfo = await storeService.getStorePaymentInfo(numericStoreId);
    res.json({ success: true, data: paymentInfo });
  } catch (err) {
    next(err);
  }
};

// 가게 결제 정보 수정
exports.updateStorePaymentInfo = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { bank_code, account_number, account_holder_name, business_number } = req.body;
    
    // storeId를 숫자로 변환
    const numericStoreId = parseInt(storeId, 10);
    
    if (isNaN(numericStoreId) || numericStoreId <= 0) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 가게 ID입니다.'
      });
    }
    
    // 기본 유효성 검사
    if (!bank_code || !account_number || !account_holder_name) {
      return res.status(400).json({
        success: false,
        message: '은행 코드, 계좌번호, 예금주명은 필수입니다.'
      });
    }

    const result = await storeService.updateStorePaymentInfo(numericStoreId, {
      bank_code,
      account_number,
      account_holder_name,
      business_number
    });

    res.json({
      success: true,
      message: '결제 정보가 수정되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 은행 코드 목록 조회
exports.getBankCodes = async (req, res, next) => {
  try {
    const bankCodes = await storeService.getBankCodes();
    res.json({ success: true, data: bankCodes });
  } catch (err) {
    next(err);
  }
};

// 🆕 매장 정보 조회 (사장님 전용)
exports.getMyStoreInfo = async (req, res, next) => {
  try {
    const store_id = req.user.store_id; // JWT에서 추출된 store_id
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const storeInfo = await storeService.getMyStoreInfo(store_id);
    res.json({
      success: true,
      data: storeInfo
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 매장 기본 정보 수정 (사장님 전용)
exports.updateMyStoreBasicInfo = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const {
      store_name,
      store_address,        // 🆕 API 명세서와 일치하도록 수정
      address_detail,
      store_phonenumber,    // 🆕 API 명세서와 일치하도록 수정
      business_number,      // 🆕 API 명세서와 일치하도록 수정
      owner_name,
      postal_code,          // 🆕 우편번호 추가
      bio
    } = req.body;

    // 필수 필드 검증
    if (!store_name || !store_address || !store_phonenumber) {
      return res.status(400).json({
        success: false,
        message: '가게명, 주소, 전화번호는 필수입니다.'
      });
    }

    const result = await storeService.updateMyStoreBasicInfo(store_id, {
      store_name,
      store_address,        // 🆕 직접 전달
      address_detail,
      store_phonenumber,    // 🆕 직접 전달
      business_number,      // 🆕 직접 전달
      owner_name,
      postal_code,          // 🆕 우편번호 추가
      bio
    });

    res.json({
      success: true,
      message: '매장 기본 정보가 수정되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 매장 상세 정보 수정 (사장님 전용)
exports.updateMyStoreDetails = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const {
      menu,
      facilities,
      photos,
      sports_categories,
      bio  // 🆕 매장 소개 필드 추가
    } = req.body;

    const result = await storeService.updateMyStoreDetails(store_id, {
      menu,
      facilities,
      photos,
      sports_categories,
      bio  // 🆕 매장 소개 필드 추가
    });

    res.json({
      success: true,
      message: '매장 상세 정보가 수정되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 예약 설정 조회 (사장님 전용)
exports.getMyStoreReservationSettings = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const result = await storeService.getMyStoreReservationSettings(store_id);

    res.json({
      success: true,
      message: '예약 설정 조회가 성공적으로 완료되었습니다.',
      data: result
    });

  } catch (err) {
    console.error('❌ 예약 설정 조회 실패:', err);
    err.message = '예약 설정 조회 중 오류가 발생했습니다.';
    err.statusCode = 500;
    next(err);
  }
};

// 🏪 사장님 아이디 중복 검사 컨트롤러
exports.checkStoreIdDuplicate = async (req, res, next) => {
  try {
    const { store_id } = req.body;

    // 기본 검증
    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: '가게 ID를 입력해주세요.'
      });
    }

    const result = await storeService.checkStoreIdDuplicate(store_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// 🏪 사장님 회원가입 컨트롤러
exports.registerStore = async (req, res, next) => {
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
      store_holiday
    } = req.body;

    // 필수 필드 검증
    if (!store_id || !store_pwd || !store_name || !business_number || !store_address || !store_phonenumber) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다. (store_id, store_pwd, store_name, business_number, store_address, store_phonenumber)'
      });
    }

    const storeData = {
      store_id,
      store_pwd,
      store_name,
      business_number,
      store_address,
      store_phonenumber,
      store_open_hour: store_open_hour || 9,
      store_close_hour: store_close_hour || 22,
      store_max_people_cnt: store_max_people_cnt || 50,
      store_max_table_cnt: store_max_table_cnt || 10,
      store_max_parking_cnt: store_max_parking_cnt || 20,
      store_max_screen_cnt: store_max_screen_cnt || 5,
      store_bio: store_bio || '좋은 가게입니다.',
      store_holiday: store_holiday || 0,
      store_review_cnt: 0,
      store_rating: 0
    };

    const result = await storeService.registerStore(storeData);
    
    res.status(201).json({
      success: true,
      message: '사장님 회원가입이 완료되었습니다.',
      data: {
        store_id: result.store_id,
        store_name: result.store_name,
        business_number: result.business_number
      }
    });
  } catch (err) {
    next(err);
  }
}; 

// src/controllers/store_controller.js에 추가
exports.getMyStoreDashboard = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    const dashboardData = await storeService.getMyStoreDashboard(store_id);
    res.json({ success: true, data: dashboardData });
  } catch (err) {
    next(err);
  }
};

// 🆕 사장님 대시보드 현황 조회
exports.getMyStoreDashboard = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const dashboardData = await storeService.getMyStoreDashboard(store_id);
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 사장님 예약 목록 현황 조회
exports.getMyStoreReservations = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const reservations = await storeService.getMyStoreReservations(store_id);
    res.json({
      success: true,
      data: reservations
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 1단계: 기본 사업자 회원가입 (아이디/비번/이메일/휴대폰번호)
exports.registerStoreBasic = async (req, res, next) => {
  try {
    const { store_id, store_pwd, email, store_phonenumber } = req.body;

    // 필수 필드 검증
    if (!store_id || !store_pwd || !email || !store_phonenumber) {
      return res.status(400).json({
        success: false,
        message: '아이디, 비밀번호, 이메일, 휴대폰번호는 필수입니다.'
      });
    }

    const result = await storeService.registerStoreBasic(store_id, store_pwd, email, store_phonenumber);
    
    res.status(201).json({
      success: true,
      message: '기본 회원가입이 완료되었습니다. 사업자 정보를 입력해주세요.',
      data: {
        store_id: result.store_id,
        business_registration_status: 'pending'
      }
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 2단계: 사업자 정보 등록
exports.completeBusinessRegistration = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const {
      store_name,
      owner_name,
      business_number,
      postal_code,
      store_address,
      address_detail,
      business_certificate_url
    } = req.body;

    // 필수 필드 검증
    if (!store_name || !owner_name || !business_number || !postal_code || !store_address) {
      return res.status(400).json({
        success: false,
        message: '필수 필드를 모두 입력해주세요.'
      });
    }

    const result = await storeService.completeBusinessRegistration(storeId, {
      store_name,
      owner_name,
      business_number,
      postal_code,
      store_address,
      address_detail,
      business_certificate_url
    });

    res.json({
      success: true,
      message: '사업자 등록이 완료되었습니다. 로그인해주세요.',
      data: {
        store_id: result.store_id,
        business_registration_status: 'completed'
      }
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 사업자 등록 상태 확인
exports.checkBusinessRegistrationStatus = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const status = await storeService.checkBusinessRegistrationStatus(storeId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 스포츠 카테고리 조회
exports.getSportsCategories = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }
    
    const categories = await storeService.getSportsCategories(store_id);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 스포츠 카테고리 추가
exports.addSportsCategory = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    const { category_name } = req.body;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }
    
    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: '카테고리명은 필수입니다.'
      });
    }
    
    const result = await storeService.addSportsCategory(store_id, category_name);
    
    res.json({
      success: true,
      message: '스포츠 카테고리가 추가되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 스포츠 카테고리 개별 삭제
exports.deleteSportsCategory = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    const { category_name } = req.params;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }
    
    const result = await storeService.deleteSportsCategory(store_id, category_name);
    
    res.json({
      success: true,
      message: '스포츠 카테고리가 삭제되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 예약 설정 수정 (최소 인원수 포함)
exports.updateMyStoreReservationSettings = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }
    
    const {
      cancellation_policy,
      deposit_amount,
      min_participants,
      max_participants,
      available_times
    } = req.body;
    
    const result = await storeService.updateMyStoreReservationSettings(store_id, {
      cancellation_policy,
      deposit_amount,
      min_participants,
      max_participants,
      available_times
    });
    
    res.json({
      success: true,
      message: '예약 설정이 수정되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 사업자 정보 수정
exports.updateMyStoreBusinessInfo = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }
    
    const {
      store_name,
      owner_name,
      business_number,
      postal_code,
      store_address,
      address_detail,
      business_certificate_url
    } = req.body;
    
    const result = await storeService.updateMyStoreBusinessInfo(store_id, {
      store_name,
      owner_name,
      business_number,
      postal_code,
      store_address,
      address_detail,
      business_certificate_url
    });
    
    res.json({
      success: true,
      message: '사업자 정보가 수정되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 사장님 비밀번호 변경
exports.updateStorePassword = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    const { old_password, new_password } = req.body;
    const current_password = old_password;  // old_password를 current_password로 매핑

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.'
      });
    }

    await storeService.updateStorePassword(store_id, current_password, new_password);

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (err) {
    console.error('비밀번호 변경 중 오류:', err);
    next(err);
  }
};

// 🆕 매장 회원 탈퇴
exports.deleteMyStore = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }
    
    const result = await storeService.deleteMyStore(store_id);
    
    res.json({
      success: true,
      message: '매장 계정이 완전히 삭제되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 🆕 편의시설 관리 컨트롤러들
// 편의시설 목록 조회
exports.getStoreFacilities = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const facilities = await storeService.getStoreFacilities(store_id);
    
    res.json({
      success: true,
      data: facilities
    });
  } catch (err) {
    next(err);
  }
};

// 편의시설 추가
exports.addStoreFacility = async (req, res, next) => {
  try {
    const store_id = req.user.store_id;
    const { facility_type, facility_name } = req.body;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    if (!facility_type || !facility_name) {
      return res.status(400).json({
        success: false,
        message: '시설 유형과 시설명은 필수입니다.'
      });
    }

    const result = await storeService.addStoreFacility(store_id, facility_type, facility_name);
    
    res.json({
      success: true,
      message: '편의시설이 추가되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 편의시설 수정
exports.updateStoreFacility = async (req, res, next) => {
  try {
    const { facility_id } = req.params;
    const { facility_type, facility_name, is_available } = req.body;
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    if (!facility_type || !facility_name) {
      return res.status(400).json({
        success: false,
        message: '시설 유형과 시설명은 필수입니다.'
      });
    }

    const result = await storeService.updateStoreFacility(facility_id, facility_type, facility_name, is_available);
    
    res.json({
      success: true,
      message: '편의시설이 수정되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 편의시설 삭제
exports.deleteStoreFacility = async (req, res, next) => {
  try {
    const { facility_id } = req.params;
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const result = await storeService.deleteStoreFacility(facility_id);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// 편의시설 사용 가능 여부 토글
exports.toggleFacilityAvailability = async (req, res, next) => {
  try {
    const { facility_id } = req.params;
    const store_id = req.user.store_id;
    
    if (!store_id) {
      return res.status(401).json({
        success: false,
        message: '사장님 계정으로만 접근 가능합니다.'
      });
    }

    const result = await storeService.toggleFacilityAvailability(facility_id);
    
    res.json({
      success: true,
      message: '편의시설 상태가 변경되었습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};