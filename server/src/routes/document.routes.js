const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth');

// Memory storage for forwarding to cloud storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit per file
  }
});

router.post('/upload', authenticate, upload.single('file'), documentController.uploadDocument);
router.get('/', authenticate, documentController.getDocuments);

module.exports = router;
