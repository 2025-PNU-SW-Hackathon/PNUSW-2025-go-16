const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

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

module.exports = { connectDB, getConnection };