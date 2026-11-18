/**
 * Client-Side Ultra-Lightweight Vector PDF Generator for Shashwat Group CRM
 * 
 * DESIGN PRINCIPLE:
 *  - Runs 100% in the browser with ZERO external heavy libraries (no Puppeteer, no heavy canvas).
 *  - Generates true standard PDF 1.4 binary documents using PostScript core fonts (Helvetica).
 *  - File size: 4 KB to 8 KB per invoice (Over 99% smaller than standard 3MB-5MB PDFs).
 *  - One-click instant direct file download on mobile and desktop.
 */

class ClientMicroPdfGenerator {
  escapePdfText(text) {
    if (!text) return '';
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  /**
   * Generates a valid PDF Blob for an invoice (< 8 KB)
   */
  generateInvoicePdfBlob(invoice) {
    const streamCommands = [];

    // Colors (RGB in 0.0 - 1.0 range)
    const primaryColor = '0.12 0.23 0.38'; // Dark Navy (#1f3a60)
    const grayColor = '0.45 0.45 0.45';
    const lightBg = '0.96 0.97 0.98';
    const borderColor = '0.85 0.87 0.90';

    // Top Header Banner
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`0 770 595 72 re f`);

    // Header Text (White)
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 20 Tf 40 805 Td (SHASHWAT GROUP) Tj ET`);
    streamCommands.push(`BT /F1 10 Tf 40 788 Td (Commercial SaaS Solutions | Billing & CRM Department) Tj ET`);
    streamCommands.push(`BT /F2 18 Tf 460 805 Td (TAX INVOICE) Tj ET`);

    // Client Details (Left Column)
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 40 735 Td (BILLED TO:) Tj ET`);
    streamCommands.push(`BT /F2 12 Tf 40 718 Td (${this.escapePdfText(invoice.customer_name || invoice.customerName)}) Tj ET`);

    const clientPhone = invoice.customer_phone || invoice.customerPhone || 'N/A';
    const clientEmail = invoice.customer_email || invoice.customerEmail || 'N/A';
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F1 9 Tf 40 702 Td (Phone: ${this.escapePdfText(clientPhone)}  |  Email: ${this.escapePdfText(clientEmail)}) Tj ET`);

    // Invoice Meta (Right Column)
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 380 735 Td (Invoice No: ${this.escapePdfText(invoice.invoice_number || invoice.invoiceNumber)}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 380 718 Td (Date: ${this.escapePdfText(invoice.invoice_date || invoice.invoiceDate)}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 380 702 Td (Status: ${this.escapePdfText(invoice.status || 'ISSUED')}) Tj ET`);

    // Divider Line
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`40 685 m 555 685 l S`);

    // Table Header Box
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`40 655 515 22 re f`);
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`BT /F2 8 Tf 48 662 Td (#) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 70 662 Td (ITEM DESCRIPTION & SPECS) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 315 662 Td (PCS) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 365 662 Td (CFT) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 425 662 Td (RATE) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 495 662 Td (AMOUNT) Tj ET`);

    // Line Items
    let currentY = 635;
    const items = invoice.items || [];

    items.forEach((item, index) => {
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F1 8 Tf 48 ${currentY} Td (${index + 1}) Tj ET`);
      
      let itemTitle = item.item_name || item.itemName || 'Timber Item';
      if (item.item_description || item.itemDescription) {
        itemTitle += ` - ${item.item_description || item.itemDescription}`;
      }
      if (itemTitle.length > 42) itemTitle = itemTitle.slice(0, 40) + '..';

      streamCommands.push(`BT /F1 8 Tf 70 ${currentY} Td (${this.escapePdfText(itemTitle)}) Tj ET`);
      const pcs = item.pieces || (item.total_cft ? item.quantity : item.quantity) || 1;
      streamCommands.push(`BT /F1 8 Tf 320 ${currentY} Td (${pcs}) Tj ET`);
      const cftVal = item.total_cft || item.totalCft || 0;
      const cftText = cftVal > 0 ? `${Number(cftVal).toFixed(2)}` : '-';
      streamCommands.push(`BT /F1 8 Tf 365 ${currentY} Td (${cftText}) Tj ET`);
      streamCommands.push(`BT /F1 8 Tf 425 ${currentY} Td (Rs. ${Number(item.unit_price || item.unitPrice || 0).toFixed(2)}) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 495 ${currentY} Td (Rs. ${Number(item.total_price || item.totalPrice || 0).toFixed(2)}) Tj ET`);

      // Row separator
      streamCommands.push(`${borderColor} RG 0.5 w`);
      streamCommands.push(`40 ${currentY - 6} m 555 ${currentY - 6} l S`);

      currentY -= 20;
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
    const balanceDue = Number(invoice.balance_due || (grandTotal - amountPaid)).toFixed(2);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - 10} Td (Subtotal:) Tj 500 ${summaryY - 10} Td (Rs. ${subtotal}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - 26} Td (GST / Tax (${taxRate}%):) Tj 500 ${summaryY - 26} Td (Rs. ${taxAmount}) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 360 ${summaryY - 45} Td (Grand Total:) Tj 480 ${summaryY - 45} Td (Rs. ${grandTotal}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - 62} Td (Amount Paid:) Tj 500 ${summaryY - 62} Td (Rs. ${amountPaid}) Tj ET`);
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`BT /F2 10 Tf 360 ${summaryY - 76} Td (Balance Due:) Tj 485 ${summaryY - 76} Td (Rs. ${balanceDue}) Tj ET`);

    // Payment Instructions & Footer
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F2 9 Tf 40 120 Td (Payment Mode: ${this.escapePdfText(invoice.payment_method || invoice.paymentMethod || 'Bank Transfer / UPI')}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 105 Td (Notes: ${this.escapePdfText(invoice.notes || 'Thank you for choosing Shashwat Group.')}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 90 Td (Micro-optimized vector document (~5 KB) synced with Google Drive.) Tj ET`);

    // Bottom Decorative Footer
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 180 6 Td (Shashwat Group - Automated SaaS & Inventory Management System) Tj ET`);

    const contentStream = streamCommands.join('\n');
    return this.buildPdfBlob(contentStream);
  }

  /**
   * Compiles the text stream into a valid PDF 1.4 binary Blob
   */
  buildPdfBlob(contentStream) {
    const encoder = new TextEncoder();
    const streamBytes = encoder.encode(contentStream);
    const streamLength = streamBytes.length;

    const objects = [];
    const offsets = [];

    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
    objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`);
    objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
    objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
    objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

    let body = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
    offsets.push(0);

    for (let i = 0; i < objects.length; i++) {
      offsets.push(encoder.encode(body).length);
      body += objects[i];
    }

    const xrefOffset = encoder.encode(body).length;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

    for (let i = 1; i <= objects.length; i++) {
      const padded = String(offsets[i]).padStart(10, '0');
      xref += `${padded} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    const fullPdfText = body + xref + trailer;
    const finalBuffer = encoder.encode(fullPdfText);
    const sizeKB = (finalBuffer.length / 1024).toFixed(2);

    const blob = new Blob([finalBuffer], { type: 'application/pdf' });

    return {
      blob,
      sizeBytes: finalBuffer.length,
      sizeKB: Number(sizeKB)
    };
  }

  /**
   * One-click trigger to download the PDF directly to the user's computer or phone
   */
  downloadInvoicePdf(invoice) {
    const { blob, sizeKB } = this.generateInvoicePdfBlob(invoice);
    const fileName = `Invoice_${invoice.invoice_number || 'INV-2026'}.pdf`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ [PDF Download] Downloaded ${fileName} (${sizeKB} KB)`);
    return { fileName, sizeKB };
  }
}

export const clientMicroPdf = new ClientMicroPdfGenerator();
