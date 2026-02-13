const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
const User = require('./models/mysql/User');
require('dotenv').config();

async function approveAdminProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get all Admin IDs from MySQL
        const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: ['id']
        });
        const adminIds = admins.map(a => a.id);
        console.log('Admin IDs found:', adminIds);

        // 2. Approve products where vendorId is null OR in adminIds
        const result = await Product.updateMany(
            {
                $or: [
                    { vendorId: { $in: adminIds } },
                    { vendorId: null },
                    { vendorId: { $exists: false } }
                ],
                status: { $ne: 'approved' }
            },
            {
                $set: { status: 'approved', isPublished: true }
            }
        );

        console.log(`Successfully approved ${result.modifiedCount} admin products.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

approveAdminProducts();
