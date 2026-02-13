require('dotenv').config();
const { User, VendorProfile } = require('./config/db');
const bcrypt = require('bcryptjs');

async function finalVerify() {
    try {
        const testEmail = 'UpgradeTest@ChicPlay.com';
        const lowerEmail = testEmail.toLowerCase();

        console.log('--- Step 1: Create a regular user with mixed case ---');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        // This should trigger the beforeSave hook
        let user = await User.create({
            username: 'upgrade_user',
            email: testEmail,
            password: hash,
            role: 'user'
        });

        console.log('Saved Email in DB:', user.email);
        if (user.email === lowerEmail) {
            console.log('✅ Hook: Email correctly lowercased on creation.');
        } else {
            console.log('❌ Hook: Email remained mixed case.');
        }

        console.log('--- Step 2: Simulate Vendor Registration (Upgrade) ---');
        // Logic from controller: find by normalized email
        let foundUser = await User.findOne({ where: { email: lowerEmail } });
        if (foundUser && foundUser.role !== 'vendor') {
            console.log('✅ Found existing regular user to upgrade.');
            foundUser.role = 'vendor';
            await foundUser.save();
            console.log('New Role:', foundUser.role);
        }

        const updatedUser = await User.findByPk(user.id);
        if (updatedUser.role === 'vendor') {
            console.log('✅ Upgrade successful in DB.');
        } else {
            console.log('❌ Upgrade failed.');
        }

        console.log('--- Cleanup ---');
        await User.destroy({ where: { id: user.id } });
        console.log('✅ Test Data Cleaned');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

finalVerify();
