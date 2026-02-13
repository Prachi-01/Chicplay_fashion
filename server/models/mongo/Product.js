const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number
    },
    images: [{
        type: String // URL related
    }],
    category: {
        type: String, // e.g., 'Dresses', 'Tops'
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    vendorId: {
        type: Number, // Reference to MySQL User ID
        required: false
    },
    archetype: [{
        type: String // e.g., 'Romantic Dreamer', 'Boho Free Spirit'
    }],
    mood: [{
        type: String,
        enum: ['romantic', 'powerful', 'creative', 'casual']
    }],
    occasion: [{
        type: String,
        enum: ['Beach', 'Wedding Guest', 'Work', 'Date Night', 'Everyday']
    }],
    brand: {
        type: String
    },
    attributes: {
        color: { type: String },
        sizes: [{ type: String }], // S, M, L
        material: String,
        style: String, // 'Casual', 'Formal', etc.
        season: String
    },
    gameStats: {
        rarity: {
            type: String,
            enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
            default: 'Common'
        },
        xpReward: { type: Number, default: 10 },
        requiredLevel: { type: Number, default: 1 } // Min level to buy?
    },
    sizeStock: [{
        size: { type: String, required: true },
        quantity: { type: Number, default: 0 }
    }],
    stock: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    styleTags: [{
        type: String // 'Romantic', 'Boho', etc.
    }],
    layerPosition: {
        type: String,
        enum: ['dress', 'top', 'bottom', 'outerwear', 'shoes', 'accessory'],
        default: 'dress'
    },
    // For manual fine-tuning of fit on mannequin
    anchorPoints: {
        top: { type: Number, default: 0 },
        left: { type: Number, default: 0 },
        scale: { type: Number, default: 1 }
    },
    seasons: [{
        type: String,
        enum: ['spring', 'summer', 'fall', 'winter']
    }],
    isExclusive: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvalComments: {
        type: String,
        default: ''
    },
    specifications: [{
        key: { type: String, required: true },
        value: { type: String, required: true },
        icon: { type: String },
        order: { type: Number, default: 0 }
    }],
    colorVariations: [{
        colorName: { type: String, required: true },
        hexCode: { type: String, required: true },
        images: {
            front: { type: String },
            back: { type: String },
            side: { type: String },
            fabric: { type: String },
            lifestyle: { type: String }
        },
        sizeStock: [{
            size: { type: String, required: true },
            quantity: { type: Number, default: 0 }
        }],
        available: { type: Boolean, default: true }
    }],
    vendorDetails: {
        soldBy: { type: String, default: 'ChicPlay Fashion' },
        manufacturerName: { type: String },
        manufacturerAddress: { type: String }
    },
    viewCount: {
        type: Number,
        default: 0
    },
    salesCount: {
        type: Number,
        default: 0
    },
    lastViewedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.virtual('badge').get(function () {
    if (!this.createdAt) return null;

    const now = new Date();
    const createdAt = new Date(this.createdAt);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceCreation = (now - createdAt) / msPerDay;

    // 1. Just In: Uploaded within last 3 days
    if (daysSinceCreation <= 3) {
        return { type: 'justIn', label: 'Just In', color: '#10B981', icon: 'zap' };
    }

    // 2. Bestseller: salesCount >= 50
    if (this.salesCount >= 50) {
        return { type: 'bestseller', label: 'Bestseller', color: '#F59E0B', icon: 'star' };
    }

    // 3. Trending: viewCount >= 100
    if (this.viewCount >= 100) {
        return { type: 'trending', label: 'Trending', color: '#EF4444', icon: 'trending-up' };
    }

    // 4. New Arrival: Uploaded within last 30 days
    if (daysSinceCreation <= 30) {
        return { type: 'newArrival', label: 'New Arrival', color: '#8B5CF6', icon: 'sparkles' };
    }

    return null;
});

module.exports = mongoose.model('Product', productSchema);
