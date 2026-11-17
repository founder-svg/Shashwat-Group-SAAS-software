const storageService = require('../../../cloud/storage/storageService');
const { initDatabase } = require('../../../database/connection');
const db = initDatabase();

const mockDocuments = [];

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { folder, leadId, dealId, contactId } = req.body;

    // Upload via Unified Cloud Storage (Cloudinary, Supabase, or Local Disk)
    const uploadResult = await storageService.uploadFile(req.file, folder || 'crm-attachments');

    if (db.isMock) {
      const doc = {
        id: `doc-${Date.now()}`,
        file_name: uploadResult.key,
        original_name: req.file.originalname,
        file_size_bytes: req.file.size,
        mime_type: req.file.mimetype,
        storage_provider: uploadResult.provider,
        public_url: uploadResult.url,
        lead_id: leadId || null,
        deal_id: dealId || null,
        created_at: new Date()
      };
      mockDocuments.push(doc);
      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully to cloud storage (Demo Mode)',
        data: doc
      });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const uploadedBy = req.user?.id || null;

    const result = await db.query(
      `INSERT INTO documents (organization_id, uploaded_by, lead_id, deal_id, contact_id, file_name, original_name, file_size_bytes, mime_type, storage_provider, storage_path, public_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        orgId,
        uploadedBy,
        leadId || null,
        dealId || null,
        contactId || null,
        uploadResult.key,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        uploadResult.provider,
        uploadResult.key,
        uploadResult.url
      ]
    );

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully to cloud storage',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

async function getDocuments(req, res, next) {
  try {
    if (db.isMock) {
      return res.json({ success: true, count: mockDocuments.length, data: mockDocuments });
    }

    const result = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadDocument,
  getDocuments
};
