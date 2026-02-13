const mongoose = require('mongoose');
require('dotenv').config();

const Archetype = require('./models/mongo/Archetype');

async function checkArchetypes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const archetypes = await Archetype.find({});
        console.log(JSON.stringify(archetypes, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkArchetypes();
