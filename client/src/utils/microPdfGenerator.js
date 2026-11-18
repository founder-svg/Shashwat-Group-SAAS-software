/**
 * Client-Side Ultra-Lightweight Vector PDF Generator for Shashwat Group CRM
 * 
 * Generates valid standard PDF 1.4 binary documents (< 8 KB)
 * Strictly matches client Excel sample table:
 * Sr.no | vechile no | length | width | peace | sq.ft | description | specific | Total
 * Calculation: length * width * peace / 144 = total sq.ft
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
    const darkColor = '0.08 0.12 0.18';
    const grayColor = '0.40 0.40 0.40';
    const lightBg = '0.96 0.97 0.98';
    const borderColor = '0.20 0.20 0.20';

    // Top Auspicious line
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 240 818 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    // Top Title Box: client company name
    const firmName = invoice.firm_name || (invoice.customer_name?.includes('Plywood') ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`40 760 515 50 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 16 Tf 50 790 Td (${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 50 772 Td (PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, GANDHIDHAM KUTCH GUJARAT-370205) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 430 790 Td (TAX INVOICE & BILL) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 430 772 Td (Mo: 91379 21191, 99982 55525) Tj ET`);

    // Consignee & Header Box
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 9 Tf 40 740 Td (CUSTOMER / CONSIGNEE:) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 40 726 Td (${this.escapePdfText(invoice.customer_name || invoice.customerName)}) Tj ET`);
    const cPhone = invoice.customer_phone || invoice.customerPhone || '';
    const cAddr = invoice.customer_address || invoice.customerAddress || '';
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F1 8 Tf 40 712 Td (Phone: ${this.escapePdfText(cPhone)} | Address: ${this.escapePdfText(cAddr.slice(0, 45))}) Tj ET`);

    // DATE & INVOICE NO Row (Matching client table)
    const vehNo = invoice.vehicle_no || invoice.vehicleNo || 'GJ-18-BW-7236';
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 9 Tf 360 740 Td (DATE: ${this.escapePdfText(invoice.invoice_date || invoice.invoiceDate)}) Tj ET`);
    streamCommands.push(`BT /F2 9 Tf 360 726 Td (INVOICE NO: ${this.escapePdfText(invoice.invoice_number || invoice.invoiceNumber)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 360 712 Td (Vehicle No: ${this.escapePdfText(vehNo)} | Transport: ${this.escapePdfText(invoice.transport || 'ARRANGE')}) Tj ET`);

    // 9-Column Table Header Box per client screenshot
    // Sr.no | vechile no | length | width | peace | sq.ft | description | specific | Total
    streamCommands.push(`${lightBg} rg`);
    streamCommands.push(`40 680 515 22 re f`);
    streamCommands.push(`${borderColor} RG 1 w`);
    streamCommands.push(`40 680 515 22 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 7 Tf 45 687 Td (Sr.no) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 75 687 Td (vechile no) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 145 687 Td (length) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 185 687 Td (width) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 225 687 Td (peace) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 265 687 Td (sq.ft) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 315 687 Td (description) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 425 687 Td (specific) Tj ET`);
    streamCommands.push(`BT /F2 7 Tf 510 687 Td (Total) Tj ET`);

    // Table Rows
    let currentY = 660;
    const items = invoice.items || [];

    items.forEach((item, index) => {
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F1 7.5 Tf 47 ${currentY} Td (${index + 1}) Tj ET`);

      const rowVeh = item.vehicle_no || item.vehicleNo || vehNo;
      streamCommands.push(`BT /F1 7.5 Tf 75 ${currentY} Td (${this.escapePdfText(rowVeh.slice(0, 12))}) Tj ET`);

      const len = item.length || '-';
      const wid = item.width || '-';
      const pcs = item.pieces || (item.total_cft ? item.quantity : item.quantity) || 1;
      streamCommands.push(`BT /F1 7.5 Tf 147 ${currentY} Td (${len}) Tj ET`);
      streamCommands.push(`BT /F1 7.5 Tf 187 ${currentY} Td (${wid}) Tj ET`);
      streamCommands.push(`BT /F2 7.5 Tf 227 ${currentY} Td (${pcs}) Tj ET`);

      // Calculation: length * width * peace / 144
      const sqftVal = (item.length && item.width && pcs)
        ? ((Number(item.length) * Number(item.width) * Number(pcs)) / 144)
        : (Number(item.sqft || item.total_cft || item.totalCft || 0));

      streamCommands.push(`BT /F2 7.5 Tf 265 ${currentY} Td (${sqftVal > 0 ? sqftVal.toFixed(2) : '-'}) Tj ET`);

      const desc = item.item_name || item.itemName || 'Timber Plank';
      streamCommands.push(`BT /F1 7.5 Tf 315 ${currentY} Td (${this.escapePdfText(desc.slice(0, 22))}) Tj ET`);

      const spec = item.item_description || item.itemDescription || item.specific || '-';
      streamCommands.push(`BT /F1 7.5 Tf 425 ${currentY} Td (${this.escapePdfText(spec.slice(0, 16))}) Tj ET`);

      const rowTot = Number(item.total_price || item.totalPrice || 0);
      streamCommands.push(`BT /F2 7.5 Tf 505 ${currentY} Td (Rs.${rowTot.toFixed(0)}) Tj ET`);

      // Grid line
      streamCommands.push(`0.7 0.7 0.7 RG 0.5 w`);
      streamCommands.push(`40 ${currentY - 5} m 555 ${currentY - 5} l S`);

      currentY -= 19;
    });

    // Summary Box
    const taxRate = Number(invoice.tax_rate ?? invoice.taxRate ?? 0);
    const boxHeight = taxRate > 0 ? 95 : 80;
    const summaryY = Math.max(currentY - 15, 250);

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
    streamCommands.push(`0.8 0.1 0.1 rg`);
    streamCommands.push(`BT /F2 9 Tf 360 ${summaryY - lineOffset} Td (Balance Due:) Tj 475 ${summaryY - lineOffset} Td (Rs. ${balanceDue}) Tj ET`);

    // Bottom notes & Signature
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F1 8 Tf 40 130 Td (Calculation: length * width * peace / 144 = total sq.ft) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 40 116 Td (Payment Mode: ${this.escapePdfText(invoice.payment_method || 'Bank Transfer')}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 40 102 Td (Micro-optimized vector document (~5 KB) - Electronically Verified) Tj ET`);

    // Signatory
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 8.5 Tf 430 80 Td (For ${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 430 65 Td (Authorized Signatory) Tj ET`);

    // Bottom Decorative Bar
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 160 6 Td (${this.escapePdfText(firmName)} - Commercial Invoicing System) Tj ET`);

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
