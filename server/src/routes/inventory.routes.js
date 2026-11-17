const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');

router.get('/items', authenticate, inventoryController.getInventoryItems);
router.post('/items', authenticate, inventoryController.createInventoryItem);

// Stock In (Input) & Stock Out (Output)
router.post('/stock-in', authenticate, inventoryController.handleStockIn);
router.post('/stock-out', authenticate, inventoryController.handleStockOut);

// Transaction History & Audits
router.get('/transactions', authenticate, inventoryController.getStockTransactions);

module.exports = router;
