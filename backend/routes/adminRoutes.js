const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/statistics', adminController.getStatistics);
router.get('/listings', adminController.getAdminListings);
router.put('/listings/:id/approve', adminController.approveListing);
router.put('/listings/:id/reject', adminController.rejectListing);
router.get('/backup', adminController.exportDatabase);

module.exports = router;
