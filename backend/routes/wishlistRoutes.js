const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Buyer wishlist routes
router.use(authenticateToken);
router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:partId', wishlistController.removeFromWishlist);

module.exports = router;
