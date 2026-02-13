const axios = require('axios');

async function testRegister() {
    const timestamp = Date.now();
    try {
        const response = await axios.post('http://localhost:5000/api/vendors/register', {
            storeName: 'Test Store ' + timestamp,
            businessType: 'Individual',
            ownerName: 'Test Owner',
            email: 'test' + timestamp + '@example.com',
            phone: '123' + (timestamp % 10000000),
            password: 'password123',
            pickupAddress: '123 Test St, City, 123456',
            bankAccountHolder: 'Test Holder',
            bankAccountNumber: '1234567890',
            bankIfsc: 'TEST0001234',
            bankName: 'Test Bank',
            panNumber: 'ABCDE1234F',
            gstNumber: '12ABCDE1234F1Z5'
        });
        console.log('Success:', response.data.message);
        console.log('User ID:', response.data.user.id);
    } catch (error) {
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.response?.data?.message);
        console.error('Error stack:', error.response?.data?.stack);
    }
}

testRegister();
