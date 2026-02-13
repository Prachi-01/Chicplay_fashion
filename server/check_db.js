const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './.env' });

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false
    }
);

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("DESCRIBE Addresses");
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
