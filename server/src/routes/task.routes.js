const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, taskController.getTasks);
router.post('/', authenticate, taskController.createTask);

module.exports = router;
