const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
require('dotenv').config();

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({}, 'name status isPublished vendorId');
        console.log('--- Product Status Report ---');
        products.forEach(p => {
            console.log(`Name: ${p.name}`);
            console.log(`  Status: ${p.status}`);
            console.log(`  Published: ${p.isPublished}`);
            console.log(`  VendorID: ${p.vendorId}`);
            console.log('---------------------------');
        });

        const counts = await Product.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        console.log('Status Counts:', counts);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProducts();
