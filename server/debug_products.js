const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Product = require('./models/mongo/Product');

async function debugProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const products = await Product.find({});

        console.log(`📊 Found ${products.length} products total\n`);

        const data = products.map(p => ({
            name: p.name,
            id: p._id,
            category: p.category,
            archetype: p.archetype,
            isPublished: p.isPublished,
            isExclusive: p.isExclusive
        }));

        console.table(data);

        fs.writeFileSync('../.gemini/debug_products_all.json', JSON.stringify(data, null, 2));
        console.log('\n✅ Detailed data written to .gemini/debug_products_all.json');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugProducts();
