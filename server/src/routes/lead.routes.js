const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, leadController.getLeads);
router.post('/', authenticate, leadController.createLead);
router.patch('/:id/status', authenticate, leadController.updateLeadStatus);

module.exports = router;
