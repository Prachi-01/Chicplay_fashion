const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
const productController = require('./controllers/productController');
require('dotenv').config();

async function testFilter() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Simulate a Guest Request (no user)
        const req = {
            query: {},
            user: null
        };
        const res = {
            json: (data) => {
                console.log('--- Guest Request Results ---');
                console.log('Count:', data.length);
                data.forEach(p => {
                    console.log(`- ${p.name} | Status: ${p.status} | Published: ${p.isPublished}`);
                });
            },
            status: (code) => ({
                json: (msg) => console.log(`Error ${code}:`, msg)
            })
        };

        await productController.getProducts(req, res);

        // Simulate an Admin Request
        const adminReq = {
            query: {},
            user: { role: 'admin' }
        };
        const adminRes = {
            json: (data) => {
                console.log('\n--- Admin Request Results ---');
                console.log('Count:', data.length);
                data.forEach(p => {
                    console.log(`- ${p.name} | Status: ${p.status} | Published: ${p.isPublished}`);
                });
            }
        };

        await productController.getProducts(adminReq, adminRes);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testFilter();
