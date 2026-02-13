require('dotenv').config();
const { User } = require('./config/db');
const { Op } = require('sequelize');

async function debugFlow() {
    try {
        const email = 'zuuzeeeeee@gmail.com';
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log('--- Step 1: Setting OTP ---');
        const otp = '123456';
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        await user.update({
            resetCode: otp,
            resetCodeExpires: expires
        });
        console.log(`✅ Set OTP: ${otp}, Expires: ${expires}`);

        console.log('--- Step 2: Querying OTP (Like Controller) ---');
        const foundUser = await User.findOne({
            where: {
                email,
                resetCode: otp,
                resetCodeExpires: { [Op.gt]: new Date() }
            }
        });

        if (foundUser) {
            console.log('✅ Found user with OTP query!');
        } else {
            console.log('❌ FAILED to find user with OTP query');
            // Check why
            const checkUser = await User.findOne({ where: { email } });
            console.log('Current DB State:');
            console.log('Reset Code in DB:', checkUser.resetCode);
            console.log('Type of Reset Code in DB:', typeof checkUser.resetCode);
            console.log('Expires in DB:', checkUser.resetCodeExpires);
            console.log('Now:', new Date());
            console.log('Is Op.gt satisfied?', checkUser.resetCodeExpires > new Date());
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugFlow();
