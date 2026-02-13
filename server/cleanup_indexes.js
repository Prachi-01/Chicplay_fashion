const sequelize = require('./config/sequelize');

async function cleanupIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL');

        // 1. Cleanup Users table
        const [userIndexes] = await sequelize.query('SHOW INDEX FROM Users');
        const userDrops = userIndexes
            .filter(idx => idx.Key_name.includes('_') && (idx.Key_name.startsWith('email_') || idx.Key_name.startsWith('username_')))
            .map(idx => idx.Key_name);

        // Remove duplicates from the map if any
        const uniqueUserDrops = [...new Set(userDrops)];

        console.log(`Dropping ${uniqueUserDrops.length} redundant indexes from Users...`);
        for (const indexName of uniqueUserDrops) {
            try {
                await sequelize.query(`ALTER TABLE Users DROP INDEX ${indexName}`);
                console.log(`- Dropped ${indexName}`);
            } catch (e) {
                console.error(`- Failed to drop ${indexName}: ${e.message}`);
            }
        }

        // 2. Cleanup VendorProfiles table (likely same issue)
        const [vendorIndexes] = await sequelize.query('SHOW INDEX FROM VendorProfiles');
        const vendorDrops = vendorIndexes
            .filter(idx => idx.Key_name.includes('_') && (idx.Key_name.startsWith('storeName_') || idx.Key_name.startsWith('userId_')))
            .map(idx => idx.Key_name);

        const uniqueVendorDrops = [...new Set(vendorDrops)];

        console.log(`Dropping ${uniqueVendorDrops.length} redundant indexes from VendorProfiles...`);
        for (const indexName of uniqueVendorDrops) {
            try {
                await sequelize.query(`ALTER TABLE VendorProfiles DROP INDEX ${indexName}`);
                console.log(`- Dropped ${indexName}`);
            } catch (e) {
                console.error(`- Failed to drop ${indexName}: ${e.message}`);
            }
        }

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanupIndexes();
