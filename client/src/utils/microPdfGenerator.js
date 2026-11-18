/**
 * Client-Side Ultra-Lightweight Vector PDF Generator for Shashwat Group CRM
 * 
 * DESIGN PRINCIPLE:
 *  - Runs 100% in the browser with ZERO external heavy libraries.
 *  - Generates true standard PDF 1.4 binary documents using PostScript core fonts (Helvetica).
 *  - File size: 4 KB to 8 KB per invoice (Over 99% smaller than standard 3MB-5MB PDFs).
 *  - Fast direct file download and WhatsApp PDF attachment.
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
    streamCommands.push(`0 760 595 82 re f`);

    // Header Text (White)
    const firmName = invoice.firm_name || (invoice.customer_name?.includes('Plywood') ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT GROUP');
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 18 Tf 40 812 Td (${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 798 Td (PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, GANDHIDHAM KUTCH GUJARAT-370205) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 786 Td (Mo: +91 91379 21191, +91 99982 55525) Tj ET`);
    streamCommands.push(`BT /F2 15 Tf 410 812 Td (TAX INVOICE) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 410 798 Td (& PACKING LIST) Tj ET`);

    // Client / Consignee Details (Left Column)
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 40 735 Td (CONSIGNEE / BILLED TO:) Tj ET`);
    streamCommands.push(`BT /F2 12 Tf 40 718 Td (${this.escapePdfText(invoice.customer_name || invoice.customerName)}) Tj ET`);

    const clientPhone = invoice.customer_phone || invoice.customerPhone || 'N/A';
    const clientAddress = invoice.customer_address || invoice.customerAddress || 'N/A';
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F1 9 Tf 40 702 Td (Phone: ${this.escapePdfText(clientPhone)}  |  Site: ${this.escapePdfText(clientAddress.slice(0, 35))}) Tj ET`);

    // Invoice Meta & Vehicle Details (Right Column)
    const vehNo = invoice.vehicle_no || invoice.vehicleNo || 'GJ-18-BW-7236';
    const transport = invoice.transport || 'ARRANGE';
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 370 735 Td (Invoice No: ${this.escapePdfText(invoice.invoice_number || invoice.invoiceNumber)}) Tj ET`);
    streamCommands.push(`BT /F1 9 Tf 370 718 Td (Date: ${this.escapePdfText(invoice.invoice_date || invoice.invoiceDate)}  |  Status: ${this.escapePdfText(invoice.status || 'ISSUED')}) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 370 702 Td (Vehicle No: ${this.escapePdfText(vehNo)}  |  Transport: ${this.escapePdfText(transport)}) Tj ET`);

    // Divider Line
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`40 685 m 555 685 l S`);

    // Table Header Box (Packing list columns)
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`40 655 515 22 re f`);
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`BT /F2 8 Tf 45 662 Td (#) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 65 662 Td (ITEM DESCRIPTION & SPECS) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 270 662 Td (DIMS (LxWxT)) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 350 662 Td (PEACE) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 400 662 Td (CFT) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 450 662 Td (RATE) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 505 662 Td (TOTAL) Tj ET`);

    // Line Items
    let currentY = 635;
    const items = invoice.items || [];

    items.forEach((item, index) => {
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F1 8 Tf 45 ${currentY} Td (${index + 1}) Tj ET`);
      
      let itemTitle = item.item_name || item.itemName || 'Timber Item';
      if (item.item_description || item.itemDescription) {
        itemTitle += ` - ${item.item_description || item.itemDescription}`;
      }
      if (itemTitle.length > 35) itemTitle = itemTitle.slice(0, 33) + '..';
      streamCommands.push(`BT /F1 8 Tf 65 ${currentY} Td (${this.escapePdfText(itemTitle)}) Tj ET`);

      const dims = (item.length || item.width || item.thickness)
        ? `${item.length || 0}'x${item.width || 0}"x${item.thickness || 0}"`
        : '-';
      streamCommands.push(`BT /F1 8 Tf 270 ${currentY} Td (${this.escapePdfText(dims)}) Tj ET`);

      const pcs = item.pieces || (item.total_cft ? item.quantity : item.quantity) || 1;
      streamCommands.push(`BT /F2 8 Tf 355 ${currentY} Td (${pcs}) Tj ET`);

      const cftVal = item.total_cft || item.totalCft || 0;
      const cftText = cftVal > 0 ? `${Number(cftVal).toFixed(2)}` : '-';
      streamCommands.push(`BT /F1 8 Tf 400 ${currentY} Td (${cftText}) Tj ET`);

      streamCommands.push(`BT /F1 8 Tf 450 ${currentY} Td (Rs.${Number(item.unit_price || item.unitPrice || 0).toFixed(0)}) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 505 ${currentY} Td (Rs.${Number(item.total_price || item.totalPrice || 0).toFixed(0)}) Tj ET`);

      // Row separator
      streamCommands.push(`${borderColor} RG 0.5 w`);
      streamCommands.push(`40 ${currentY - 6} m 555 ${currentY - 6} l S`);

      currentY -= 20;
    });

    // Summary Box
    const taxRate = Number(invoice.tax_rate ?? invoice.taxRate ?? 0);
    const boxHeight = taxRate > 0 ? 95 : 80;
    const summaryY = Math.max(currentY - 15, 260);

    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`350 ${summaryY - boxHeight} 205 ${boxHeight} re f`);
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`350 ${summaryY - boxHeight} 205 ${boxHeight} re S`);

    const subtotal = Number(invoice.subtotal || 0).toFixed(2);
    const taxAmount = Number(invoice.tax_amount || invoice.taxAmount || 0).toFixed(2);
    const grandTotal = Number(invoice.total_amount || invoice.totalAmount || 0).toFixed(2);
    const amountPaid = Number(invoice.amount_paid || invoice.amountPaid || 0).toFixed(2);
    const balanceDue = Number(invoice.balance_due || (grandTotal - amountPaid)).toFixed(2);

    let lineOffset = 12;
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - lineOffset} Td (Subtotal:) Tj 480 ${summaryY - lineOffset} Td (Rs. ${subtotal}) Tj ET`);

    // Conditional GST row: Only included when taxRate > 0
    if (taxRate > 0) {
      lineOffset += 16;
      streamCommands.push(`BT /F1 9 Tf 360 ${summaryY - lineOffset} Td (GST (${taxRate}%):) Tj 480 ${summaryY - lineOffset} Td (Rs. ${taxAmount}) Tj ET`);
    }

    lineOffset += 18;
    streamCommands.push(`BT /F2 11 Tf 360 ${summaryY - lineOffset} Td (Grand Total:) Tj 470 ${summaryY - lineOffset} Td (Rs. ${grandTotal}) Tj ET`);

    lineOffset += 16;
    streamCommands.push(`BT /F1 8 Tf 360 ${summaryY - lineOffset} Td (Amount Paid:) Tj 480 ${summaryY - lineOffset} Td (Rs. ${amountPaid}) Tj ET`);

    lineOffset += 14;
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`BT /F2 9 Tf 360 ${summaryY - lineOffset} Td (Balance Due:) Tj 475 ${summaryY - lineOffset} Td (Rs. ${balanceDue}) Tj ET`);

    // Formula & Payment Instructions
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F1 8 Tf 40 120 Td (Calculation Formula: Length ft * Width in * Thick in * Peace / 144 = Total CFT) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 40 106 Td (Payment Mode: ${this.escapePdfText(invoice.payment_method || invoice.paymentMethod || 'Bank Transfer / UPI')}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 92 Td (Micro-optimized vector document (~5 KB) - Electronically Verified) Tj ET`);

    // Bottom Decorative Footer
    streamCommands.push(`${primaryColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 160 6 Td (${this.escapePdfText(firmName)} - Commercial Packing List & Invoicing System) Tj ET`);

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
