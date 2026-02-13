const sequelize = require('./config/sequelize');

async function checkIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL');

        const [results] = await sequelize.query('SHOW INDEX FROM VendorProfiles');
        console.log(`--- Indexes on VendorProfiles (${results.length}) ---`);
        results.forEach(idx => {
            console.log(`- ${idx.Key_name}: ${idx.Column_name}`);
        });

        const [userResults] = await sequelize.query('SHOW INDEX FROM Users');
        console.log(`\n--- Indexes on Users (${userResults.length}) ---`);
        userResults.forEach(idx => {
            console.log(`- ${idx.Key_name}: ${idx.Column_name}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIndexes();
