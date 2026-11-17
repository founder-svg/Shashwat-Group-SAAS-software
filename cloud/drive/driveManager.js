/**
 * Drive Manager for Shashwat Group CRM
 * Handles storage of:
 *  - Invoices & Billing Slips
 *  - Stock In (Input) Vouchers
 *  - Stock Out (Output) Challans
 *  - Audit Sheets & Reports
 */

const googleDriveService = require('./googleDriveService');
const { initDatabase } = require('../../database/connection');
const db = initDatabase();

class DriveManager {
  /**
   * Upload an invoice to Cloud Drive
   */
  async saveInvoiceFile({ invoiceNumber, pdfBuffer, organizationId, userId, invoiceId }) {
    const fileName = `Invoice_${invoiceNumber}.pdf`;
    const uploadResult = await googleDriveService.uploadFile({
      fileName,
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
      folderCategory: 'Invoices'
    });

    if (!db.isMock) {
      await db.query(
        `INSERT INTO drive_files (organization_id, uploaded_by, file_name, file_type, folder_category, drive_provider, drive_file_id, web_view_link, download_link, file_size_bytes, entity_type, entity_id)
         VALUES ($1, $2, $3, 'application/pdf', 'invoices', $4, $5, $6, $7, $8, 'invoice', $9)`,
        [organizationId, userId, fileName, uploadResult.provider, uploadResult.fileId, uploadResult.webViewLink, uploadResult.downloadLink, uploadResult.size, invoiceId]
      );
    }

    return uploadResult;
  }

  /**
   * Upload a Stock In / Stock Out Voucher
   */
  async saveStockVoucher({ type, referenceNumber, fileBuffer, mimeType, organizationId, userId, transactionId }) {
    const folderCategory = type === 'STOCK_IN' || type === 'INPUT' ? 'Stock-In-Vouchers' : 'Stock-Out-Dispatches';
    const fileName = `Voucher_${type}_${referenceNumber || Date.now()}.pdf`;

    const uploadResult = await googleDriveService.uploadFile({
      fileName,
      mimeType: mimeType || 'application/pdf',
      buffer: fileBuffer,
      folderCategory
    });

    if (!db.isMock) {
      await db.query(
        `INSERT INTO drive_files (organization_id, uploaded_by, file_name, file_type, folder_category, drive_provider, drive_file_id, web_view_link, download_link, file_size_bytes, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'stock_transaction', $11)`,
        [organizationId, userId, fileName, mimeType || 'application/pdf', folderCategory, uploadResult.provider, uploadResult.fileId, uploadResult.webViewLink, uploadResult.downloadLink, uploadResult.size, transactionId]
      );
    }

    return uploadResult;
  }
}

module.exports = new DriveManager();
