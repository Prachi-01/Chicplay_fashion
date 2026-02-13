const mongoose = require('mongoose');
require('dotenv').config();

const Archetype = require('./models/mongo/Archetype');

async function checkArchetypes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const archetypes = await Archetype.find({});

        console.log(`📊 Found ${archetypes.length} archetypes in database:\n`);

        archetypes.forEach((archetype, index) => {
            console.log(`--- Archetype ${index + 1} ---`);
            console.log('Name:', archetype.name);
            console.log('ID:', archetype.id);
            console.log('_id:', archetype._id);
            console.log('heroImage:', archetype.heroImage ? '✓ Set' : '✗ Not set');
            console.log('bannerImage:', archetype.bannerImage ? '✓ Set' : '✗ Not set');
            if (archetype.bannerImage) {
                console.log('Banner URL:', archetype.bannerImage);
            }
            console.log('');
        });

        const boho = archetypes.find(a => a.name === 'Boho Free Spirit' || a.id === 'Boho Free Spirit');
        if (boho) {
            console.log('🎯 Boho Free Spirit Details:');
            console.log(JSON.stringify(boho, null, 2));
        } else {
            console.log('❌ Boho Free Spirit not found in database');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkArchetypes();
