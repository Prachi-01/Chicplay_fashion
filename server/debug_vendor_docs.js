require('dotenv').config();
const { VendorProfile } = require('./config/db');

async function checkVendorDocs() {
    try {
        const vendors = await VendorProfile.findAll();
        console.log(`Checking ${vendors.length} vendors:`);
        vendors.forEach(v => {
            console.log(`--- Vendor: ${v.storeName} (ID: ${v.id}) ---`);
            console.log('Documents:', JSON.stringify(v.documents, null, 2));
        });
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkVendorDocs();
