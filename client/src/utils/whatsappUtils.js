/**
 * WhatsApp Share & Public Bill Download Link Generator
 * Generates compact URL parameters and formatted WhatsApp messages so customers can download the PDF bill directly online.
 */

export function getBillDownloadUrl(invoice) {
  if (!invoice) return window.location.href;

  let baseUrl = window.location.origin + window.location.pathname;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  const compact = {
    invoice_number: invoice.invoice_number || invoice.invoiceNumber,
    firm_id: invoice.firm_id,
    customer_name: invoice.customer_name || invoice.customerName,
    customer_phone: invoice.customer_phone || invoice.customerPhone || invoice.whatsapp_no || invoice.whatsappNo,
    customer_address: invoice.customer_address || invoice.customerAddress,
    invoice_date: invoice.invoice_date || invoice.invoiceDate,
    vehicle_no: invoice.vehicle_no || invoice.vehicleNo,
    payment_method: invoice.payment_method || invoice.paymentMethod,
    status: invoice.status,
    subtotal: invoice.subtotal,
    tax_amount: invoice.tax_amount,
    tax_rate: invoice.tax_rate,
    total_amount: invoice.total_amount || invoice.totalAmount,
    items: (invoice.items || []).map(it => ({
      itemName: it.itemName || it.item_name || '',
      vehicleNo: it.vehicleNo || it.vehicle_no || '',
      length: it.length || 0,
      width: it.width || 0,
      pieces: it.pieces || it.quantity || 1,
      calculatedSqFt: it.calculatedSqFt !== undefined ? it.calculatedSqFt : it.total_cft || it.totalCft || 0,
      itemDescription: it.itemDescription || it.item_description || it.specific || '',
      specific: it.specific || '',
      unitPrice: it.unitPrice || it.unit_price || 0,
      totalPrice: it.totalPrice || it.total_price || 0
    }))
  };

  try {
    const jsonStr = JSON.stringify(compact);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return `${baseUrl}?bill=${encodeURIComponent(compact.invoice_number || 'INV')}&d=${encodeURIComponent(b64)}`;
  } catch (e) {
    return `${baseUrl}?bill=${encodeURIComponent(compact.invoice_number || 'INV')}`;
  }
}

export function formatWhatsAppMessage(invoice, firmName = 'Shashwat Group') {
  const invNo = invoice.invoice_number || invoice.invoiceNumber || 'INV-2026';
  const custName = invoice.customer_name || invoice.customerName || 'Valued Client';
  const total = Number(invoice.total_amount || invoice.totalAmount || 0).toFixed(2);
  const date = invoice.invoice_date || invoice.invoiceDate || new Date().toISOString().split('T')[0];
  const downloadUrl = getBillDownloadUrl(invoice);

  return `📄 *TAX INVOICE & PACKING LIST: ${invNo}*
🏢 *${firmName}*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${custName}
📅 *Date:* ${date}
💰 *Total Amount:* ₹${total}

📥 *DOWNLOAD / VIEW OFFICIAL PDF BILL:*
${downloadUrl}

📎 *Note:* Vector PDF bill file (under 8 KB) is also attached / downloaded.
_For any queries or dispatches, please contact ${firmName}._`;
}
