// controllers/match_controller.js
const matchService = require('../services/match_service');

exports.listMatches = async (req, res) => {
  try {
    const {
      competition_code,
      status,
      date_from,
      date_to,
      home,
      away,
      venue,
      category,
      team,           // ✅ 통합 구단명 검색
      sort = 'match_date:asc',
      page = '1',
      page_size = '20',
      all,            // ✅ 전체 조회 스위치 (all=true)
    } = req.query;

    // 전체 조회 여부 판단
    const isAll = (String(all).toLowerCase() === 'true') || (String(page_size).toLowerCase() === 'all');

    // 페이지 파라미터
    const pageNum = isAll ? 1 : Math.max(parseInt(page, 10) || 1, 1);
    const pageSizeNum = isAll ? null : Math.min(Math.max(parseInt(page_size, 10) || 20, 1), 100);

    const { rows, total, sortField, sortDir, filters } = await matchService.getMatches({
      competition_code,
      status,
      date_from,
      date_to,
      home,
      away,
      venue,
      category,
      team,
      sort,
      page: pageNum,
      page_size: pageSizeNum,
      all: isAll,
    });

    return res.json({
      success: true,
      meta: {
        page: pageNum,
        page_size: pageSizeNum ?? rows.length,
        total,
        total_pages: pageSizeNum ? Math.ceil(total / pageSizeNum) : 1,
        sort: `${sortField}:${sortDir}`,
        filters,
      },
      data: rows,
    });
  } catch (err) {
    if (err?.code === 'INVALID_PARAMETER') {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_PARAMETER',
        message: err.message || 'Invalid parameter',
      });
    }
    console.error('[matches] list error:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
};