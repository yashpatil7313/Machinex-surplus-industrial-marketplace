const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Any authenticated user can submit a report
router.post('/', reportController.createReport);

// Admin-only review and moderation
router.get('/', authorizeRoles('admin'), reportController.getReports);
router.put('/:id', authorizeRoles('admin'), reportController.updateReport);

module.exports = router;
