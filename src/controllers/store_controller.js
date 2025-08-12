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
    const storeDetail = await storeService.getStoreDetail(storeId);
    res.json({ success: true, data: storeDetail });
  } catch (err) {
    next(err);
  }
};

// 가게 결제 정보 조회
exports.getStorePaymentInfo = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const paymentInfo = await storeService.getStorePaymentInfo(storeId);
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
    
    // 기본 유효성 검사
    if (!bank_code || !account_number || !account_holder_name) {
      return res.status(400).json({
        success: false,
        message: '은행 코드, 계좌번호, 예금주명은 필수입니다.'
      });
    }

    const result = await storeService.updateStorePaymentInfo(storeId, {
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