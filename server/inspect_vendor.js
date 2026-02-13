require('dotenv').config();
const { VendorProfile } = require('./config/db');

async function inspectVendor() {
    try {
        const vendor = await VendorProfile.findOne({ order: [['createdAt', 'DESC']] });
        if (!vendor) {
            console.log('No vendors found.');
            process.exit();
        }
        console.log('--- Full Vendor Profile (ID: ' + vendor.id + ') ---');
        console.log('Documents Type:', typeof vendor.documents);
        console.log('Documents Content:', vendor.documents);

        const docs = typeof vendor.documents === 'string' ? JSON.parse(vendor.documents) : vendor.documents;
        console.log('\n--- Parsed Documents ---');
        Object.entries(docs).forEach(([key, val]) => {
            console.log(`${key}: ${val}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

inspectVendor();
