/**
 * Unified Cloud Storage Service for Shashwat Group CRM
 * Supports multiple free-tier cloud providers:
 *  1. Supabase Storage (1GB Free)
 *  2. Cloudinary (25GB Free Storage & CDN)
 *  3. Local Disk Storage (Fallback & Zero-cost Dev)
 */

const localDiskProvider = require('./providers/localDiskStorage');
const supabaseProvider = require('./providers/supabaseStorage');
const cloudinaryProvider = require('./providers/cloudinaryStorage');

class StorageService {
  constructor() {
    this.providerName = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
  }

  getProvider() {
    switch (this.providerName) {
      case 'supabase':
        return supabaseProvider;
      case 'cloudinary':
        return cloudinaryProvider;
      case 'local':
      default:
        return localDiskProvider;
    }
  }

  /**
   * Upload a file
   * @param {Object} file - { originalname, buffer, mimetype, size }
   * @param {String} folder - destination folder e.g. 'crm-leads' or 'contracts'
   */
  async uploadFile(file, folder = 'general') {
    const provider = this.getProvider();
    console.log(`[Storage] Uploading ${file.originalname} using ${this.providerName} provider...`);
    return await provider.upload(file, folder);
  }

  /**
   * Delete a file
   * @param {String} fileKeyOrUrl
   */
  async deleteFile(fileKeyOrUrl) {
    const provider = this.getProvider();
    return await provider.delete(fileKeyOrUrl);
  }

  /**
   * Get public or signed URL for a file
   * @param {String} fileKey
   */
  async getFileUrl(fileKey) {
    const provider = this.getProvider();
    return await provider.getUrl(fileKey);
  }
}

module.exports = new StorageService();
