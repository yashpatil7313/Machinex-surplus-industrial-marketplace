const express = require('express');
const router = express.Router();
const partsController = require('../controllers/partsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public endpoints
router.get('/', partsController.getParts);
router.get('/featured', partsController.getFeaturedParts);

// Seller-specific endpoints
router.get('/seller/my-listings', authenticateToken, authorizeRoles('seller', 'admin'), partsController.getSellerListings);
router.get('/seller/inventory-value', authenticateToken, authorizeRoles('seller', 'admin'), partsController.getSellerInventoryValue);

// Single part details (public)
router.get('/:id', partsController.getPartById);

// Create, update, delete part
router.post('/', authenticateToken, authorizeRoles('seller', 'admin'), upload.single('image'), partsController.createPart);
router.put('/:id', authenticateToken, authorizeRoles('seller', 'admin'), upload.single('image'), partsController.updatePart);
router.delete('/:id', authenticateToken, authorizeRoles('seller', 'admin'), partsController.deletePart);

module.exports = router;
