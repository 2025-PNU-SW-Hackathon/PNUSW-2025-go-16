// src/controllers/review_controller.js
const reviewService = require('../services/review_service');

exports.createReview = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const reviewData = req.body;

    const review_id = await reviewService.createReview(user_id, reviewData);

    res.status(201).json({
      success: true,
      data: { review_id }
    });
  } catch (error) {
    next(error);
  }
};