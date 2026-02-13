require('dotenv').config();
const { User } = require('./config/db');

async function cleanup() {
    try {
        const email = 'zuuzeeeeee@gmail.com';
        const users = await User.findAll({ where: { email } });

        if (users.length > 1) {
            console.log(`Found ${users.length} duplicates. Keeping ID: ${users[0].id}, Deleting ID: ${users[1].id}`);
            await User.destroy({ where: { id: users[1].id } });
            console.log('✅ Cleanup complete');
        } else {
            console.log('ℹ️ No duplicates found to clean');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

cleanup();
