/**
 * Drive Manager for Shashwat Group CRM
 * Handles storage of:
 *  - Invoices & Billing Slips
 *  - Stock In (Input) Vouchers
 *  - Stock Out (Output) Challans
 *  - Audit Sheets & Reports
 */

const googleDriveService = require('./googleDriveService');
const microPdfGenerator = require('../../server/src/utils/microPdfGenerator');
const { initDatabase } = require('../../database/connection');
const db = initDatabase();

class DriveManager {
  /**
   * Upload an invoice to Cloud Drive (guaranteed size in KB, not MB)
   */
  async saveInvoiceFile({ invoiceNumber, invoiceData, pdfBuffer, organizationId, userId, invoiceId }) {
    let finalBuffer = pdfBuffer;
    let fileSizeKB = 0;

    // Generate ultra-compact vector PDF (typically 4-8 KB)
    if (!finalBuffer && invoiceData) {
      const generated = microPdfGenerator.generateInvoicePdf(invoiceData);
      finalBuffer = generated.buffer;
      fileSizeKB = generated.sizeKB;
    } else if (finalBuffer) {
      fileSizeKB = Number((finalBuffer.length / 1024).toFixed(2));
    }

    const fileName = `Invoice_${invoiceNumber}.pdf`;
    const uploadResult = await googleDriveService.uploadFile({
      fileName,
      mimeType: 'application/pdf',
      buffer: finalBuffer,
      folderCategory: 'Invoices'
    });

    uploadResult.sizeKB = fileSizeKB;

    if (!db.isMock) {
      await db.query(
        `INSERT INTO drive_files (organization_id, uploaded_by, file_name, file_type, folder_category, drive_provider, drive_file_id, web_view_link, download_link, file_size_bytes, entity_type, entity_id)
         VALUES ($1, $2, $3, 'application/pdf', 'invoices', $4, $5, $6, $7, $8, 'invoice', $9)`,
        [organizationId, userId, fileName, uploadResult.provider, uploadResult.fileId, uploadResult.webViewLink, uploadResult.downloadLink, finalBuffer.length, invoiceId]
      );
    }

    return uploadResult;
  }

  /**
   * Upload a Stock In / Stock Out Voucher (guaranteed size in KB, not MB)
   */
  async saveStockVoucher({ type, referenceNumber, transactionData, fileBuffer, mimeType, organizationId, userId, transactionId }) {
    let finalBuffer = fileBuffer;
    let fileSizeKB = 0;

    if (!finalBuffer && transactionData) {
      const generated = microPdfGenerator.generateStockVoucherPdf(transactionData);
      finalBuffer = generated.buffer;
      fileSizeKB = generated.sizeKB;
    } else if (finalBuffer) {
      fileSizeKB = Number((finalBuffer.length / 1024).toFixed(2));
    }

    const folderCategory = type === 'STOCK_IN' || type === 'INPUT' ? 'Stock-In-Vouchers' : 'Stock-Out-Dispatches';
    const fileName = `Voucher_${type}_${referenceNumber || Date.now()}.pdf`;

    const uploadResult = await googleDriveService.uploadFile({
      fileName,
      mimeType: mimeType || 'application/pdf',
      buffer: finalBuffer,
      folderCategory
    });

    uploadResult.sizeKB = fileSizeKB;

    if (!db.isMock) {
      await db.query(
        `INSERT INTO drive_files (organization_id, uploaded_by, file_name, file_type, folder_category, drive_provider, drive_file_id, web_view_link, download_link, file_size_bytes, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'stock_transaction', $11)`,
        [organizationId, userId, fileName, mimeType || 'application/pdf', folderCategory, uploadResult.provider, uploadResult.fileId, uploadResult.webViewLink, uploadResult.downloadLink, finalBuffer.length, transactionId]
      );
    }

    return uploadResult;
  }
}

module.exports = new DriveManager();
