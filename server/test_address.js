const { Address, User } = require('./config/db');

async function testCreate() {
    try {
        const user = await User.findOne();
        if (!user) {
            console.log('No user found');
            return;
        }
        console.log('Using User ID:', user.id);
        const addr = await Address.create({
            userId: user.id,
            fullName: 'Test User',
            phoneNumber: '1234567890',
            addressLine: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456'
        });
        console.log('Created Address ID:', addr.id);
        await addr.destroy();
        console.log('Test Address deleted');
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        process.exit(0);
    }
}

testCreate();
