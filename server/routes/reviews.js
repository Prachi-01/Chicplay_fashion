const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// POST /api/reviews - Create a review (Protected, needs purchase verification)
router.post('/', auth, reviewController.createReview);

// GET /api/reviews/:productId - Get reviews for a product (Public)
router.get('/:productId', reviewController.getProductReviews);

// GET /api/reviews/eligibility/:productId - Check if user can review (Protected)
router.get('/eligibility/:productId', auth, reviewController.checkReviewEligibility);

module.exports = router;
