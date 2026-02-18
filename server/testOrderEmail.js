const emailService = require('./services/emailService');
require('dotenv').config();

const testOrderEmail = async () => {
    console.log('🧪 Starting Order Confirmation Email Test...');

    const mockOrder = {
        id: 'CHIC-TEST-ORDER-123',
        totalAmount: 4999,
        shippingAddress: '123 Fashion Lane, Mumbai, Maharashtra, 400001',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const mockItems = [
        {
            productName: 'Rose Gold Evening Gown',
            size: 'M',
            color: 'Rose Gold',
            quantity: 1,
            price: 2999,
            imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae'
        },
        {
            productName: 'Crystal Embellished Heels',
            size: '38',
            color: 'Silver',
            quantity: 1,
            price: 2000,
            imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2'
        }
    ];

    try {
        // We'll send it to the developer email for testing
        const result = await emailService.sendOrderConfirmation(process.env.EMAIL_USER, mockOrder, mockItems);
        if (result) {
            console.log('✅ Success! Order confirmation email sent to:', process.env.EMAIL_USER);
        } else {
            console.log('❌ Failed! Email service returned false.');
        }
    } catch (err) {
        console.error('💥 Crash! Error occurred during test:', err);
    }
};

testOrderEmail();
