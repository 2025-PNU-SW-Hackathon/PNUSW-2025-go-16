const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db_config');
const jwt = require('jsonwebtoken');
const reservationRoutes = require('./routes/reservation_routes');
const reviewRoutes = require('./routes/review_routes');
const userRoutes = require('./routes/user_routes');
const chatRoutes = require('./routes/chat_routes');
const { Server } = require('socket.io');
const handleSocket = require('./controllers/socket_controller');
const http = require('http');
const paymentRoutes = require('./routes/payment_routes');
dotenv.config();

const app = express();

// 공통 미들웨어
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');

// DB 연결
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // 테스트 시 허용
    methods: ['GET', 'POST'],
  },
});

// 기본 미들웨어
app.use(express.json());
app.use(requestLogger);

// 내부 라우팅 등록
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/payments', paymentRoutes);

// 404 및 에러 핸들러 등록
//app.use(notFound);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// 👇 소켓 핸들러 등록
handleSocket(io);

const test_token = jwt.sign(
    {
      user_id: "yejun",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('[ENV] TOSS_SECRET_KEY:', process.env.TOSS_SECRET_KEY);
  console.log(test_token);
});