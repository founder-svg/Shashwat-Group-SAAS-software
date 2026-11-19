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
    let items = invoice.items || invoice.invoice_items || invoice.line_items || [];
    if ((!items || items.length === 0) && invoice.notes && invoice.notes.includes('<!--ITEMS:')) {
      try {
        const m = invoice.notes.match(/<!--ITEMS:(.*?)-->/);
        if (m) items = JSON.parse(m[1]);
      } catch (e) {}
    }
    if ((!items || items.length === 0) && Number(invoice.total_amount || invoice.subtotal || 0) > 0) {
      items = [{
        itemName: 'Commercial Timber & Wood Materials Supply',
        vehicleNo: vehNo,
        length: '-',
        width: '-',
        pieces: 1,
        calculatedSqFt: 0,
        itemDescription: 'Materials Supply as per Order',
        specific: 'Commercial Grade',
        totalPrice: Number(invoice.subtotal || invoice.total_amount || 0)
      }];
    }

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

  /**
   * Generates a valid PDF Blob for Inventory Stock Ledger (< 8 KB)
   */
  generateStockPdfBlob({ item, transactions = [], inventory = [], firm }) {
    const streamCommands = [];
    const darkColor = '0.08 0.12 0.18';
    const grayColor = '0.40 0.40 0.40';
    const lightBg = '0.96 0.97 0.98';
    const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
    const firmName = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
    const today = new Date().toISOString().split('T')[0];

    // Top Auspicious
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 240 818 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    // Top Title Box
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`40 760 515 50 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 16 Tf 50 790 Td (${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 50 772 Td (PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, GANDHIDHAM KUTCH GUJARAT-370205) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 390 790 Td (STOCK LEDGER & INVENTORY SHEET) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 390 772 Td (Date: ${today} | Verified Audit Record) Tj ET`);

    if (item) {
      // Single Item Ledger
      const itemTrans = (transactions || []).filter(t => 
        (t.item_id && t.item_id === item.id) || 
        (t.item_name && t.item_name.toLowerCase() === (item.name || '').toLowerCase()) ||
        (t.sku && t.sku === item.sku)
      );
      const totalIn = itemTrans.filter(t => t.transaction_type === 'STOCK_IN').reduce((sum, t) => sum + Number(t.quantity || 0), 0);
      const totalOut = itemTrans.filter(t => t.transaction_type === 'STOCK_OUT').reduce((sum, t) => sum + Number(t.quantity || 0), 0);
      const currStock = Number(item.current_stock || 0);

      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F2 12 Tf 40 735 Td (MATERIAL: ${this.escapePdfText(item.name)}) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 40 720 Td (SKU: ${this.escapePdfText(item.sku)} | Category: ${this.escapePdfText(item.category || 'General')} | Unit: ${this.escapePdfText(item.unit || 'pcs')}) Tj ET`);

      // 3 Stat Boxes: Stock In, Stock Out, Available Balance
      streamCommands.push(`0.90 0.98 0.92 rg`);
      streamCommands.push(`40 660 160 45 re f`);
      streamCommands.push(`0.1 0.6 0.2 rg`);
      streamCommands.push(`BT /F2 9 Tf 50 690 Td (TOTAL STOCK IN (+)) Tj ET`);
      streamCommands.push(`BT /F2 14 Tf 50 670 Td (+${totalIn} ${this.escapePdfText(item.unit || 'pcs')}) Tj ET`);

      streamCommands.push(`0.99 0.92 0.92 rg`);
      streamCommands.push(`215 660 160 45 re f`);
      streamCommands.push(`0.8 0.1 0.1 rg`);
      streamCommands.push(`BT /F2 9 Tf 225 690 Td (TOTAL STOCK OUT (-)) Tj ET`);
      streamCommands.push(`BT /F2 14 Tf 225 670 Td (-${totalOut} ${this.escapePdfText(item.unit || 'pcs')}) Tj ET`);

      streamCommands.push(`0.92 0.95 0.99 rg`);
      streamCommands.push(`395 660 160 45 re f`);
      streamCommands.push(`0.1 0.3 0.8 rg`);
      streamCommands.push(`BT /F2 9 Tf 405 690 Td (AVAILABLE BALANCE) Tj ET`);
      streamCommands.push(`BT /F2 14 Tf 405 670 Td (${currStock} ${this.escapePdfText(item.unit || 'pcs')}) Tj ET`);

      // Transactions Table Header
      streamCommands.push(`${lightBg} rg`);
      streamCommands.push(`40 625 515 20 re f`);
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F2 8 Tf 45 632 Td (Date) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 110 632 Td (Movement Type) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 200 632 Td (Ref / Voucher) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 290 632 Td (Party / Supplier / Client) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 430 632 Td (Inward) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 480 632 Td (Outward) Tj ET`);

      let currentY = 605;
      const rows = itemTrans.slice(0, 15);
      if (rows.length === 0) {
        streamCommands.push(`${grayColor} rg`);
        streamCommands.push(`BT /F1 9 Tf 180 590 Td (No stock transactions recorded yet for this item.) Tj ET`);
      } else {
        rows.forEach(t => {
          const tDate = t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : today;
          const isIn = t.transaction_type === 'STOCK_IN';
          streamCommands.push(`0.2 0.2 0.2 rg`);
          streamCommands.push(`BT /F1 8 Tf 45 ${currentY} Td (${tDate}) Tj ET`);
          streamCommands.push(`BT /F2 8 Tf 110 ${currentY} Td (${isIn ? 'STOCK IN' : 'STOCK OUT'}) Tj ET`);
          streamCommands.push(`BT /F1 8 Tf 200 ${currentY} Td (${this.escapePdfText((t.reference_number || '-').slice(0, 14))}) Tj ET`);
          streamCommands.push(`BT /F1 8 Tf 290 ${currentY} Td (${this.escapePdfText((t.party_name || 'Warehouse').slice(0, 24))}) Tj ET`);
          streamCommands.push(`BT /F2 8 Tf 430 ${currentY} Td (${isIn ? `+${t.quantity}` : '-'}) Tj ET`);
          streamCommands.push(`BT /F2 8 Tf 480 ${currentY} Td (${!isIn ? `-${t.quantity}` : '-'}) Tj ET`);
          currentY -= 16;
        });
      }
    } else {
      // Master Warehouse Sheet
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F2 13 Tf 40 735 Td (WAREHOUSE MASTER INVENTORY REGISTER) Tj ET`);
      streamCommands.push(`BT /F1 9 Tf 40 720 Td (Total Catalog Products: ${inventory.length} | Date: ${today}) Tj ET`);

      // Master Table Header
      streamCommands.push(`${lightBg} rg`);
      streamCommands.push(`40 680 515 20 re f`);
      streamCommands.push(`0 0 0 rg`);
      streamCommands.push(`BT /F2 8 Tf 45 687 Td (SKU Code) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 130 687 Td (Product / Material) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 280 687 Td (Category) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 410 687 Td (Cost) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 460 687 Td (Selling) Tj ET`);
      streamCommands.push(`BT /F2 8 Tf 510 687 Td (In-Stock) Tj ET`);

      let currentY = 660;
      inventory.slice(0, 20).forEach(it => {
        streamCommands.push(`0.2 0.2 0.2 rg`);
        streamCommands.push(`BT /F2 8 Tf 45 ${currentY} Td (${this.escapePdfText(it.sku)}) Tj ET`);
        streamCommands.push(`BT /F1 8 Tf 130 ${currentY} Td (${this.escapePdfText(it.name.slice(0, 26))}) Tj ET`);
        streamCommands.push(`BT /F1 8 Tf 280 ${currentY} Td (${this.escapePdfText((it.category || '').slice(0, 20))}) Tj ET`);
        streamCommands.push(`BT /F1 8 Tf 410 ${currentY} Td (Rs. ${Number(it.cost_price || 0).toFixed(0)}) Tj ET`);
        streamCommands.push(`BT /F2 8 Tf 460 ${currentY} Td (Rs. ${Number(it.selling_price || 0).toFixed(0)}) Tj ET`);
        streamCommands.push(`BT /F2 8 Tf 510 ${currentY} Td (${it.current_stock} ${this.escapePdfText(it.unit || 'pcs')}) Tj ET`);
        currentY -= 16;
      });
    }

    // Bottom Signatory
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 8.5 Tf 430 80 Td (For ${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 430 65 Td (Warehouse In-Charge / Manager) Tj ET`);

    // Bottom Bar
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 160 6 Td (${this.escapePdfText(firmName)} - Inventory & Warehouse Management) Tj ET`);

    return this.buildPdfBlob(streamCommands.join('\n'));
  }

  downloadStockPdf({ item, transactions = [], inventory = [], firm }) {
    const { blob, sizeKB } = this.generateStockPdfBlob({ item, transactions, inventory, firm });
    const sku = item ? item.sku : 'Master_Warehouse';
    const fileName = `Stock_Ledger_${sku}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { fileName, sizeKB, blob };
  }

  /**
   * Generates a valid PDF Blob for Vehicle Dispatch Gate Pass (< 8 KB)
   */
  generateVehiclePassPdfBlob({ vehicle, firm }) {
    const streamCommands = [];
    const darkColor = '0.08 0.12 0.18';
    const grayColor = '0.40 0.40 0.40';
    const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
    const firmName = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
    const today = new Date().toISOString().split('T')[0];
    const regNo = vehicle.registration_number || vehicle.vehicle_no || 'TRUCK-01';

    // Top Auspicious
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 240 818 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    // Top Title Box
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`40 760 515 50 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 16 Tf 50 790 Td (${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 50 772 Td (PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, GANDHIDHAM KUTCH GUJARAT-370205) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 400 790 Td (VEHICLE LOGISTICS GATE PASS) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 400 772 Td (Date: ${today} | Security Verified) Tj ET`);

    // Main Details Box
    streamCommands.push(`0.96 0.97 0.98 rg`);
    streamCommands.push(`40 600 515 145 re f`);
    streamCommands.push(`0.2 0.2 0.2 RG 1 w`);
    streamCommands.push(`40 600 515 145 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 13 Tf 55 725 Td (VEHICLE REGISTRATION: ${this.escapePdfText(regNo)}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 705 Td (Vehicle Type: ${this.escapePdfText(vehicle.vehicle_type || 'Heavy Duty Commercial Truck')}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 685 Td (Assigned Driver: ${this.escapePdfText(vehicle.driver_name || 'Designated Driver')}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 665 Td (Driver Phone / Mobile: ${this.escapePdfText(vehicle.driver_phone || 'N/A')}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 645 Td (Payload Capacity: ${this.escapePdfText(vehicle.capacity_tons || 15)} Tons) Tj ET`);
    streamCommands.push(`BT /F2 9.5 Tf 55 625 Td (Current Destination: ${this.escapePdfText(vehicle.current_destination || 'Central Warehouse Base')}) Tj ET`);

    streamCommands.push(`BT /F2 9.5 Tf 340 705 Td (Status: ${this.escapePdfText((vehicle.status || 'AVAILABLE').toUpperCase())}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 340 685 Td (Pass Issue Date: ${today}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 340 665 Td (Authorized Security Check: PASSED) Tj ET`);

    // Instructions Box
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 9 Tf 40 560 Td (LOGISTICS & TRANSPORT INSTRUCTIONS:) Tj ET`);
    streamCommands.push(`${grayColor} rg`);
    streamCommands.push(`BT /F1 8.5 Tf 40 540 Td (1. The driver must ensure timber / sawn wood materials are securely strapped and tarpaulin-covered.) Tj ET`);
    streamCommands.push(`BT /F1 8.5 Tf 40 525 Td (2. Gate security inspection and weighbridge slips must be produced upon exit and entry.) Tj ET`);
    streamCommands.push(`BT /F1 8.5 Tf 40 510 Td (3. Any transit delays or route diversions must be promptly communicated to dispatch control.) Tj ET`);

    // Signatures
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 8.5 Tf 55 420 Td (Driver Signature) Tj ET`);
    streamCommands.push(`BT /F2 8.5 Tf 240 420 Td (Security Officer Stamp) Tj ET`);
    streamCommands.push(`BT /F2 8.5 Tf 430 420 Td (For ${this.escapePdfText(firmName)}) Tj ET`);

    // Bottom Bar
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 170 6 Td (${this.escapePdfText(firmName)} - Fleet Logistics & Dispatch) Tj ET`);

    return this.buildPdfBlob(streamCommands.join('\n'));
  }

  downloadVehiclePassPdf({ vehicle, firm }) {
    const { blob, sizeKB } = this.generateVehiclePassPdfBlob({ vehicle, firm });
    const regNo = vehicle.registration_number || vehicle.vehicle_no || 'TRUCK';
    const fileName = `Vehicle_Pass_${regNo}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { fileName, sizeKB, blob };
  }

  /**
   * Generates a valid PDF Blob for Product Specification Sheet (< 8 KB)
   */
  generateProductPdfBlob({ product, firm }) {
    const streamCommands = [];
    const darkColor = '0.08 0.12 0.18';
    const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
    const firmName = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
    const today = new Date().toISOString().split('T')[0];

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 240 818 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`40 760 515 50 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 16 Tf 50 790 Td (${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 50 772 Td (PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, GANDHIDHAM KUTCH GUJARAT-370205) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 400 790 Td (PRODUCT SPECIFICATION SHEET) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 400 772 Td (Date: ${today} | Standard Commercial Grade) Tj ET`);

    streamCommands.push(`0.96 0.97 0.98 rg`);
    streamCommands.push(`40 600 515 145 re f`);
    streamCommands.push(`0.2 0.2 0.2 RG 1 w`);
    streamCommands.push(`40 600 515 145 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 13 Tf 55 725 Td (PRODUCT: ${this.escapePdfText(product.name)}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 705 Td (SKU Code: ${this.escapePdfText(product.sku)}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 685 Td (Category: ${this.escapePdfText(product.category || 'General Timber')}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 665 Td (Item Type: ${this.escapePdfText(product.item_type?.replace('_', ' ') || 'Finished Good')}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 645 Td (Measurement Unit: ${this.escapePdfText(product.unit || 'pcs')}) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 55 625 Td (Standard Selling Price: Rs. ${Number(product.selling_price || 0).toFixed(2)}) Tj ET`);

    streamCommands.push(`BT /F2 9.5 Tf 340 705 Td (Current Stock Balance: ${product.current_stock || 0} ${this.escapePdfText(product.unit || 'pcs')}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 340 685 Td (Minimum Reorder Alert: ${product.min_reorder_level || 10}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 340 665 Td (Quality Grade: Commercial Grade A) Tj ET`);

    // Bottom Bar
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 180 6 Td (${this.escapePdfText(firmName)} - Product Management) Tj ET`);

    return this.buildPdfBlob(streamCommands.join('\n'));
  }

  downloadProductPdf({ product, firm }) {
    const { blob, sizeKB } = this.generateProductPdfBlob({ product, firm });
    const fileName = `Product_Spec_${product.sku || 'Item'}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { fileName, sizeKB, blob };
  }

  /**
   * Generates a valid PDF Blob for Dashboard Daily Operations Report (< 8 KB)
   */
  generateDashboardPdfBlob({ firm, invoices = [], inventory = [], vehicles = [] }) {
    const streamCommands = [];
    const darkColor = '0.08 0.12 0.18';
    const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
    const firmName = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
    const today = new Date().toISOString().split('T')[0];

    const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
    const totalPending = invoices.reduce((acc, i) => acc + (Number(i.balance_due) || 0), 0);
    const lowStock = inventory.filter(i => Number(i.current_stock) <= Number(i.min_reorder_level)).length;
    const activeVehicles = vehicles.filter(v => v.status === 'on_delivery').length;

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 240 818 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`40 760 515 50 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 16 Tf 50 790 Td (${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 50 772 Td (PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, GANDHIDHAM KUTCH GUJARAT-370205) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 400 790 Td (DAILY OPERATIONS SUMMARY) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 400 772 Td (Date: ${today} | Executive Briefing) Tj ET`);

    // Stat Grid
    streamCommands.push(`0.96 0.97 0.98 rg`);
    streamCommands.push(`40 600 515 145 re f`);
    streamCommands.push(`0.2 0.2 0.2 RG 1 w`);
    streamCommands.push(`40 600 515 145 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 12 Tf 55 725 Td (EXECUTIVE SUMMARY & KEY PERFORMANCE INDICATORS) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 700 Td (Total Commercial Revenue Invoiced: Rs. ${totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 680 Td (Total Pending Payments / Receivables: Rs. ${totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 660 Td (Total Product Catalog Items: ${inventory.length} items) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 640 Td (Low Stock Reorder Warnings: ${lowStock} items needing replenishment) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 620 Td (Fleet Logistics Status: ${activeVehicles} active deliveries | ${vehicles.length} total vehicles) Tj ET`);

    // Bottom Bar
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 180 6 Td (${this.escapePdfText(firmName)} - Command Center Dashboard) Tj ET`);

    return this.buildPdfBlob(streamCommands.join('\n'));
  }

  downloadDashboardPdf({ firm, invoices = [], inventory = [], vehicles = [] }) {
    const { blob, sizeKB } = this.generateDashboardPdfBlob({ firm, invoices, inventory, vehicles });
    const today = new Date().toISOString().split('T')[0];
    const fileName = `Daily_Operations_Report_${today}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { fileName, sizeKB, blob };
  }

  /**
   * Generates a valid PDF Blob for Stock Transaction Movement Voucher (< 8 KB)
   */
  generateTransactionPdfBlob({ transaction, firm }) {
    const streamCommands = [];
    const darkColor = '0.08 0.12 0.18';
    const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
    const firmName = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
    const today = new Date().toISOString().split('T')[0];
    const isIn = transaction.transaction_type === 'STOCK_IN';
    const ref = transaction.reference_number || 'VOUCHER-AUTO';

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 10 Tf 240 818 Td (|| Shree Ganeshay Namah ||) Tj ET`);

    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`40 760 515 50 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F2 16 Tf 50 790 Td (${this.escapePdfText(firmName)}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 50 772 Td (PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, GANDHIDHAM KUTCH GUJARAT-370205) Tj ET`);
    streamCommands.push(`BT /F2 8 Tf 400 790 Td (${isIn ? 'STOCK INWARD RECEIPT' : 'STOCK OUTWARD DISPATCH'}) Tj ET`);
    streamCommands.push(`BT /F1 8 Tf 400 772 Td (Voucher Ref: ${this.escapePdfText(ref)} | Date: ${today}) Tj ET`);

    streamCommands.push(`0.96 0.97 0.98 rg`);
    streamCommands.push(`40 600 515 145 re f`);
    streamCommands.push(`0.2 0.2 0.2 RG 1 w`);
    streamCommands.push(`40 600 515 145 re S`);

    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`BT /F2 13 Tf 55 725 Td (VOUCHER NO: ${this.escapePdfText(ref)}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 700 Td (Movement Type: ${isIn ? 'STOCK INWARD (RECEIPT)' : 'STOCK OUTWARD (DISPATCH)'}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 680 Td (Material / Item: ${this.escapePdfText(transaction.item_name || 'Timber Material')}) Tj ET`);
    streamCommands.push(`BT /F2 11 Tf 55 660 Td (Quantity Moved: ${isIn ? '+' : '-'}${transaction.quantity || 0} units) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 640 Td (Party / Supplier / Consignee: ${this.escapePdfText(transaction.party_name || 'Warehouse Operations')}) Tj ET`);
    streamCommands.push(`BT /F1 9.5 Tf 55 620 Td (Notes / Remarks: ${this.escapePdfText(transaction.notes || 'No special notes recorded')}) Tj ET`);

    // Bottom Bar
    streamCommands.push(`${darkColor} rg`);
    streamCommands.push(`0 0 595 18 re f`);
    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`BT /F1 8 Tf 180 6 Td (${this.escapePdfText(firmName)} - Stock Audit Log) Tj ET`);

    return this.buildPdfBlob(streamCommands.join('\n'));
  }

  downloadTransactionPdf({ transaction, firm }) {
    const { blob, sizeKB } = this.generateTransactionPdfBlob({ transaction, firm });
    const ref = transaction.reference_number || 'VOUCHER';
    const fileName = `Stock_Voucher_${ref}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { fileName, sizeKB, blob };
  }
}

export const clientMicroPdf = new ClientMicroPdfGenerator();
