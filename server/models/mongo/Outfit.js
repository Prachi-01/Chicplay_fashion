const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    userName: String,
    userAvatar: String,
    name: { type: String, default: 'My Outfit' },
    description: String,
    items: [{
        slot: String, // 'dress', 'top', 'bottom', 'shoes', etc.
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        imageUrl: String,
        position: { x: Number, y: Number, scale: Number }
    }],
    styleTags: [String],
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Outfit', outfitSchema);
