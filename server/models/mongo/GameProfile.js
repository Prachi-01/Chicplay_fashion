const mongoose = require('mongoose');

const gameProfileSchema = new mongoose.Schema({
    userId: {
        type: Number, // Links to MySQL User ID
        required: true,
        unique: true
    },
    level: {
        type: Number,
        default: 1
    },
    currentTitle: {
        type: String,
        default: 'Fashion Newbie',
        enum: ['Fashion Newbie', 'Style Student', 'Trend Setter', 'Fashion Icon', 'Style Legend']
    },
    points: {
        type: Number,
        default: 0
    },
    nextLevelPoints: {
        type: Number,
        default: 500
    },
    streakDays: {
        type: Number,
        default: 0
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    badges: [{
        id: String,
        name: String,
        icon: String,
        dateEarned: { type: Date, default: Date.now }
    }],
    wallet: {
        coins: { type: Number, default: 100 }, // Virtual currency
        gems: { type: Number, default: 0 }     // Premium currency
    },
    spinState: {
        lastSpinTimestamp: { type: Date, default: null },
        nextSpinAvailableAt: { type: Date, default: null },
        lastRewardWon: { type: String, default: null }
    },
    stats: {
        itemsViewed: { type: Number, default: 0 },
        itemsPurchased: { type: Number, default: 0 },
        outfitsCreated: { type: Number, default: 0 },
        reviewsWritten: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('GameProfile', gameProfileSchema);
