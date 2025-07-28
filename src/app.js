const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db_config');

dotenv.config();

const app = express();

// DB 연결
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});