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

async function checkVendors() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL');

        try {
            const [tables] = await sequelize.query("SHOW TABLES LIKE 'VendorProfiles'");
            if (tables.length === 0) {
                console.log('Table VendorProfiles does not exist!');
            } else {
                console.log('Table VendorProfiles exists.');
                const [results] = await sequelize.query("SELECT * FROM VendorProfiles");
                console.log('Total Vendors:', results.length);
                console.log('Vendors:', JSON.stringify(results, null, 2));
            }
        } catch (tableErr) {
            console.error('Error querying table:', tableErr.message);
        }

    } catch (err) {
        console.error('Connection Error:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkVendors();
