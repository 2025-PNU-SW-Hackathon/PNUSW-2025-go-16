// src/middlewares/errorHandler.js
// api 요청 시 기본 에러 대응을 위한 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || '서버 내부 오류',
  });
};

module.exports = errorHandler;