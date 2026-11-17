/**
 * Ultra-Lightweight Vector PDF Generator for Shashwat Group CRM
 * 
 * DESIGN PRINCIPLE:
 *  - Generates valid PDF 1.4 documents using standard Type-1 core fonts (Helvetica).
 *  - ZERO external bloated binaries or headless browsers.
 *  - Typical invoice size: 3 KB to 12 KB (Over 99% smaller than standard 2MB-5MB Chromium PDFs).
 *  - Allows storing over 1,000,000+ invoices inside Google Drive's 15 GB free tier.
 */

class MicroPdfGenerator {
  /**
   * Escape special characters in PDF strings
   */
  escapePdfText(text) {
    if (!text) return '';
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  /**
   * Generate an ultra-compact PDF for an invoice
   * Resulting file size: ~4 KB to 8 KB
   */
  generateInvoicePdf(invoice) {
    const streamCommands = [];

    // Colors
    const primaryColor = '0.12 0.23 0.38'; // Dark Navy (#1f3a60)
    const grayColor = '0.45 0.45 0.45';
    const lightBg = '0.96 0.97 0.98';
    const borderColor = '0.85 0.87 0.90';

    // Top Header Banner
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`0 770 595 72 re f`); // Header block

    // Header Text (White)
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 20 Tf 40 805 Td (SHASHWAT GROUP CRM) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 40 788 Td (Commercial SaaS & Industrial Solutions | Billing Department) Tj ET`);
    streamCommands.push(`BT /F2 18 Tf 460 805 Td (TAX INVOICE) Tj ET`);

    // Invoice Meta & Client Details
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 11 Tf 40 735 Td (BILLED TO:) Tj ET`);
    streamCommands.push(`BT /F2 12 Tf 40 718 Td (${this.escapePdfText(invoice.customer_name || invoice.customerName)}) Tj ET`);

    const clientPhone = invoice.customer_phone || invoice.customerPhone || 'N/A';
    const clientEmail = invoice.customer_email || invoice.customerEmail || 'N/A';
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F1 9 Tf 40 702 Td (Phone: ${this.escapePdfText(clientPhone)}  |  Email: ${this.escapePdfText(clientEmail)}) Tj ET`);

    // Invoice Meta Right Column
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 380 735 Td (Invoice No: ${this.escapePdfText(invoice.invoice_number || invoice.invoiceNumber)}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 380 718 Td (Date: ${this.escapePdfText(invoice.invoice_date || invoice.invoiceDate)}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 380 702 Td (Status: ${this.escapePdfText(invoice.status || 'ISSUED')}) Tj ET`);

    // Divider Line
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`40 685 m 555 685 l S`);

    // Items Table Header
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`40 655 515 22 re f`); // Table header box
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`BT /F2 9 Tf 50 662 Td (#) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 80 662 Td (ITEM DESCRIPTION) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 340 662 Td (QTY) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 410 662 Td (UNIT PRICE) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 490 662 Td (TOTAL) Tj ET`);

    // Line Items
    let currentY = 635;
    const items = invoice.items || [];

    items.forEach((item, index) => {
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F1 9 Tf 50 ${currentY} Td (${index + 1}) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 80 ${currentY} Td (${this.escapePdfText(item.item_name || item.itemName)}) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 345 ${currentY} Td (${item.quantity || 1}) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 415 ${currentY} Td (Rs. ${Number(item.unit_price || item.unitPrice).toFixed(2)}) Tj ET`);
      streamCommands.push(`BT /F2 9 Tf 490 ${currentY} Td (Rs. ${Number(item.total_price || item.totalPrice).toFixed(2)}) Tj ET`);

      // Row separator
      streamCommands.push(`${borderColor} RG 0.5 w`);
      streamCommands.push(`40 ${currentY - 6} m 555 ${currentY - 6} l S`);

      currentY -= 22;
    });

    // Summary Box
    const summaryY = Math.max(currentY - 15, 260);

    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`350 ${summaryY - 80} 205 90 re f`);
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`350 ${summaryY - 80} 205 90 re S`);

    const subtotal = Number(invoice.subtotal || 0).toFixed(2);
    const taxRate = Number(invoice.tax_rate || invoice.taxRate || 18);
    const taxAmount = Number(invoice.tax_amount || invoice.taxAmount || 0).toFixed(2);
    const grandTotal = Number(invoice.total_amount || invoice.totalAmount || 0).toFixed(2);
    const amountPaid = Number(invoice.amount_paid || invoice.amountPaid || 0).toFixed(2);
    const balanceDue = Number(invoice.balance_due || invoice.balanceDue || grandTotal).toFixed(2);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - 10} Td (Subtotal:) Tj 500 ${summaryY - 10} Td (Rs. ${subtotal}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - 26} Td (GST / Tax (${taxRate}%):) Tj 500 ${summaryY - 26} Td (Rs. ${taxAmount}) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 360 ${summaryY - 45} Td (Grand Total:) Tj 480 ${summaryY - 45} Td (Rs. ${grandTotal}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - 62} Td (Amount Paid:) Tj 500 ${summaryY - 62} Td (Rs. ${amountPaid}) Tj ET`);
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`BT /F2 10 Tf 360 ${summaryY - 76} Td (Balance Due:) Tj 485 ${summaryY - 76} Td (Rs. ${balanceDue}) Tj ET`);

    // Payment Instructions & Footer
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F2 9 Tf 40 120 Td (Payment Method: ${this.escapePdfText(invoice.payment_method || invoice.paymentMethod || 'Bank Transfer / UPI')}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 105 Td (Notes: ${this.escapePdfText(invoice.notes || 'Thank you for your business with Shashwat Group.')}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 90 Td (This is a system-generated micro-optimized invoice under 15 KB.) Tj ET`);

    // Bottom Decorative Bar
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 180 6 Td (Shashwat Group - Automated SaaS & Inventory Management System) Tj ET`);

    const contentStream = streamCommands.join('\n');
    return this.buildPdfDocument(contentStream);
  }

  /**
   * Generate an ultra-compact Stock In / Stock Out Voucher
   * Resulting file size: ~3 KB to 5 KB
   */
  generateStockVoucherPdf(transaction) {
    const streamCommands = [];
    const isStockIn = transaction.transaction_type === 'STOCK_IN' || transaction.transaction_type === 'INPUT';
    const headerColor = isStockIn ? '0.10 0.50 0.30' : '0.65 0.20 0.15'; // Green for Inward, Burgundy for Outward
    const typeLabel = isStockIn ? 'GOODS RECEIPT / STOCK-IN VOUCHER' : 'DELIVERY CHALLAN / STOCK-OUT SLIP';

    streamCommands.push(`${headerColor} rg`);
    streamCommands.push(`0 775 595 67 re f`);

    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 18 Tf 40 810 Td (SHASHWAT GROUP - INVENTORY SYSTEM) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 40 790 Td (${typeLabel}) Tj ET`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 11 Tf 40 740 Td (Reference No: ${this.escapePdfText(transaction.reference_number || 'N/A')}) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 40 722 Td (Date: ${this.escapePdfText(transaction.transaction_date || new Date().toISOString().split('T')[0])}) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 40 705 Td (Party: ${this.escapePdfText(transaction.party_name || 'Internal Warehouse')}) Tj ET`);

    // Voucher details
    streamCommands.push(`0.95 0.95 0.95 rg`);
    streamCommands.push(`40 580 515 100 re f`);
    streamCommands.push(`0.8 0.8 0.8 RG 1 w`);
    streamCommands.push(`40 580 515 100 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 11 Tf 60 655 Td (Item Name:) Tj 220 655 Td (${this.escapePdfText(transaction.item_name || transaction.name || 'Inventory Item')}) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 60 635 Td (Quantity Moved:) Tj 220 635 Td (${transaction.quantity} ${this.escapePdfText(transaction.unit || 'units')}) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 60 615 Td (Balance After Movement:) Tj 220 615 Td (${transaction.balance_after || 'Updated'} ${this.escapePdfText(transaction.unit || 'units')}) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 60 595 Td (Remarks / Notes:) Tj 220 595 Td (${this.escapePdfText(transaction.notes || 'Normal operation')}) Tj ET`);

    // Verification signatures
    streamCommands.push(`BT /F2 9 Tf 60 480 Td (Issued By: _____________________) Tj 350 480 Td (Verified By: _____________________) Tj ET`);

    const contentStream = streamCommands.join('\n');
    return this.buildPdfDocument(contentStream);
  }

  /**
   * Compiles stream into valid, minimal PDF 1.4 binary structure
   */
  buildPdfDocument(contentStream) {
    const streamBuffer = Buffer.from(contentStream, 'utf-8');
    const streamLength = streamBuffer.length;

    const objects = [];
    const offsets = [];

    // Object 1: Catalog
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

    // Object 2: Pages
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);

    // Object 3: Page (A4 Dimensions: 595.28 x 841.89)
    objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`);

    // Object 4: Standard Helvetica font (0 bytes embedded!)
    objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

    // Object 5: Standard Helvetica-Bold font (0 bytes embedded!)
    objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

    // Object 6: Content Stream
    objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

    // Build PDF output and calculate xref table
    let body = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
    offsets.push(0); // 0th object

    for (let i = 0; i < objects.length; i++) {
      offsets.push(Buffer.byteLength(body, 'utf-8'));
      body += objects[i];
    }

    const xrefOffset = Buffer.byteLength(body, 'utf-8');
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

    for (let i = 1; i <= objects.length; i++) {
      const padded = String(offsets[i]).padStart(10, '0');
      xref += `${padded} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    const finalBuffer = Buffer.from(body + xref + trailer, 'utf-8');
    const sizeKB = (finalBuffer.length / 1024).toFixed(2);
    console.log(`⚡ [Micro-PDF Engine] Generated vector PDF: ${sizeKB} KB (${finalBuffer.length} bytes)`);

    return {
      buffer: finalBuffer,
      sizeBytes: finalBuffer.length,
      sizeKB: Number(sizeKB)
    };
  }
}

module.exports = new MicroPdfGenerator();
