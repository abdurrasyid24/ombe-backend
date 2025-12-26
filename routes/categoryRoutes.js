const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  deactivateCategory,
  activateCategory,
  getCategoryStats
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/products', getCategoryProducts);

// Admin routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateCategory);
router.put('/:id/activate', protect, authorize('admin'), activateCategory);
router.get('/:id/stats', protect, authorize('admin'), getCategoryStats);

module.exports = router;