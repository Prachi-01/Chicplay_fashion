require('dotenv').config();
const sequelize = require('./config/sequelize');

async function checkSchema() {
    try {
        const [results] = await sequelize.query('DESCRIBE VendorProfiles');
        console.log('--- VendorProfiles Schema ---');
        console.table(results);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
