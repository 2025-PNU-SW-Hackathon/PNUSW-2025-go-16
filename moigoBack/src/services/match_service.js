// services/match_service.js
const { getConnection } = require('../config/db_config');

exports.getMatches = async (opts) => {
  const conn = getConnection();

  const {
    competition_code,
    status,
    date_from,
    date_to,
    home,
    away,
    venue,
    category,
    team,                 // ✅ 구단 통합 검색
    sort = 'match_date:asc',
    page = 1,
    page_size = 20,       // null 이면 전체
    all = false,          // ✅ 전체 조회 스위치
  } = opts;

  // 정렬 화이트리스트
  const sortableFields = new Set(['match_date', 'id']);
  let [sortField, sortDir] = String(sort).split(':');
  sortField = sortableFields.has(sortField) ? sortField : 'match_date';
  sortDir = (sortDir || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

  // WHERE
  const where = [];
  const params = [];
  const filters = {};

  // ✅ 날짜 파라미터 보정(YYYY-MM-DD만 들어오면 시/분/초 보정)
  const normalizeDate = (s, end = false) => {
    if (!s) return s;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return end ? `${s} 23:59:59` : `${s} 00:00:00`;
    }
    return s;
  };
  const df = normalizeDate(date_from, false);
  const dt = normalizeDate(date_to, true);

  // ✅ 명시적 날짜 필터가 없을 때만 "시작 전 경기" 자동 필터 적용
  if (!df && !dt) {
    where.push('match_date > NOW()');
  }

  if (competition_code) {
    where.push('competition_code = ?');
    params.push(competition_code);
    filters.competition_code = competition_code;
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
    filters.status = status;
  }

  if (df && dt) {
    const fromDate = new Date(df);
    const toDate = new Date(dt);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
      const e = new Error('date_from은 date_to보다 이전이어야 합니다.');
      e.code = 'INVALID_PARAMETER';
      throw e;
    }
    where.push('match_date BETWEEN ? AND ?');
    params.push(df, dt);
    filters.date_from = df;
    filters.date_to = dt;
  } else if (df) {
    where.push('match_date >= ?');
    params.push(df);
    filters.date_from = df;
  } else if (dt) {
    where.push('match_date <= ?');
    params.push(dt);
    filters.date_to = dt;
  }

  // ✅ 구단명 통합 검색: 홈/원정 OR 조건
  if (team) {
    where.push('(home_team LIKE ? OR away_team LIKE ?)');
    params.push(`%${team}%`, `%${team}%`);
    filters.team = team;
  } else {
    // 개별 필터도 동시 지원
    if (home) {
      where.push('home_team LIKE ?');
      params.push(`%${home}%`);
      filters.home = home;
    }
    if (away) {
      where.push('away_team LIKE ?');
      params.push(`%${away}%`);
      filters.away = away;
    }
  }

  if (venue) {
    where.push('venue LIKE ?');
    params.push(`%${venue}%`);
    filters.venue = venue;
  }

  if (category !== undefined && category !== null && category !== '') {
    const catNum = parseInt(category, 10);
    if (Number.isNaN(catNum)) {
      const e = new Error('category는 정수여야 합니다.');
      e.code = 'INVALID_PARAMETER';
      throw e;
    }
    where.push('category = ?');
    params.push(catNum);
    filters.category = catNum;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // 총건수
  const countSql = `
    SELECT COUNT(*) AS cnt
    FROM matches
    ${whereSql}
  `;
  const [countRows] = await conn.query(countSql, params);
  const total = countRows?.[0]?.cnt || 0;

  // 데이터 조회
  const baseSql = `
    SELECT
      id,
      competition_code,
      match_date,
      status,
      home_team,
      away_team,
      venue,
      category
    FROM matches
    ${whereSql}
    ORDER BY ${sortField} ${sortDir}
  `;

  let dataSql = baseSql;
  const dataParams = params.slice();

  // ✅ 전체 조회면 LIMIT 생략
  if (!all && page_size) {
    const limit = page_size;
    const offset = (page - 1) * page_size;
    dataSql += `\nLIMIT ? OFFSET ?`;
    dataParams.push(limit, offset);
  }

  const [rows] = await conn.query(dataSql, dataParams);

  return {
    rows,
    total,
    sortField,
    sortDir,
    filters,
  };
};