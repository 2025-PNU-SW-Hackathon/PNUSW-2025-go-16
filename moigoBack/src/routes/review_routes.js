// src/routes/review_routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review_controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;