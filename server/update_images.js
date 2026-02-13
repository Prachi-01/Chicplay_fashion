const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server folder
dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function update() {
    try {
        console.log('Connecting to', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const updates = [
            { name: "Blush Silk Slip Dress", img: "/products/blush_dress.png" },
            { name: "Mocha Knit Sweater", img: "/products/mocha_sweater.png" },
            { name: "Rose Gold Pleated Skirt", img: "/products/gold_skirt.png" },
            { name: "Cream Structured Blazer", img: "/products/cream_blazer.png" },
            { name: "Velvet Burgundy Heels", img: "/products/burgundy_heels.png" }
        ];

        for (const up of updates) {
            const res = await Product.updateOne(
                { name: up.name },
                { $set: { images: [up.img] } }
            );
            console.log(`Updated ${up.name}:`, res.modifiedCount);
        }

        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

update();
