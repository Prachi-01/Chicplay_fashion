const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/mongo/Product');

async function fixAndSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get all products
        const products = await Product.find({});

        if (products.length === 0) {
            console.log('No products found to seed.');
            return;
        }

        // 2. Ensure at least 5 products are approved, published, and have sales
        for (let i = 0; i < Math.min(products.length, 5); i++) {
            const p = products[i];
            await Product.updateOne(
                { _id: p._id },
                {
                    $set: {
                        status: 'approved',
                        isPublished: true,
                        salesCount: 10 + (i * 5) // 10, 15, 20, 25, 30
                    }
                }
            );
            console.log(`Updated ${p.name}: Approved, Published, Sales: ${10 + (i * 5)}`);
        }

        console.log('✅ Fix and Seed completed!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

fixAndSeed();
