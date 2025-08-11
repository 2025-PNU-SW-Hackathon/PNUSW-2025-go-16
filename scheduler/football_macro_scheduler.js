const axios = require('axios');
const mysql = require('mysql2/promise');
const schedule = require('node-schedule');
require('dotenv').config();

const COMPETITIONS = ["PL", "PD", "BL1", "SA", "FL1", "CL", "EL", "EC", "WC", "CLI", "ACL"];

let pool;

// 1. DB 연결 설정
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

// 2. API 호출 함수
const fetchMatches = async (competition, dateFrom, dateTo) => {
    const res = await axios.get('https://api.football-data.org/v4/matches', {
        params: { competitions: competition, dateFrom, dateTo },
        headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY }
    });
    return res.data.matches;
};

// 3. DB 저장 함수
const saveMatchesToDB = async (matches, conn) => {
    const insertQuery = `
    INSERT IGNORE INTO matches (id, competition_code, match_date, status, home_team, away_team, venue)
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
            match.venue || ''
        ];
        try {
            await conn.execute(insertQuery, values);
        } catch (err) {
            console.error(`❌ Insert failed for match ID ${match.id}:`, err.message);
        }
    }
};

// 4. 전체 매크로 실행 함수
const updateMatches = async () => {
    const today = new Date();
    const KST_OFFSET = 9 * 60 * 60 * 1000;

    const kstNow = new Date(today.getTime() + KST_OFFSET);
    const dateFrom = kstNow.toISOString().slice(0, 10);

    const tenDaysLater = new Date(kstNow.getTime() + 10 * 24 * 60 * 60 * 1000);
    const dateTo = tenDaysLater.toISOString().slice(0, 10);
    const conn = getConnection();

    console.log(`${dateFrom} => ${dateTo}`);
    for (const code of COMPETITIONS) {
        try {
            const matches = await fetchMatches(code, dateFrom, dateTo);
            await saveMatchesToDB(matches, conn);

            console.log(`✅ ${code}: ${matches.length} matches saved`);
        } catch (err) {
            console.error(`❌ ${code}:`, err.message);
        }
    }
};

// 5. 메인 실행 및 스케줄 등록
(async () => {
    await connectDB();

    // 초기 실행
    await updateMatches();

    // 매일 오전 6시에 반복 실행
    schedule.scheduleJob('0 6 * * *', async () => {
        console.log(`[${new Date().toISOString()}] Scheduled job started`);
        await updateMatches();
    });
})();