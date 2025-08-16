// src/middlewares/requestLogger.js
// 요청에 대한 로그를 남기는 미들웨어.
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = requestLogger;