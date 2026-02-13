const Review = require('../models/mongo/Review');
const Order = require('../models/mysql/Order');
const OrderItem = require('../models/mysql/OrderItem');
const Product = require('../models/mongo/Product');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment, fit, bodyType, photos } = req.body;
        const userId = req.user.id;
        const userName = req.user.name || 'Anonymous';

        if (!productId || !rating || !comment) {
            return res.status(400).json({ message: 'Product ID, rating, and comment are required' });
        }

        // 1. Verify that the user has actually purchased this product
        // We look for any completed order by this user that contains this product
        const hasPurchased = await Order.findOne({
            where: { userId, status: 'completed' },
            include: [{
                model: OrderItem,
                where: { productId }
            }]
        });

        if (!hasPurchased) {
            return res.status(403).json({
                message: 'You can only review products you have purchased and received.'
            });
        }

        // 2. Check if user already reviewed this product
        const existingReview = await Review.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }

        // 3. Create the review
        const newReview = await Review.create({
            userId,
            userName,
            productId,
            rating,
            comment,
            fit,
            bodyType,
            photos: photos || []
        });

        // 4. Update the product rating and review count
        const product = await Product.findById(productId);
        if (product) {
            const reviews = await Review.find({ productId });
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            product.rating = totalRating / reviews.length;
            product.reviewsCount = reviews.length;
            await product.save();
        }

        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server Error creating review' });
    }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

        // Calculate average rating and distribution
        const stats = {
            averageRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
            totalReviews: reviews.length,
            ratingDistribution: {
                5: reviews.filter(r => r.rating === 5).length,
                4: reviews.filter(r => r.rating === 4).length,
                3: reviews.filter(r => r.rating === 3).length,
                2: reviews.filter(r => r.rating === 2).length,
                1: reviews.filter(r => r.rating === 1).length,
            }
        };

        res.json({ reviews, stats });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error fetching reviews' });
    }
};

// Check if a user can review a product
exports.checkReviewEligibility = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const hasPurchased = await Order.findOne({
            where: { userId, status: 'completed' },
            include: [{
                model: OrderItem,
                where: { productId }
            }]
        });

        const existingReview = await Review.findOne({ userId, productId });

        res.json({
            canReview: !!hasPurchased && !existingReview,
            hasPurchased: !!hasPurchased,
            alreadyReviewed: !!existingReview
        });
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({ message: 'Server Error checking eligibility' });
    }
};
