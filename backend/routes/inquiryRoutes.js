const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.post('/', inquiryController.createInquiry);
router.get('/', inquiryController.getInquiries);
router.put('/:id', inquiryController.updateInquiry);

module.exports = router;
