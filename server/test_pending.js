const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
require('dotenv').config();

async function testVendorCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Simulate a new product created by a vendor (role would be checked by middleware in real app)
        // Here we just check the default behavior if we were to manually insert or if we rely on the controller logic.
        // Since we can't easily mock the controller-req-res flow here without supertest,
        // I will rely on the code analysis which showed:
        // status: req.user.role === 'admin' ? 'approved' : 'pending'

        // However, I can check if any EXISTING products created by vendors are pending.
        const pendingProducts = await Product.find({ status: 'pending' });
        console.log(`Found ${pendingProducts.length} pending products.`);
        pendingProducts.forEach(p => console.log(`- ${p.name} (Vendor: ${p.vendorId})`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testVendorCreate();
