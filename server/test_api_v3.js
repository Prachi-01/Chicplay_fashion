const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });
const axios = require('axios');

async function testApi() {
    try {
        const token = jwt.sign(
            { id: 1, role: 'user' },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '1d' }
        );
        console.log('Generated token for user 1');

        console.log('Testing Add Address...');
        const addrRes = await axios.post('http://localhost:5000/api/addresses', {
            fullName: 'API Tester',
            phoneNumber: '1234567890',
            addressLine: '123 API St',
            city: 'API City',
            state: 'API State',
            pincode: '123456',
            landmark: 'Near API'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Add Address success:', addrRes.data);
    } catch (err) {
        console.error('API Test failed:', err.response?.data || err.message);
    }
}

testApi();
