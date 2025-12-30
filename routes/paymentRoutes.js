const express = require('express');
const router = express.Router();
const { confirmPayment, getPaymentList } = require('../controllers/paymentController');

// Get available payment methods
router.get('/methods', getPaymentList);

// Callback route (public access usually)
router.post('/callback', confirmPayment);

module.exports = router;
