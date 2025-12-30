require('dotenv').config();
const paymentService = require('./services/paymentService');

async function testMethods() {
    console.log('Testing Duitku Payment Methods...');

    if (!process.env.DUITKU_MERCHANT_CODE || !process.env.DUITKU_API_KEY) {
        console.error('❌ Error: Credentials missing in .env');
        return;
    }

    // 1. Get Payment Methods
    try {
        console.log('\n--- Fetching Available Payment Methods ---');
        const methods = await paymentService.getPaymentMethods(10000);
        console.log('Available Methods:', methods.length);
        methods.forEach(m => {
            console.log(`- [${m.paymentMethod}] ${m.paymentName}`);
        });
    } catch (e) {
        console.error('Failed to get methods:', e.message);
    }

    const mockOrder = {
        finalTotal: 20000,
        orderNumber: 'TEST-QRIS-' + Date.now()
    };

    const mockUser = {
        username: 'teser',
        fullName: 'Tester QRIS',
        email: 'test@example.com',
        phone: '08123456789'
    };

    const mockItems = [
        {
            product: { name: 'Kopi QRIS' },
            price: 20000,
            quantity: 1
        }
    ];

    // 2. Create QRIS Transaction (Code usually 'SP' or 'QR' or 'SH')
    // Note: In Sandbox, 'SP' is often ShopeePay which acts as QRIS.
    // Or 'DQ' (Duitku QRIS). Check the list printed above to be sure.
    // We try generic approach or pass specific if known.

    try {
        console.log('\n--- Creating QRIS / ShopeePay Transaction (Code: SP) ---');
        const result = await paymentService.createPayment(mockOrder, mockUser, mockItems, 'SP');
        console.log('✅ SUCCESS! Payment Link Created:');
        console.log('URL:', result.paymentUrl);
        console.log('Ref:', result.reference);
        console.log('Note: If "SP" is not enabled in Sandbox, this might default to selection page or error.');
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

testMethods();
