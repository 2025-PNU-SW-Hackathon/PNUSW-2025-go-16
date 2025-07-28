const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db_config');
const jwt = require('jsonwebtoken');
const reservationRoutes = require('./routes/reservation_routes');

dotenv.config();

const app = express();

// 공통 미들웨어
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');

// DB 연결
connectDB();

// 기본 미들웨어
app.use(express.json());
app.use(requestLogger);

// 내부 라우팅 등록
app.use('/api/v1/reservations', reservationRoutes);

// 404 및 에러 핸들러 등록
//app.use(notFound);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API is running...');
});


const test_token = jwt.sign(
    {
      user_id: "yejun2",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(test_token);
});