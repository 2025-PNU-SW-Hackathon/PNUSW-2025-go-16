require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testDBConnection() {
  try {
    console.log('🔍 데이터베이스 연결 테스트 시작...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('✅ 데이터베이스 연결 성공!');
    
    // store_table 존재 여부 확인
    const [tables] = await connection.execute('SHOW TABLES LIKE "store_table"');
    console.log('🔍 store_table 존재 여부:', tables.length > 0 ? '존재함' : '존재하지 않음');
    
    if (tables.length > 0) {
      // store_table 구조 확인
      const [columns] = await connection.execute('DESCRIBE store_table');
      console.log('🔍 store_table 컬럼 구조:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // 데이터 개수 확인
      const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM store_table');
      console.log('🔍 store_table 데이터 개수:', countResult[0].count);
      
      // 샘플 데이터 확인
      const [sampleData] = await connection.execute('SELECT store_id, store_name FROM store_table LIMIT 5');
      console.log('🔍 샘플 데이터:');
      sampleData.forEach(row => {
        console.log(`  - ${row.store_id}: ${row.store_name}`);
      });
    }
    
    await connection.end();
    console.log('✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    console.error('❌ 에러 스택:', error.stack);
  }
}

testDBConnection();


