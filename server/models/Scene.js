const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['outdoor', 'indoor', 'studio'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    thumbnail_url: {
        type: String
    },
    lighting_profile: {
        default_brightness: { type: Number, default: 80 },
        default_warmth: { type: Number, default: 70 },
        default_contrast: { type: Number, default: 60 },
        time_variants: {
            morning: {
                brightness: { type: Number, default: 70 },
                warmth: { type: Number, default: 60 },
                contrast: { type: Number, default: 55 }
            },
            afternoon: {
                brightness: { type: Number, default: 90 },
                warmth: { type: Number, default: 80 },
                contrast: { type: Number, default: 65 }
            },
            evening: {
                brightness: { type: Number, default: 50 },
                warmth: { type: Number, default: 90 },
                contrast: { type: Number, default: 70 }
            },
            night: {
                brightness: { type: Number, default: 40 },
                warmth: { type: Number, default: 95 },
                contrast: { type: Number, default: 75 }
            }
        }
    },
    sound_profile: {
        type: String,
        default: 'ambient'
    },
    tags: [{
        type: String
    }],
    outfit_suggestions: [{
        type: String
    }],
    isPremium: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    shareCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scene', sceneSchema);
