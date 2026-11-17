const express = require('express');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, dealController.getDeals);
router.post('/', authenticate, dealController.createDeal);
router.patch('/:id/stage', authenticate, dealController.updateDealStage);

module.exports = router;
