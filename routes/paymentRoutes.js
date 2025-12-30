const express = require('express');
const router = express.Router();
const { confirmPayment, getPaymentList, forceSuccess } = require('../controllers/paymentController');

// Get available payment methods
router.get('/methods', getPaymentList);

// MANUAL FORCE SUCCESS (Development Only)
router.get('/force-success/:merchantOrderId', forceSuccess);

// Callback route (public access usually)
router.post('/callback', confirmPayment);

module.exports = router;
