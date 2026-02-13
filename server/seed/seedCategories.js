const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Archetype = require('../models/mongo/Archetype');
const Category = require('../models/mongo/Category');

dotenv.config();

const ARCHETYPES = [
    {
        id: 'romantic-dreamer',
        name: 'Romantic Dreamer',
        description: 'Feminine, delicate, whimsical fashion lover',
        emoji: '💖',
        primaryColor: '#FF6B8B',
        secondaryColor: '#FFB6C1',
        metrics: { totalProducts: 245, activeProducts: 238, conversionRate: 4.8, aov: 189, matchRate: 92 },
        attributes: {
            silhouettes: ['Fit-and-flare', 'A-line', 'Wrap'],
            colors: ['Pink', 'Lavender', 'Cream', 'Rose Gold'],
            fabrics: ['Lace', 'Chiffon', 'Silk', 'Tulle'],
            occasions: ['Dates', 'Weddings', 'Special events'],
            priceRange: '$$$'
        }
    },
    {
        id: 'modern-minimalist',
        name: 'Modern Minimalist',
        description: 'Architectural lines and a monochrome palette for the woman who finds power in simplicity.',
        emoji: '⚫',
        primaryColor: '#2A2A2A',
        secondaryColor: '#E5E7EB',
        metrics: { totalProducts: 198, activeProducts: 195, conversionRate: 5.2, aov: 215, matchRate: 88 },
        attributes: {
            silhouettes: ['Structured', 'Column', 'Shift'],
            colors: ['Black', 'White', 'Grey', 'Beige'],
            fabrics: ['Crepe', 'Wool', 'Cotton', 'Linen'],
            occasions: ['Work', 'Gallery', 'Professional events'],
            priceRange: '$$$'
        }
    }
];

const CATEGORIES = [
    { name: 'Dresses', slug: 'dresses', emoji: '👗', visuals: { emoji: '👗' }, status: 'Active' },
    { name: 'Tops', slug: 'tops', emoji: '👚', visuals: { emoji: '👚' }, status: 'Active' },
    { name: 'Bottoms', slug: 'bottoms', emoji: '👖', visuals: { emoji: '👖' }, status: 'Active' }
];

const seedCategories = async () => {
    try {
        const { connectMongoDB } = require('../config/db');
        await connectMongoDB();
        console.log('✅ Connected to MongoDB');

        await Archetype.deleteMany({});
        await Archetype.insertMany(ARCHETYPES);
        console.log('✨ Seeded Archetypes');

        await Category.deleteMany({});
        const insertedCats = await Category.insertMany(CATEGORIES);
        console.log('✨ Seeded Root Categories');

        // Add some subcategories
        const dresses = insertedCats[0];
        await Category.create([
            { name: 'By Style Archetype', slug: 'dresses-by-archetype', parent: dresses._id, visuals: { emoji: '🎭' } },
            { name: 'By Occasion', slug: 'dresses-by-occasion', parent: dresses._id, visuals: { emoji: '🎉' } }
        ]);
        console.log('✨ Seeded Subcategories');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedCategories();
