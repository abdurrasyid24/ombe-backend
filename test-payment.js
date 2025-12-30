require('dotenv').config();
const paymentService = require('./services/paymentService');

async function testConnection() {
    console.log('Testing Duitku Connection...');
    console.log('Merchant Code:', process.env.DUITKU_MERCHANT_CODE ? 'Set' : 'Not Set');
    console.log('API Key:', process.env.DUITKU_API_KEY ? 'Set' : 'Not Set');

    if (!process.env.DUITKU_MERCHANT_CODE || !process.env.DUITKU_API_KEY) {
        console.error('❌ Error: Credentials missing in .env');
        return;
    }

    const mockOrder = {
        finalTotal: 20000,
        orderNumber: 'TEST-' + Date.now()
    };

    const mockUser = {
        username: 'teser',
        fullName: 'Tester Duitku',
        email: 'test@example.com',
        phone: '08123456789'
    };

    const mockItems = [
        {
            product: { name: 'Kopi Testing' },
            price: 20000,
            quantity: 1
        }
    ];

    try {
        console.log('Requesting payment URL...');
        const result = await paymentService.createPayment(mockOrder, mockUser, mockItems);
        console.log('\n✅ SUCCESS! Payment Link Created:');
        console.log('----------------------------------------');
        console.log('URL:', result.paymentUrl);
        console.log('Ref:', result.reference);
        console.log('----------------------------------------');
        console.log('Please click the URL to verify it opens the Duitku Sandbox page.');
    } catch (error) {
        console.error('\n❌ connection Failed:', error.message);
        if (error.message.includes('Signature')) {
            console.log('Hint: Check if your Merchant Code and API Key are exactly correct.');
        }
    }
}

testConnection();
