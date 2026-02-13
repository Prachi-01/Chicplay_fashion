const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/mongo/Category');

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const categories = await Category.find({});
        console.log(JSON.stringify(categories, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkCategories();
