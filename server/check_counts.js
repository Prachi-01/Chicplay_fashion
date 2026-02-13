const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
require('dotenv').config();

const checkCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const counts = await Product.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: "$archetype", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('--- Product Counts per Archetype (Approved) ---');
        counts.forEach(c => {
            console.log(`${c._id || 'Unassigned'}: ${c.count}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCounts();
