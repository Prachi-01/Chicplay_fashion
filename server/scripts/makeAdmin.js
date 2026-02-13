const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/mysql/User');
const sequelize = require('../config/sequelize');

async function makeAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Get email from command line argument
        const email = process.argv[2];

        if (!email) {
            console.log('❌ Please provide an email address');
            console.log('Usage: node makeAdmin.js <email>');
            console.log('Example: node makeAdmin.js admin@example.com');
            process.exit(1);
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`❌ User with email "${email}" not found\n`);

            // Show all users
            const allUsers = await User.findAll({
                attributes: ['id', 'username', 'email', 'role']
            });

            console.log('Available users:');
            allUsers.forEach(u => {
                console.log(`  - ${u.email} (${u.username}) - Role: ${u.role}`);
            });

            process.exit(1);
        }

        // Update user role to admin
        user.role = 'admin';
        await user.save();

        console.log('✅ User updated successfully!');
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Username: ${user.username}`);
        console.log(`🔑 Role: ${user.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

makeAdmin();
