const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/mysql/User');
const GameProfile = require('../models/mongo/GameProfile');
const { connectMongoDB } = require('../config/db');

async function syncMongo() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // 1. Get all active User IDs from MySQL
        const users = await User.findAll({ attributes: ['id'] });
        const activeUserIds = users.map(u => u.id);
        console.log(`📊 Found ${activeUserIds.length} users in MySQL:`, activeUserIds);

        // 2. Find all GameProfiles in MongoDB
        const profiles = await GameProfile.find({}, { userId: 1 });
        console.log(`📊 Found ${profiles.length} game profiles in MongoDB`);

        // 3. Identify and delete orphaned profiles (those not in MySQL)
        let deletedCount = 0;
        for (const profile of profiles) {
            if (!activeUserIds.includes(profile.userId)) {
                await GameProfile.deleteOne({ _id: profile._id });
                console.log(`🗑️ Deleted orphaned profile for userId: ${profile.userId}`);
                deletedCount++;
            }
        }

        console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} orphaned profiles.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during sync:', error);
        process.exit(1);
    }
}

syncMongo();
