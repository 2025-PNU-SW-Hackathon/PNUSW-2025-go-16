// src/middlewares/errorHandler.js
// api 요청 시 기본 에러 대응을 위한 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('❌ [ERROR] 에러 발생:', err);
  console.error('❌ [ERROR] 에러 스택:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || '서버 내부 오류',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;