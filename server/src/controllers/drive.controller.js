const googleDriveService = require('../../../cloud/drive/googleDriveService');
const { initDatabase } = require('../../../database/connection');
const db = initDatabase();

async function getDriveFiles(req, res, next) {
  try {
    const { folderCategory } = req.query;

    if (db.isMock) {
      return res.json({
        success: true,
        provider: googleDriveService.isConfigured ? 'google_drive' : 'local_drive_mirror',
        storageLimit: '15 GB (Free)',
        count: 0,
        data: []
      });
    }

    let queryText = 'SELECT * FROM drive_files WHERE 1=1';
    const params = [];

    if (folderCategory) {
      params.push(folderCategory);
      queryText += ` AND folder_category = $${params.length}`;
    }

    queryText += ' ORDER BY created_at DESC LIMIT 100';
    const result = await db.query(queryText, params);

    res.json({
      success: true,
      provider: googleDriveService.isConfigured ? 'google_drive' : 'local_drive_mirror',
      storageLimit: '15 GB (Free Google Cloud Drive)',
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

async function uploadDriveFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { folderCategory = 'general' } = req.body;

    const uploadResult = await googleDriveService.uploadFile({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
      folderCategory
    });

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const userId = req.user?.id || null;

    if (!db.isMock) {
      const dbRes = await db.query(
        `INSERT INTO drive_files (organization_id, uploaded_by, file_name, file_type, folder_category, drive_provider, drive_file_id, web_view_link, download_link, file_size_bytes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [orgId, userId, req.file.originalname, req.file.mimetype, folderCategory, uploadResult.provider, uploadResult.fileId, uploadResult.webViewLink, uploadResult.downloadLink, uploadResult.size]
      );
      return res.status(201).json({ success: true, message: 'Uploaded to Cloud Drive', data: dbRes.rows[0] });
    }

    res.status(201).json({ success: true, message: 'Uploaded to Cloud Drive (Demo Mode)', data: uploadResult });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDriveFiles,
  uploadDriveFile
};
