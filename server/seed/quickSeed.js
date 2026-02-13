const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const sequelize = require('./config/sequelize');
const User = require('./models/mysql/User');
const Product = require('./models/mongo/Product');
require('dotenv').config();

const PRODUCT_DATA = [
    { name: 'Floral Summer Dress', category: 'Dresses', price: 89, color: '#FF6B8B', style: 'romantic' },
    { name: 'Silk Evening Gown', category: 'Dresses', price: 149, color: '#000000', style: 'classic' },
    { name: 'Boho Maxi Dress', category: 'Dresses', price: 79, color: '#FDE68A', style: 'boho' },
    { name: 'Cotton Midi Dress', category: 'Dresses', price: 65, color: '#BAE6FD', style: 'minimalist' },
    { name: 'Cocktail Dress', category: 'Dresses', price: 120, color: '#DDD6FE', style: 'edgy' },

    { name: 'Cotton Blouse', category: 'Tops', price: 45, color: '#FFFFFF', style: 'classic' },
    { name: 'Silk Cami', category: 'Tops', price: 55, color: '#FF6B8B', style: 'romantic' },
    { name: 'Knit Sweater', category: 'Tops', price: 68, color: '#E5E7EB', style: 'minimalist' },
    { name: 'Crop Top', category: 'Tops', price: 35, color: '#000000', style: 'edgy' },
    { name: 'Embroidered Top', category: 'Tops', price: 59, color: '#FDE68A', style: 'boho' },

    { name: 'High-Waist Jeans', category: 'Bottoms', price: 75, color: '#000000', style: 'minimalist' },
    { name: 'Pleated Skirt', category: 'Bottoms', price: 58, color: '#FF6B8B', style: 'romantic' },
    { name: 'Leather Pants', category: 'Bottoms', price: 125, color: '#000000', style: 'edgy' },
    { name: 'Denim Skirt', category: 'Bottoms', price: 49, color: '#BAE6FD', style: 'boho' },
    { name: 'Wide-Leg Trousers', category: 'Bottoms', price: 82, color: '#E5E7EB', style: 'classic' },

    { name: 'Denim Jacket', category: 'Outerwear', price: 95, color: '#BAE6FD', style: 'boho' },
    { name: 'Leather Jacket', category: 'Outerwear', price: 189, color: '#000000', style: 'edgy' },
    { name: 'Blazer', category: 'Outerwear', price: 135, color: '#000000', style: 'classic' },
    { name: 'Cardigan', category: 'Outerwear', price: 68, color: '#FDE68A', style: 'romantic' },
    { name: 'Trench Coat', category: 'Outerwear', price: 165, color: '#E5E7EB', style: 'minimalist' },

    { name: 'Ankle Boots', category: 'Shoes', price: 110, color: '#000000', style: 'classic' },
    { name: 'Heels', category: 'Shoes', price: 98, color: '#FF6B8B', style: 'romantic' },
    { name: 'Sneakers', category: 'Shoes', price: 85, color: '#FFFFFF', style: 'minimalist' },
    { name: 'Sandals', category: 'Shoes', price: 65, color: '#FDE68A', style: 'boho' },
    { name: 'Combat Boots', category: 'Shoes', price: 125, color: '#000000', style: 'edgy' },

    { name: 'Leather Bag', category: 'Accessories', price: 145, color: '#000000', style: 'classic' },
    { name: 'Silk Scarf', category: 'Accessories', price: 48, color: '#FF6B8B', style: 'romantic' },
    { name: 'Minimalist Watch', category: 'Accessories', price: 95, color: '#E5E7EB', style: 'minimalist' },
    { name: 'Statement Necklace', category: 'Accessories', price: 55, color: '#FDE68A', style: 'boho' },
    { name: 'Studded Belt', category: 'Accessories', price: 42, color: '#000000', style: 'edgy' }
];

const quickSeed = async () => {
    console.log('🌱 Quick Seed Starting...\n');

    try {
        // Connect
        await mongoose.connect(process.env.MONGODB_URI);
        await sequelize.authenticate();
        console.log('✅ Databases Connected\n');

        // Sync data safely
        await sequelize.sync({ alter: true });
        console.log('✅ Synced database safely\n');

        // Create admin user
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            username: 'admin',
            email: 'admin@chicplay.com',
            password: hashedPassword,
            role: 'admin',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
        });
        console.log('✅ Created admin user\n');

        // Create products
        const products = PRODUCT_DATA.map((item, index) => ({
            name: item.name,
            description: `Beautiful ${item.name.toLowerCase()} perfect for any occasion.`,
            price: item.price,
            category: item.category,
            images: [`https://via.placeholder.com/800x1200/${item.color.replace('#', '')}/FFFFFF?text=${item.name.replace(/ /g, '+')}`],
            attributes: {
                color: item.color,
                sizes: ['S', 'M', 'L', 'XL'],
                style: item.style,
                season: 'All'
            },
            styleTags: [item.style],
            layerPosition: item.category.toLowerCase() === 'dresses' ? 'dress' : item.category.toLowerCase().slice(0, -1),
            seasons: ['spring', 'summer', 'fall', 'winter'],
            gameStats: {
                rarity: index % 5 === 0 ? 'Rare' : 'Common',
                xpReward: 20
            },
            stock: Math.floor(Math.random() * 50) + 10
        }));

        await Product.insertMany(products);
        console.log(`✅ Created ${products.length} products\n`);

        console.log('✨ SEEDING COMPLETE! ✨\n');
        console.log('📊 Summary:');
        console.log(`   👤 Admin created: admin@chicplay.com`);
        console.log(`   👗 Products: ${products.length}`);
        console.log(`\n🔐 Login with:`);
        console.log(`   Email: admin@chicplay.com`);
        console.log(`   Password: password123\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

quickSeed();
