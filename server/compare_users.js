require('dotenv').config();
const { User } = require('./config/db');

async function compareUsers() {
    try {
        const email = 'zuuzeeeeee@gmail.com';
        const users = await User.findAll({ where: { email } });

        console.log(`Found ${users.length} matching users:`);
        users.forEach(u => {
            console.log(`--- User ID: ${u.id} ---`);
            console.log('Username:', u.username);
            console.log('Email:', u.email);
            console.log('Created At:', u.createdAt);
            console.log('Updated At:', u.updatedAt);
            console.log('Reset Code:', u.resetCode);
            console.log('Reset Code Expires:', u.resetCodeExpires);
        });
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

compareUsers();
