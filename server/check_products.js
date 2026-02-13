const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Product = require('./models/mongo/Product');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const products = await Product.find({ category: 'dresses' });

        console.log(`📊 Found ${products.length} dress products in database\n`);

        // Group by archetype
        const byArchetype = {};
        products.forEach(p => {
            const arch = p.archetype || 'No Archetype';
            if (!byArchetype[arch]) byArchetype[arch] = [];
            byArchetype[arch].push(p.name);
        });

        console.log('Products grouped by archetype:');
        Object.entries(byArchetype).forEach(([archetype, products]) => {
            console.log(`\n${archetype}: ${products.length} products`);
            products.slice(0, 3).forEach(name => console.log(`  - ${name}`));
            if (products.length > 3) console.log(`  ... and ${products.length - 3} more`);
        });

        // Write detailed data to file
        const outputPath = path.join(__dirname, '../.gemini/products_by_archetype.json');
        fs.writeFileSync(outputPath, JSON.stringify(byArchetype, null, 2));
        console.log(`\n✅ Detailed data written to: ${outputPath}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkProducts();
