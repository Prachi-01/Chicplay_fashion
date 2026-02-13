const mongoose = require('mongoose');
const sequelize = require('./config/sequelize');
require('dotenv').config();

const test = async () => {
    try {
        console.log('Testing MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        console.log('Testing MySQL...');
        await sequelize.authenticate();
        console.log('✅ MySQL Connected');

        console.log('✅ All connections working!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

test();
