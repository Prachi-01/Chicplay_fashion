const mongoose = require('mongoose');
mongoose.set('debug', true);
const Product = require('./models/mongo/Product');
const productController = require('./controllers/productController');
require('dotenv').config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const req = {
            query: {},
            user: null
        };
        const res = {
            json: (data) => {
                console.log('--- TEST RESULTS ---');
                console.log('Count:', data.length);
                data.forEach(p => {
                    console.log(`P: ${p.name} | S: ${p.status}`);
                });
            },
            status: (code) => ({
                json: (msg) => console.log(`Error ${code}:`, msg)
            })
        };

        await productController.getProducts(req, res);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

runTest();
