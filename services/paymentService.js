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
        const paymentAmount = parseInt(order.finalTotal); // Ensure integer
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
            expiryPeriod: 60,
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
            throw new Error(`Duitku Error: ${data.statusMessage}`);
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
        const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:mm:ss (Approx)
        // Duitku expects DateTime in signature but format varies. 
        // Docs for getPaymentMethod: 
        // URL: /api/merchant/paymentmethod/getpaymentmethod
        // Param: merchantcode, amount, datetime, signature
        // Signature: SHA256(merchantcode + amount + datetime + apiKey)

        // Actually for Sandbox/production correct format is usually YYYY-MM-DD HH:MM:SS
        // Let's use specific format function
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

        const response = await fetch(`${config.passportUrl}/api/merchant/paymentmethod/getpaymentmethod`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data.paymentFee || [];
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

