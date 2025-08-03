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