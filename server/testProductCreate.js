const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
require('dotenv').config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testProduct = {
            name: 'Test Dress',
            description: 'A beautiful test dress',
            price: 99,
            category: 'Dresses',
            images: ['https://via.placeholder.com/800x1200'],
            attributes: {
                color: '#FF6B8B',
                sizes: ['S', 'M', 'L'],
                style: 'romantic',
                season: 'Summer'
            },
            styleTags: ['romantic'],
            layerPosition: 'dress',
            seasons: ['summer'],
            gameStats: {
                rarity: 'Common',
                xpReward: 20
            },
            stock: 10
        };

        console.log('Attempting to create product...');
        const product = await Product.create(testProduct);
        console.log('✅ Product created successfully!', product.name);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.errors) {
            console.error('Validation errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

test();
