/**
 * Google Drive API Service for Shashwat Group CRM
 * 100% FREE Tier: 15 GB of cloud storage per standard Google Account.
 * Used for storing and auto-organizing:
 *  - Billing & Invoices (PDFs)
 *  - Stock-In Purchase Bills & Supplier Receipts
 *  - Stock-Out Delivery Challans & Dispatch Slips
 *  - Daily Inventory Input/Output Audit Sheets
 */

const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

let driveClient = null;

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

class GoogleDriveService {
  constructor() {
    this.folderCache = {};
    this.isConfigured = false;
    this.init();
  }

  init() {
    try {
      const { google } = require('googleapis');
      const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
      const privateKey = (process.env.GOOGLE_DRIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

      if (clientEmail && privateKey) {
        const auth = new google.auth.JWT(
          clientEmail,
          null,
          privateKey,
          ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
        );
        driveClient = google.drive({ version: 'v3', auth });
        this.isConfigured = true;
        console.log('✅ Google Drive API connected successfully (15GB Free Cloud Drive enabled).');
      } else {
        console.warn('ℹ️  Google Drive credentials not set in .env. Operating in Local Drive Mirror mode.');
      }
    } catch (err) {
      console.warn('ℹ️  googleapis not initialized. Operating in Local Drive Mirror mode.');
    }
  }

  /**
   * Uploads a file to Google Drive in the specified category folder
   */
  async uploadFile({ fileName, mimeType, buffer, folderCategory = 'invoices' }) {
    if (!this.isConfigured || !driveClient) {
      // Local fallback mirror
      return this.uploadLocalFallback({ fileName, mimeType, buffer, folderCategory });
    }

    try {
      const parentFolderId = await this.getOrCreateFolder(folderCategory);

      const fileMetadata = {
        name: fileName,
        parents: parentFolderId ? [parentFolderId] : []
      };

      const media = {
        mimeType: mimeType || 'application/octet-stream',
        body: bufferToStream(buffer)
      };

      const file = await driveClient.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size'
      });

      // Set public/organization read permission on the uploaded document
      try {
        await driveClient.permissions.create({
          fileId: file.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          }
        });
      } catch (permErr) {
        console.warn('[Drive Permission Warning]:', permErr.message);
      }

      return {
        success: true,
        provider: 'google_drive',
        fileId: file.data.id,
        fileName: file.data.name,
        webViewLink: file.data.webViewLink,
        downloadLink: file.data.webContentLink,
        size: buffer.length
      };
    } catch (err) {
      console.error('[Google Drive Upload Error]:', err.message);
      return this.uploadLocalFallback({ fileName, mimeType, buffer, folderCategory });
    }
  }

  /**
   * Creates or retrieves folder ID in Google Drive
   */
  async getOrCreateFolder(folderName) {
    if (this.folderCache[folderName]) {
      return this.folderCache[folderName];
    }

    const rootFolderName = 'Shashwat-CRM';
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    try {
      const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      const res = await driveClient.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (res.data.files && res.data.files.length > 0) {
        const folderId = res.data.files[0].id;
        this.folderCache[folderName] = folderId;
        return folderId;
      }

      // Create folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: rootFolderId ? [rootFolderId] : []
      };

      const folder = await driveClient.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      this.folderCache[folderName] = folder.data.id;
      return folder.data.id;
    } catch (err) {
      console.error('[Get Folder Error]:', err.message);
      return null;
    }
  }

  /**
   * Fallback to structured local drive mirror
   */
  async uploadLocalFallback({ fileName, mimeType, buffer, folderCategory }) {
    const driveDir = path.join(__dirname, 'local_drive', folderCategory);
    if (!fs.existsSync(driveDir)) {
      fs.mkdirSync(driveDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(driveDir, uniqueName);

    if (buffer) {
      await fs.promises.writeFile(filePath, buffer);
    }

    const relativeUrl = `/drive/files/${folderCategory}/${uniqueName}`;

    return {
      success: true,
      provider: 'local_drive_mirror',
      fileId: `local-${uniqueName}`,
      fileName,
      webViewLink: relativeUrl,
      downloadLink: relativeUrl,
      size: buffer ? buffer.length : 0
    };
  }
}

module.exports = new GoogleDriveService();
