const axios = require('axios');
const mysql = require('mysql2/promise');
const schedule = require('node-schedule');
require('dotenv').config();

const COMPETITIONS = ["PL", "PD", "BL1", "SA", "FL1", "CL", "EL", "EC", "WC", "CLI", "ACL"];

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const DB_CONFIG = {
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'your_database',
};

const fetchMatches = async (competition, dateFrom, dateTo) => {
  const res = await axios.get('https://api.football-data.org/v4/matches', {
    params: { competitions: competition, dateFrom, dateTo },
    headers: { 'X-Auth-Token': API_KEY }
  });
  return res.data.matches;
};

const saveMatchesToDB = async (matches, conn) => {
  const insertQuery = `
    INSERT IGNORE INTO matches (id, competition_code, utc_date, status, home_team, away_team, venue)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  for (const match of matches) {
    const values = [
      match.id,
      match.competition.code,
      match.utcDate,
      match.status,
      match.homeTeam.name,
      match.awayTeam.name,
      match.venue || '',
    ];
    await conn.execute(insertQuery, values);
  }
};

const updateMatches = async () => {
  const today = new Date();
  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const conn = await mysql.createConnection(DB_CONFIG);

  for (const code of COMPETITIONS) {
    try {
      const matches = await fetchMatches(code, dateFrom, dateTo);
      await saveMatchesToDB(matches, conn);
      console.log(`✅ ${code}: ${matches.length} matches saved`);
    } catch (err) {
      console.error(`❌ ${code}:`, err.message);
    }
  }

  await conn.end();
};

// ✅ 매일 오전 6시에 실행
schedule.scheduleJob('0 6 * * *', () => {
  console.log(`[${new Date().toISOString()}] Running match schedule updater...`);
  updateMatches();
});

// 초기 실행 (앱 시작 시)
updateMatches();