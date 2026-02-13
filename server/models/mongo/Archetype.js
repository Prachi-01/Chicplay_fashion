const mongoose = require('mongoose');

const archetypeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g., 'romantic-dreamer'
    name: { type: String, required: true },
    tagline: { type: String },
    description: { type: String },
    heroImage: { type: String },
    bannerImage: { type: String }, // Cloudinary URL for banner section
    emoji: { type: String, default: '👗' },
    primaryColor: { type: String, default: '#000000' },
    secondaryColor: { type: String, default: '#FFFFFF' },

    // Spec requirements
    metrics: {
        totalProducts: { type: Number, default: 0 },
        activeProducts: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 },
        aov: { type: Number, default: 0 },
        matchRate: { type: Number, default: 0 }
    },

    attributes: {
        silhouettes: [String],
        colors: [String],
        fabrics: [String],
        occasions: [String],
        priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'] }
    },

    recommendationWeights: {
        colorMatch: { type: Number, default: 40 },
        silhouetteMatch: { type: Number, default: 30 },
        fabricPreference: { type: Number, default: 20 },
        priceSensitivity: { type: Number, default: 10 }
    },

    aiTrainingData: {
        keywords: [String],
        celebrityMatches: [String],
        instagramHashtags: [String]
    },

    content: {
        metaTitle: { type: String },
        metaDescription: { type: String }
    },

    automation: {
        rules: {
            containsTags: [String]
        }
    },

    status: {
        type: String,
        enum: ['Active', 'Paused', 'Archived'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Archetype', archetypeSchema);
