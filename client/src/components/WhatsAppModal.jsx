import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Share2, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Phone, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';

export default function WhatsAppModal({ isOpen, onClose, invoice, firm }) {
  if (!isOpen || !invoice) return null;

  // Clean initial phone number
  const initialPhone = (invoice.customer_phone || invoice.customerPhone || '')
    .replace(/[^\d+]/g, '');

  const [phone, setPhone] = useState(initialPhone);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  const companyName = firm?.name || invoice.firm_name || 'Shashwat Group';
  const invNumber = invoice.invoice_number || invoice.invoiceNumber || 'INV-2026';
  const custName = invoice.customer_name || invoice.customerName || 'Valued Client';
  const totalAmount = Number(invoice.total_amount || invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const balanceDue = Number(invoice.balance_due || invoice.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const dateStr = invoice.invoice_date || invoice.invoiceDate || new Date().toISOString().split('T')[0];

  // Clean items summary for WhatsApp message
  const items = invoice.items || [];
  const itemsListText = items.length > 0
    ? items.slice(0, 6).map((it, idx) => {
        const name = it.item_name || it.itemName || 'Timber Item';
        const pcs = it.pieces || it.quantity || 1;
        const vol = it.total_cft || it.totalCft || it.cft || 0;
        const volStr = vol > 0 ? ` (${vol} CFT)` : '';
        return `  ${idx + 1}. *${name}* - ${pcs} Pcs${volStr}`;
      }).join('\n')
    : '  1. Wood & Commercial Materials Supply';

  // Structured professional WhatsApp bill message
  const whatsappMessage = 
`📄 *TAX INVOICE: ${invNumber}*
🏢 *${companyName}*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${custName}
📅 *Date:* ${dateStr}
💰 *Total Amount:* ₹${totalAmount}
💳 *Balance Due:* ₹${balanceDue}

📦 *Items Billed:*
${itemsListText}

📎 *Official Tax Invoice PDF attached.*
_For any queries or payments, please contact ${companyName}._`;

  // Standardize phone for WhatsApp URL (e.g. 9876543210 -> 919876543210)
  const getFormattedPhone = () => {
    let clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      clean = '91' + clean; // Prepend India country code if 10 digits
    }
    return clean;
  };

  /**
   * Primary action: Native PDF File Share directly into WhatsApp
   */
  const handleDirectPdfShare = async () => {
    setShareStatus('generating');
    try {
      const { blob } = clientMicroPdf.generateInvoicePdfBlob(invoice);
      const fileName = `Invoice_${invNumber}.pdf`;
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });

      // Check if browser supports Web Share API with Files
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `Invoice ${invNumber} - ${companyName}`,
          text: whatsappMessage,
          files: [pdfFile]
        });
        setShareStatus('shared');
        setTimeout(() => setShareStatus(''), 3000);
      } else {
        // Fallback: Download PDF to device & launch WhatsApp Web chat
        handleDownloadAndLaunchWhatsApp();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Direct share fallback triggered:', err);
        handleDownloadAndLaunchWhatsApp();
      } else {
        setShareStatus('');
      }
    }
  };

  /**
   * Fallback for desktop: Downloads PDF file directly and launches WhatsApp chat
   */
  const handleDownloadAndLaunchWhatsApp = () => {
    // 1. Download PDF file directly so user has the .pdf file ready
    clientMicroPdf.downloadInvoicePdf(invoice);

    // 2. Open WhatsApp chat with pre-filled invoice message
    const targetPhone = getFormattedPhone();
    const encodedText = encodeURIComponent(whatsappMessage);
    const whatsappUrl = targetPhone 
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
    setShareStatus('opened');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              {/* WhatsApp Vector Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Send Invoice Bill to WhatsApp</h3>
              <p className="text-[11px] text-emerald-100">Dispatches vector PDF bill (< 8 KB) directly to WhatsApp</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-emerald-100 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Recipient Phone Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>Customer WhatsApp Phone Number *</span>
              <span className="text-[10px] text-slate-400 font-normal">Include country code (e.g. +91)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* PDF Attachment Badge */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Invoice_{invNumber}.pdf</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Micro-PDF Vector Attachment • ~5.4 KB • Verified Standard
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => clientMicroPdf.downloadInvoicePdf(invoice)}
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
              title="Download local copy of PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                WhatsApp Message Content Preview:
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {whatsappMessage}
            </div>
          </div>

          {/* Feedback Alerts */}
          {shareStatus === 'shared' && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bill PDF dispatched to WhatsApp successfully!</span>
            </div>
          )}

          {shareStatus === 'opened' && (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">PDF file downloaded &amp; WhatsApp chat opened!</p>
                <p className="text-[10px] text-blue-600">The PDF is now in your downloads. Simply drag or attach the downloaded invoice into the WhatsApp chat.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              Close
            </button>

            {/* Direct Send to WhatsApp Button */}
            <button
              type="button"
              onClick={handleDirectPdfShare}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
            >
              <Send className="w-4 h-4" />
              <span>Send PDF Bill to WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
