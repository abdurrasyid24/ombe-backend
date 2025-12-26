const express = require('express');
const router = express.Router();
const path = require('path');

// Login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// Admin dashboard - protected by middleware on the frontend
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Admin orders page
router.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

module.exports = router;
