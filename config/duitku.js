

const config = {
    merchantCode: process.env.DUITKU_MERCHANT_CODE || 'D12345', // Default Sandbox Merchant Code
    apiKey: process.env.DUITKU_API_KEY || 'YOUR_SANDBOX_API_KEY',
    passportUrl: process.env.DUITKU_PASSPORT_URL || 'https://sandbox.duitku.com/webapi', // Sandbox URL
    webhookUrl: process.env.DUITKU_CALLBACK_URL || 'http://localhost:5000/api/payment/callback',
    returnUrl: process.env.DUITKU_RETURN_URL || 'http://localhost:8080/order/status'
};

module.exports = config;
