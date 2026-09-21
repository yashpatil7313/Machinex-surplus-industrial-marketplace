const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public categories list
router.get('/', categoryController.getCategories);

// Admin-only management
router.post('/', authenticateToken, authorizeRoles('admin'), categoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRoles('admin'), categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;
