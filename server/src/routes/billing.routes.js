const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middleware/auth');

router.get('/invoices', authenticate, billingController.getInvoices);
router.post('/invoices', authenticate, billingController.createInvoice);
router.post('/invoices/:id/payment', authenticate, billingController.recordPayment);

module.exports = router;
