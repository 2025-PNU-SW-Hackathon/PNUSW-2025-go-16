require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔍 데이터베이스 초기화 시작...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    
    // 데이터베이스 연결
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('✅ 데이터베이스 연결 성공!');
    
    // store_table 존재 여부 확인
    const [tables] = await connection.execute('SHOW TABLES LIKE "store_table"');
    
    if (tables.length === 0) {
      console.log('🔍 store_table이 존재하지 않습니다. 생성 중...');
      
      // SQL 파일 읽기
      const sqlContent = fs.readFileSync('./create_store_table.sql', 'utf8');
      
      // SQL 실행 (여러 문장 분리)
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement);
        }
      }
      
      console.log('✅ store_table 생성 완료!');
    } else {
      console.log('✅ store_table이 이미 존재합니다.');
    }
    
    // 데이터 확인
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM store_table');
    console.log('🔍 store_table 데이터 개수:', countResult[0].count);
    
    const [sampleData] = await connection.execute('SELECT store_id, store_name FROM store_table LIMIT 5');
    console.log('🔍 샘플 데이터:');
    sampleData.forEach(row => {
      console.log(`  - ${row.store_id}: ${row.store_name}`);
    });
    
    console.log('✅ 데이터베이스 초기화 완료!');
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message);
    console.error('❌ 에러 스택:', error.stack);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ 데이터베이스 접근 권한이 없습니다. 사용자명과 비밀번호를 확인해주세요.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ 데이터베이스 서버에 연결할 수 없습니다. MySQL이 실행 중인지 확인해주세요.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ 데이터베이스가 존재하지 않습니다. spotple 데이터베이스를 생성해주세요.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
