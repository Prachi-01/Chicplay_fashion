require('dotenv').config();
const { User } = require('./config/db');

async function checkUser() {
    try {
        const email = 'zuuzeeeeee@gmail.com';
        const user = await User.findOne({ where: { email } });

        if (user) {
            console.log('✅ User found:');
            console.log('ID:', user.id);
            console.log('Username:', user.username);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Password (hashed):', user.password);
            console.log('Reset Code:', user.resetCode);
            console.log('Reset Code Expires:', user.resetCodeExpires);
            console.log('Current Time:', new Date());
            console.log('Expired?', user.resetCodeExpires ? new Date() > user.resetCodeExpires : 'N/A');
        } else {
            console.log('❌ User not found');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUser();
