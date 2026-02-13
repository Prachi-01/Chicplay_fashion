const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: Number, required: true }, // MySQL User ID
    userName: { type: String, required: true },
    userAvatar: String,
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    photos: [String], // Array of photo URLs
    helpfulVotes: { type: Number, default: 0 },
    fit: { type: String, enum: ['True to Size', 'Runs Small', 'Runs Large'] },
    bodyType: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
