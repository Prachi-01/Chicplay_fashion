const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/mongo/Product');

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Total products checked: ${products.length}`);

        products.forEach(p => {
            const isVisible = p.images && p.images.length > 0 && p.images[0] && p.name;
            const isApproved = p.status === 'approved';
            const isPublished = p.isPublished !== false;
            const hasSales = p.salesCount > 0;

            console.log(`\nProduct: ${p.name}`);
            console.log(`- Sales: ${p.salesCount || 0}`);
            console.log(`- Status: ${p.status}`);
            console.log(`- Published: ${p.isPublished}`);
            console.log(`- Has Image: ${!!(p.images && p.images[0])}`);

            const results = [];
            if (!isVisible) results.push('Missing Image/Name');
            if (!isApproved) results.push('Not Approved');
            if (!isPublished) results.push('Not Published');
            if (!hasSales) results.push('Zero Sales');

            if (results.length > 0) {
                console.log(`- REASONS FOR FILTERING: ${results.join(', ')}`);
            } else {
                console.log(`- SHOULD BE VISIBLE! ✅`);
            }
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

diagnose();
