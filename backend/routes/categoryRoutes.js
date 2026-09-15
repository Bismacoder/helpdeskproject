const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All category routes require authentication
router.use(protect);

router.route('/')
  .get(getCategories)
  .post(authorize('admin'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(authorize('admin'), updateCategory)
  .delete(authorize('admin'), deleteCategory);

module.exports = router;
