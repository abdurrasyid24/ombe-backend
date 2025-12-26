const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const orderController = require('../controllers/adminOrderController');

// Protect all admin routes
router.use(protect);
router.use(adminMiddleware);

// Admin Dashboard - Get all orders
router.get('/dashboard', orderController.getDashboard);
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderDetail);

// Update order status
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Users
router.get('/users', orderController.getAllUsers);

// Products
router.get('/products', orderController.getAllProducts);

module.exports = router;
