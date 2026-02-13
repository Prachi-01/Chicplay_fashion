const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    hexCode: {
        type: String,
        required: true,
        match: /^#[0-9A-Fa-f]{6}$/
    },
    category: {
        type: String,
        enum: ['red', 'pink', 'purple', 'blue', 'green', 'yellow', 'orange', 'brown', 'gray', 'black', 'white', 'other'],
        default: 'other'
    },
    isCommon: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for fast searching
colorSchema.index({ name: 'text' });
colorSchema.index({ category: 1 });

module.exports = mongoose.model('Color', colorSchema);
