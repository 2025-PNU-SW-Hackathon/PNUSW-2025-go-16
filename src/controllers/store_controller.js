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