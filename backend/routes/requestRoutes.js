const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.post('/', requestController.createRequest);
router.get('/', requestController.getRequests);
router.put('/:id', requestController.updateRequest);

module.exports = router;
