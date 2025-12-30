const db = require('../models');
const paymentService = require('../services/paymentService');

exports.getPaymentList = async (req, res) => {
    try {
        const strAmount = req.query.amount || '10000';
        const amount = parseInt(strAmount);

        const methods = await paymentService.getPaymentMethods(amount);

        res.status(200).json({
            success: true,
            data: methods
        });
    } catch (error) {
        console.error('Get Payment Methods Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment methods'
        });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { merchantOrderId, resultCode, reference } = req.body;

        console.log('Payment Callback Received:', req.body);

        // Validate callback signature
        if (!paymentService.validateCallback(req.body)) {
            console.error('Invalid payment signature');
            return res.status(400).send('Invalid signature');
        }

        const order = await db.Order.findOne({ where: { orderNumber: merchantOrderId } });

        if (!order) {
            console.error('Order not found for callback:', merchantOrderId);
            return res.status(404).send('Order not found');
        }

        if (resultCode === '00') { // Success
            order.status = 'paid'; // Status 'paid' means payment success, waiting for admin to process
            order.paymentReference = reference;
            await order.save();
        } else if (resultCode === '01') { // Failed
            // order.status = 'cancelled'; // Optional: auto cancel or keep pending
            // await order.save();
        }

        // Return OK to Duitku
        res.status(200).send('OK');

    } catch (error) {
        console.error('Payment callback error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.forceSuccess = async (req, res) => {
    try {
        const { merchantOrderId } = req.params;
        const order = await db.Order.findOne({ where: { orderNumber: merchantOrderId } });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        order.status = 'paid';
        await order.save();

        res.status(200).send(`
            <h1>Success!</h1>
            <p>Order <b>${merchantOrderId}</b> has been manually set to <b>PAID</b>.</p>
            <p>You can now check the mobile app.</p>
        `);
    } catch (error) {
        res.status(500).send('Error updating order: ' + error.message);
    }
};
