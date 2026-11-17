const express = require('express');
const router = express.Router();
const multer = require('multer');
const driveController = require('../controllers/drive.controller');
const { authenticate } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

router.get('/files', authenticate, driveController.getDriveFiles);
router.post('/upload', authenticate, upload.single('file'), driveController.uploadDriveFile);

module.exports = router;
