const axios = require('axios');
const mysql = require('mysql2/promise');
const schedule = require('node-schedule');
require('dotenv').config();

const THESPORTSDB_API_KEY = process.env.THESPORTSDB_API_KEY || '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_API_KEY}`;
const KBO_LEAGUE_ID = '4830'; // TheSportsDB KBO 리그 ID

let pool;

/** 1) DB 연결 */
const connectDB = async () => {
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });
    console.log('✅ MySQL DB connected!');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
};
const getConnection = () => pool;

/** 2) 유틸 */
const ymdKST = (date) => {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
};
const padTime = (t) => {
  if (!t) return '00:00:00';
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  return '00:00:00';
};

/** 3) KBO 판별: idLeague=4830 우선, 보조로 strLeague 내 kbo 포함 */
const isKboEvent = (ev) => {
  const idLeague = String(ev?.idLeague || '');
  if (idLeague === KBO_LEAGUE_ID) return true;
  const league = (ev?.strLeague || '').toLowerCase().replace(/\s+/g, ' ');
  return league.includes('kbo');
};

/** 4) 일자별 조회: (A) l=리그명 → (B) s=Baseball 후 필터 */
const fetchKboByDate = async (dateStr) => {
  const url = `${BASE_URL}/eventsday.php`;

  // (A) league name 필터 시도
  try {
    const r = await axios.get(url, { params: { d: dateStr, l: 'Korean KBO League' } });
    const events = Array.isArray(r.data?.events) ? r.data.events : [];
    if (events.length > 0) {
      const kbo = events.filter(isKboEvent);
      console.log(`[eventsday:l=Korean KBO League] ${dateStr} total=${events.length} kbo=${kbo.length}`);
      return kbo;
    } else {
      console.log(`[eventsday:l=Korean KBO League] ${dateStr} -> 0`);
    }
  } catch (e) {
    console.log(`[eventsday:l=Korean KBO League] ${dateStr} error: ${e.message}`);
  }

  // (B) sport=Baseball로 받아서 필터
  try {
    const r2 = await axios.get(url, { params: { d: dateStr, s: 'Baseball' } });
    const events2 = Array.isArray(r2.data?.events) ? r2.data.events : [];
    if (events2.length) {
      // 어떤 리그들이 오는지 확인 로그
      const leagues = events2.reduce((acc, e) => {
        const k = `${e.idLeague || '?'}|${e.strLeague || '?'}`;
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});
      console.log(`[eventsday:s=Baseball] ${dateStr} total=${events2.length} leagues=`, leagues);
    } else {
      console.log(`[eventsday:s=Baseball] ${dateStr} -> 0`);
    }
    const kboOnly = events2.filter(isKboEvent);
    console.log(`[eventsday:filter-KBO] ${dateStr} kbo=${kboOnly.length}`);
    return kboOnly;
  } catch (e) {
    console.log(`[eventsday:s=Baseball] ${dateStr} error: ${e.message}`);
    return [];
  }
};

/** 5) 시즌 전체 → 날짜로 필터 (fallback) */
const fetchKboSeason = async (seasonStr /* '2025' */) => {
  try {
    const url = `${BASE_URL}/eventsseason.php`;
    const { data } = await axios.get(url, { params: { id: KBO_LEAGUE_ID, s: seasonStr } });
    const events = Array.isArray(data?.events) ? data.events : [];
    const kbo = events.filter(isKboEvent);
    console.log(`[eventsseason] ${seasonStr} kbo total=${kbo.length}`);
    return kbo;
  } catch (e) {
    console.log(`[eventsseason] ${seasonStr} error: ${e.message}`);
    return [];
  }
};

/** 6) 저장 */
const saveMatchesToDB = async (matches, conn) => {
  const insertQuery = `
    INSERT IGNORE INTO matches (id, competition_code, match_date, status, home_team, away_team, venue)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  for (const ev of matches) {
    const id = parseInt(ev.idEvent, 10);
    const date = ev.dateEvent || null;
    const time = padTime(ev.strTime);
    const matchDate = date ? `${date} ${time}` : null;

    const values = [
      id,
      'KBO',
      matchDate,
      ev.strStatus || 'SCHEDULED',
      ev.strHomeTeam || '',
      ev.strAwayTeam || '',
      ev.strVenue || ''
    ];

    try {
      await conn.execute(insertQuery, values);
    } catch (err) {
      console.error(`❌ Insert failed for event ${id}:`, err.message);
    }
  }
};

/** 7) 실행 루프: 다음 N일 + 시즌 fallback */
const updateKboMatches = async (days = 10, useSeasonFallback = true) => {
  const now = new Date();
  const start = new Date(now.getTime()); // 기준: 현재
  const conn = getConnection();

  // (옵션) 시즌 캐시
  let seasonCache = [];
  let seasonYear = ymdKST(start).slice(0, 4);
  if (useSeasonFallback) {
    seasonCache = await fetchKboSeason(seasonYear);
  }

  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = ymdKST(d);

    try {
      let matches = await fetchKboByDate(dateStr);

      if (useSeasonFallback && matches.length === 0) {
        const yearOfDate = dateStr.slice(0, 4);
        if (seasonCache.length === 0 || yearOfDate !== seasonYear) {
          seasonYear = yearOfDate;
          seasonCache = await fetchKboSeason(seasonYear);
        }
        const seasonFiltered = seasonCache.filter(ev => ev.dateEvent === dateStr);
        console.log(`[fallback] ${dateStr} seasonFiltered=${seasonFiltered.length}`);
        matches = seasonFiltered;
      }

      await saveMatchesToDB(matches, conn);
      console.log(`✅ KBO ${dateStr}: ${matches.length} matches saved`);
    } catch (err) {
      console.error(`❌ KBO ${dateStr}:`, err.message);
    }
  }
};

/** 8) 메인 & 스케줄
 * 서버가 KST면 '5 6 * * *'
 * 서버가 UTC면 '5 21 * * *' (UTC 21:05 == KST 06:05)
 */
(async () => {
  await connectDB();
  await updateKboMatches(10, true);

  schedule.scheduleJob('5 6 * * *', async () => {
    console.log(`[${new Date().toISOString()}] KBO scheduled job started`);
    await updateKboMatches(10, true);
  });
})();