const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 1 },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Paused', 'Archived'], default: 'Active' },

    visuals: {
        heroImage: String,
        icon: String,
        emoji: String,
        primaryColor: String,
        secondaryColor: String,
        featuredImage: String,
        gallery: [String]
    },

    content: {
        metaTitle: String,
        metaDescription: String,
        h1Heading: String,
        introText: String,
        seoKeywords: [String]
    },

    tagging: {
        primaryTags: [String],
        secondaryAttributes: {
            priceRange: String,
            ageGroup: String,
            sizeRange: String,
            sustainability: [String]
        }
    },

    automation: {
        autoAssign: { type: Boolean, default: false },
        rules: {
            containsTags: [String],
            priceMin: Number,
            priceMax: Number,
            fabrics: [String],
            keywords: [String]
        }
    },

    displaySettings: {
        showOnHomepage: { type: Boolean, default: false },
        featuredPosition: Number,
        mobileDisplay: { type: String, enum: ['Full Width', 'Compact'], default: 'Full Width' },
        sortBy: { type: String, default: 'Best Selling' },
        productsPerPage: { type: Number, default: 24 }
    },

    performance: {
        views: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        aov: { type: Number, default: 0 },
        returns: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
