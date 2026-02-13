const mongoose = require('mongoose');
const sequelize = require('../config/sequelize');
const User = require('../models/mysql/User');
const Product = require('../models/mongo/Product');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Configuration
const CONFIG = {
    USER_COUNT: 20,
    PRODUCT_COUNT: 80 // Increased for more variety
};

// Styles (Matching Frontend Archetype IDs)
const ARCHETYPES = [
    'Romantic Dreamer', 'Modern Minimalist', 'Boho Free Spirit', 'Coastal Girl',
    'Edgy Trendsetter', 'Classic Elegance', 'Street Style Cool', 'Glamour Goddess',
    'Cottagecore', 'Utility Chic', 'Artistic Eclectic', 'Sophisticated Workwear'
];

const CATEGORIES = ['dresses', 'tops', 'bottoms', 'outerwear', 'shoes', 'accessories'];
const COLORS = ['#FF6B8B', '#FFFFFF', '#000000', '#FDE68A', '#BAE6FD', '#4A90E2', '#10B981'];

// High-quality Unsplash image pools for each category
const IMAGE_POOLS = {
    dresses: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1539109132332-629a8b9195d0?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=800&auto=format&fit=crop'
    ],
    tops: [
        'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'
    ],
    bottoms: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511210352395-d06967073b64?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop'
    ],
    outerwear: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520975954732-35dd2229969e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=800&auto=format&fit=crop'
    ],
    shoes: [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1603808033192-082d60f9b3e1?q=80&w=800&auto=format&fit=crop'
    ],
    accessories: [
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523206489230-c012cdd4cc2a?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611085583191-a3b1340d324f?q=80&w=800&auto=format&fit=crop'
    ]
};

const seed = async () => {
    console.log('🌱 Starting Rich Data Seeding...');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
        await sequelize.authenticate();
        console.log('✅ MySQL Connected');

        // Sync data safely
        await sequelize.sync({ alter: true });
        console.log('✅ Synced database safely\n');
        console.log('🗑️ Clearing MongoDB collections...');
        await Product.deleteMany({});

        // 1. CREATE USERS
        console.log(`👥 Creating ${CONFIG.USER_COUNT} Users...`);
        const users = [];
        const hashedPassword = await bcrypt.hash('password123', 10);

        for (let i = 0; i < CONFIG.USER_COUNT; i++) {
            users.push({
                username: `user${i}_${Math.random().toString(36).substring(7)}`,
                email: `user${i}@example.com`,
                password: hashedPassword,
                role: i === 0 ? 'admin' : 'user',
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
            });
        }
        await User.bulkCreate(users);

        // 2. CREATE PRODUCTS
        console.log(`👗 Creating ${CONFIG.PRODUCT_COUNT} Products with variety...`);
        const products = [];

        const productNames = {
            dresses: ['Midnight Velvet Gown', 'Celestial Silk Dress', 'Ethereal Tulle Maxi', 'Urban Shadow Mini', 'Vintage Petal Sundress', 'Scarlet Jubilee Gown', 'Ivory Grace Midi', 'Emerald Enigma Dress'],
            tops: ['Luminous Satin Blouse', 'Obsidian Knit Sweat', 'Alabaster Cami', 'Crimson Flare Top', 'Glacier Button-up', 'Desert Sand Tee'],
            bottoms: ['Shadow Denim Jeans', 'Starlight Pleated Skirt', 'Obsidian Leather Trouser', 'Azure Midi Skirt', 'Ivory Wide-Leg Pans'],
            outerwear: ['Onyx Leather Jacket', 'Crimson Trench Coat', 'Glacier Wool Blazer', 'Desert Dust Cardigan', 'Urban Commuter Parka'],
            shoes: ['Midnight Suede Boots', 'Starlight Stiletto', 'Urban Flex Sneaker', 'Ethereal Sandal', 'Classic Loafer'],
            accessories: ['Obsidian Tote', 'Celestial Scarf', 'Luminous Choker', 'Urban Shades', 'Golden Mirage Belt']
        };

        const layerMap = {
            dresses: 'dress',
            tops: 'top',
            bottoms: 'bottom',
            outerwear: 'outerwear',
            shoes: 'shoes',
            accessories: 'accessory'
        };

        const categoryCounters = {};
        CATEGORIES.forEach(cat => categoryCounters[cat] = 0);

        for (let i = 0; i < CONFIG.PRODUCT_COUNT; i++) {
            const category = CATEGORIES[i % CATEGORIES.length];
            const nameList = productNames[category];
            const archetype = ARCHETYPES[i % ARCHETYPES.length];
            const imagePool = IMAGE_POOLS[category];

            const catIndex = categoryCounters[category];
            const nameIndex = catIndex % nameList.length;
            const imageIndex = catIndex % imagePool.length;

            categoryCounters[category]++;

            products.push({
                name: `${nameList[nameIndex]} ${catIndex + 1}`,
                description: `A unique ${archetype} piece from our late season collection. Hand-picked for its exceptional quality and style.`,
                price: Math.floor(Math.random() * 20) * 500 + 1999,
                category: category.charAt(0).toUpperCase() + category.slice(1),
                images: [imagePool[imageIndex]],
                attributes: {
                    color: COLORS[i % COLORS.length],
                    sizes: ['S', 'M', 'L', 'XL'],
                    style: archetype,
                    material: 'Premium Blend',
                    season: i % 2 === 0 ? 'Spring/Summer' : 'Fall/Winter'
                },
                styleTags: [archetype, category.slice(0, -1), 'Featured'],
                archetype: archetype,
                layerPosition: layerMap[category],
                seasons: ['spring', 'summer', 'fall', 'winter'],
                gameStats: {
                    rarity: i % 15 === 0 ? 'Legendary' : (i % 7 === 0 ? 'Rare' : (i % 3 === 0 ? 'Epic' : 'Common')),
                    xpReward: i % 15 === 0 ? 800 : (i % 7 === 0 ? 300 : 100),
                    requiredLevel: Math.floor(i / 10) + 1
                },
                stock: Math.floor(Math.random() * 30) + 5
            });
        }

        await Product.insertMany(products);
        console.log('\n✨ RICH SEEDING COMPLETE! ✨');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Seeding Failed:', error.message);
        process.exit(1);
    }
};

seed();
