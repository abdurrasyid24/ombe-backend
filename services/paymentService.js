const config = require('../config/duitku');

class ItemDetail {
    constructor(name, price, quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
}

class PaymentService {
    async createPayment(order, user, items, paymentMethod = '') {
        try {
            // Prepare item details
            const itemDetails = items.map(item => {
                return new ItemDetail(
                    item.product.name,
                    item.price,
                    item.quantity
                );
            });

            // Using Raw HTTP for reliability
            const response = await this.requestPaymentRaw(order, user, items, paymentMethod);
            return response;

        } catch (error) {
            console.error('Payment service error:', error);
            throw error;
        }
    }

    async requestPaymentRaw(order, user, items, paymentMethod = '') {
        // Implementing direct API call to Duitku Sandbox
        // Doc: https://docs.duitku.com/

        // We need crypto for MD5 signature (built-in node)
        const crypto = require('crypto');

        const merchantCode = config.merchantCode;
        const apiKey = config.apiKey;
        // CURRENCY CONVERSION (Simple Logic for Demo)
        // If amount is small (e.g. < 1000), assume it's USD and convert to IDR
        // Duitku requires IDR. Rate: 1 USD = 16,000 IDR
        let finalAmount = parseInt(order.finalTotal);
        if (finalAmount < 1000) {
            console.log(`Amount ${finalAmount} detected as likely USD. Converting to IDR...`);
            finalAmount = Math.ceil(order.finalTotal * 16000);
        }

        // Minimum Duitku transaction is usually Rp 10.000
        if (finalAmount < 10000) {
            console.log(`Amount ${finalAmount} is below minimum. Adjusting to 10,000 for Sandbox testing.`);
            finalAmount = 10000;
        }

        const paymentAmount = finalAmount;
        const merchantOrderId = order.orderNumber;

        // Signature = MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
        const signatureStr = merchantCode + merchantOrderId + paymentAmount + apiKey;
        const signature = crypto.createHash('md5').update(signatureStr).digest('hex');

        const payload = {
            merchantCode: merchantCode,
            paymentAmount: paymentAmount,
            paymentMethod: paymentMethod, // If empty, Duitku shows selection page
            merchantOrderId: merchantOrderId,
            productDetails: `Payment for Order ${order.orderNumber}`,
            additionalParam: '',
            merchantUserInfo: user.username,
            customerVaName: user.fullName,
            email: user.email,
            phoneNumber: user.phone || '08123456789',
            // itemDetails: items, 
            callbackUrl: config.webhookUrl,
            returnUrl: config.returnUrl,
            expiryPeriod: 1440, // 24 Hours
            signature: signature
        };

        // Use fetch
        const response = await fetch(`${config.passportUrl}/api/merchant/v2/inquiry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.statusCode !== '00') {
            console.error('Duitku Payment Error Response:', JSON.stringify(data, null, 2));
            const msg = data.statusMessage || data.Message || 'Unknown Error';
            throw new Error(`Duitku Error: ${msg}`);
        }

        return {
            paymentUrl: data.paymentUrl,
            reference: data.reference,
            paymentCode: data.paymentCode || ''
        };
    }

    // New method to get available payment methods from Duitku
    async getPaymentMethods(amount) {
        const crypto = require('crypto');
        const merchantCode = config.merchantCode;
        const apiKey = config.apiKey;

        // ... (existing date logic) ...
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const signatureStr = merchantCode + amount + formattedDate + apiKey;
        const signature = crypto.createHash('sha256').update(signatureStr).digest('hex');

        const payload = {
            merchantCode: merchantCode,
            amount: amount,
            datetime: formattedDate,
            signature: signature
        };

        try {
            const response = await fetch(`${config.passportUrl}/api/merchant/paymentmethod/getpaymentmethod`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // Check for error in getPaymentMethods response
            // Duitku usually returns 'responseCode' in this endpoint or 'paymentFee' array
            if (data.responseCode && data.responseCode !== '00') {
                console.error('Duitku GetMethods Error:', data);
                return [];
            }

            return data.paymentFee || [];
        } catch (e) {
            console.error('Failed to fetch payment methods:', e);
            return [];
        }
    }

    validateCallback(data) {
        const crypto = require('crypto');
        const { merchantCode, amount, merchantOrderId, signature } = data;

        // Formula for callback signature validation from Duitku Docs (usually):
        // MD5(merchantCode + amount + merchantOrderId + apiKey)
        const signatureStr = config.merchantCode + amount + merchantOrderId + config.apiKey;
        const calcSignature = crypto.createHash('md5').update(signatureStr).digest('hex');

        return calcSignature === signature;
    }
}

module.exports = new PaymentService();

