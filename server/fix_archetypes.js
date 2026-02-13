const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/mongo/Product');

async function fixProductArchetypes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const result = await Product.updateMany(
            { $or: [{ archetype: { $exists: false } }, { archetype: null }, { archetype: '' }] },
            { $set: { archetype: 'Romantic Dreamer' } }
        );

        console.log(`✅ Updated ${result.modifiedCount} products to "Romantic Dreamer"`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixProductArchetypes();
