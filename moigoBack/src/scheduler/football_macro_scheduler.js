// updater.debug.js
const axios = require('axios');
const mysql = require('mysql2/promise');
const schedule = require('node-schedule');
require('dotenv').config();

const COMPETITIONS = ["PL", "PD", "BL1", "SA", "FL1", "CL", "EL", "EC", "WC", "CLI", "ACL"];

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  timezone: 'Z',
  dateStrings: true,
};

// 에러에서 자주 보는 포맷으로 요약 출력
function logMysqlError(prefix, e, extra = {}) {
  console.error(prefix, {
    code: e.code,
    errno: e.errno,
    sqlState: e.sqlState,
    sqlMessage: e.sqlMessage,
    message: e.message,
    ...extra,
  });
}
function logAxiosError(prefix, err) {
  if (err.response) {
    console.error(prefix, {
      status: err.response.status,
      statusText: err.response.statusText,
      data: err.response.data,
    });
  } else {
    console.error(prefix, { message: err.message });
  }
}

// (옵션) ISO → MySQL DATETIME (문제 원인 추적에 도움됨)
function toMysqlDatetime(iso) {
  try {
    return new Date(iso).toISOString().slice(0, 19).replace('T', ' ');
  } catch {
    return null;
  }
}

async function fetchMatches(competition, dateFrom, dateTo) {
  try {
    const res = await axios.get('https://api.football-data.org/v4/matches', {
      params: { competitions: competition, dateFrom, dateTo },
      headers: { 'X-Auth-Token': API_KEY },
      timeout: 15000,
    });
    const list = Array.isArray(res.data?.matches) ? res.data.matches : [];
    return list;
  } catch (err) {
    logAxiosError(`❌ API ${competition}`, err);
    return [];
  }
}

async function saveMatchesToDB(matches, conn) {
  if (!matches.length) return 0;

  // 네 스키마가 match_date면 아래 컬럼명을 match_date로 바꿔서 사용해도 됨
  const insertQuery = `
    INSERT IGNORE INTO matches (id, competition_code, match_date, status, home_team, away_team, venue)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  let ok = 0;

  for (const m of matches) {
    const values = [
      m.id,
      m.competition?.code || null,
      toMysqlDatetime(m.utcDate),
      m.status || null,
      m.homeTeam?.name || null,
      m.awayTeam?.name || null,
      m.venue || null,
    ];
    try {
      await conn.execute(insertQuery, values);
      ok++;
    } catch (e) {
      // 어떤 값 때문에 실패했는지 바로 보이도록 values 일부도 로깅
      logMysqlError('❌ INSERT FAILED', e, { id: m.id, competition: m.competition?.code, utcDate: m.utcDate, values });
    }
  }
  return ok;
}

async function updateMatches() {
  // 현재 설정 확인(비번은 마스킹)
  const printCfg = { ...DB_CONFIG, password: DB_CONFIG.password ? '***' : '' };
  console.log('DB_CONFIG:', printCfg);
  console.log('API_KEY set:', !!API_KEY);

  const today = new Date();
  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  let conn;
  try {
    conn = await mysql.createConnection(DB_CONFIG);
    const [[{ db }]] = await conn.query('SELECT DATABASE() AS db');
    console.log('CONNECTED DB:', db);
  } catch (e) {
    logMysqlError('❌ DB CONNECT FAILED', e);
    return;
  }

  for (const code of COMPETITIONS) {
    const list = await fetchMatches(code, dateFrom, dateTo);
    try {
      const saved = await saveMatchesToDB(list, conn);
      console.log(`✅ ${code}: fetched=${list.length}, saved=${saved}`);
    } catch (e) {
      logMysqlError(`❌ SAVE LOOP ${code}`, e);
    }
  }

  await conn.end().catch(() => {});
  console.log('🟢 updateMatches done');
}

// 매일 오전 6시 실행(서버 로컬시간)
schedule.scheduleJob('0 6 * * *', () => {
  console.log(`[${new Date().toISOString()}] CRON start`);
  updateMatches().catch(e => console.error('CRON UNHANDLED', e));
});

// 초기 1회 실행
updateMatches().catch(e => console.error('INIT UNHANDLED', e));

// 프로세스 전역 에러도 보기 좋게
process.on('unhandledRejection', (e) => console.error('UNHANDLED_REJECTION', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT_EXCEPTION', e));
