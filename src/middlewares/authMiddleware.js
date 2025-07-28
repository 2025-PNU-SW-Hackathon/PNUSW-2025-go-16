// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// jwt 
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // 컨트롤러에서 req.user로 접근 가능
      next();
    } catch (err) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
  } else {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
};

module.exports = authMiddleware;