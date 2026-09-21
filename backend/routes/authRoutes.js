const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected user profile
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

// Admin-only user management
router.get('/users', authenticateToken, authorizeRoles('admin'), authController.getAllUsers);
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), authController.deleteUser);

module.exports = router;
