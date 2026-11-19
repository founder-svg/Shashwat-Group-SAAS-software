import React, { useState, useEffect } from 'react';
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
import { formatWhatsAppMessage } from '../utils/whatsappUtils';

export default function WhatsAppModal({ 
  isOpen, 
  onClose, 
  invoice = null, 
  type = 'invoice', // 'invoice' | 'inventory' | 'inventory_master' | 'vehicle' | 'product' | 'dashboard' | 'transaction' | 'drive'
  data = null,
  firm = null 
}) {
  if (!isOpen) return null;

  // Determine active document payload
  const activePayload = invoice || data;
  if (!activePayload) return null;

  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || 
    (invoice && (invoice.firm_id === 'ashapura' || invoice.firm_name?.includes('ASHAPURA') || invoice.company_name?.includes('ASHAPURA')));
  const companyName = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
  const today = new Date().toISOString().split('T')[0];

  // Configure metadata based on modal type
  let title = 'Send Invoice Bill to WhatsApp';
  let subtitle = 'Dispatches vector PDF bill (under 8 KB) directly to WhatsApp';
  let fileName = 'Document.pdf';
  let initialPhone = '';
  let whatsappMessage = '';
  let generateBlobFn = () => clientMicroPdf.generateInvoicePdfBlob(activePayload);
  let downloadFn = () => clientMicroPdf.downloadInvoicePdf(activePayload);

  if (type === 'invoice' || invoice) {
    const inv = invoice || activePayload;
    const invNo = inv.invoice_number || inv.invoiceNumber || 'INV-2026';
    title = 'Send Invoice Bill to WhatsApp';
    subtitle = 'Dispatches vector PDF bill (under 8 KB) directly to WhatsApp';
    fileName = `Invoice_${invNo}.pdf`;
    initialPhone = (inv.customer_phone || inv.customerPhone || inv.whatsapp_no || inv.whatsappNo || '').replace(/[^\d+]/g, '');
    whatsappMessage = formatWhatsAppMessage(inv, companyName);
    generateBlobFn = () => clientMicroPdf.generateInvoicePdfBlob(inv);
    downloadFn = () => clientMicroPdf.downloadInvoicePdf(inv);
  } else if (type === 'inventory') {
    const { item, transactions = [] } = activePayload;
    const sku = item?.sku || 'SKU';
    title = `Send Stock Ledger to WhatsApp (${sku})`;
    subtitle = 'Dispatches vector Stock Movement Ledger PDF directly to WhatsApp';
    fileName = `Stock_Ledger_${sku}.pdf`;
    initialPhone = (item?.phone || '').replace(/[^\d+]/g, '');
    generateBlobFn = () => clientMicroPdf.generateStockPdfBlob({ item, transactions, firm });
    downloadFn = () => clientMicroPdf.downloadStockPdf({ item, transactions, firm });
    
    const itemTrans = (transactions || []).filter(t => 
      (t.item_id && t.item_id === item?.id) || 
      (t.item_name && t.item_name.toLowerCase() === (item?.name || '').toLowerCase()) ||
      (t.sku && t.sku === item?.sku)
    );
    const totalIn = itemTrans.filter(t => t.transaction_type === 'STOCK_IN').reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const totalOut = itemTrans.filter(t => t.transaction_type === 'STOCK_OUT').reduce((sum, t) => sum + Number(t.quantity || 0), 0);

    whatsappMessage = `📊 *STOCK MOVEMENT LEDGER REPORT*\n🏢 *${companyName}*\n━━━━━━━━━━━━━━━━━━━━\n📦 *Item:* ${item?.name} (${sku})\n📂 *Category:* ${item?.category || 'General Timber'}\n📅 *Date:* ${today}\n\n📥 *Total Stock In:* +${totalIn} ${item?.unit || 'pcs'}\n📤 *Total Stock Out:* -${totalOut} ${item?.unit || 'pcs'}\n⚖️ *Available Balance:* ${item?.current_stock} ${item?.unit || 'pcs'}\n💰 *Selling Rate:* ₹${Number(item?.selling_price || 0).toFixed(2)}\n\n📎 *Official Vector PDF attached & downloaded.*`;
  } else if (type === 'inventory_master') {
    const { inventory = [], transactions = [] } = activePayload;
    title = 'Send Warehouse Master Stock Sheet to WhatsApp';
    subtitle = 'Dispatches Warehouse Inventory Master PDF directly to WhatsApp';
    fileName = 'Warehouse_Master_Stock_Sheet.pdf';
    generateBlobFn = () => clientMicroPdf.generateStockPdfBlob({ item: null, transactions, inventory, firm });
    downloadFn = () => clientMicroPdf.downloadStockPdf({ item: null, transactions, inventory, firm });
    
    whatsappMessage = `📊 *WAREHOUSE MASTER INVENTORY REGISTER*\n🏢 *${companyName}*\n━━━━━━━━━━━━━━━━━━━━\n📅 *Date:* ${today}\n📦 *Total Listed Materials:* ${inventory.length}\n⚖️ *Net In-Stock Balance:* ${inventory.reduce((sum, it) => sum + Number(it.current_stock || 0), 0)} items\n\n📎 *Official Vector PDF attached & downloaded.*`;
  } else if (type === 'vehicle') {
    const v = activePayload;
    const regNo = v.registration_number || v.vehicle_no || 'TRUCK-01';
    title = `Send Vehicle Pass to WhatsApp (${regNo})`;
    subtitle = 'Dispatches official Transport Gate Pass PDF directly to WhatsApp';
    fileName = `Vehicle_Pass_${regNo}.pdf`;
    initialPhone = (v.driver_phone || '').replace(/[^\d+]/g, '');
    generateBlobFn = () => clientMicroPdf.generateVehiclePassPdfBlob({ vehicle: v, firm });
    downloadFn = () => clientMicroPdf.downloadVehiclePassPdf({ vehicle: v, firm });

    whatsappMessage = `🚛 *VEHICLE DISPATCH GATE PASS*\n🏢 *${companyName}*\n━━━━━━━━━━━━━━━━━━━━\n🚚 *Vehicle No:* ${regNo}\n👤 *Driver:* ${v.driver_name || 'Designated Driver'} (${v.driver_phone || 'N/A'})\n📍 *Destination:* ${v.current_destination || 'Central Warehouse Base'}\n📋 *Status:* ${(v.status || 'AVAILABLE').toUpperCase()}\n📅 *Date:* ${today}\n\n📎 *Official Vector Gate Pass PDF attached & downloaded.*`;
  } else if (type === 'product') {
    const p = activePayload;
    title = `Send Product Spec to WhatsApp (${p.sku})`;
    subtitle = 'Dispatches Product Spec Sheet PDF directly to WhatsApp';
    fileName = `Product_Spec_${p.sku}.pdf`;
    generateBlobFn = () => clientMicroPdf.generateProductPdfBlob({ product: p, firm });
    downloadFn = () => clientMicroPdf.downloadProductPdf({ product: p, firm });

    whatsappMessage = `🌲 *PRODUCT SPECIFICATION SHEET*\n🏢 *${companyName}*\n━━━━━━━━━━━━━━━━━━━━\n📦 *Product:* ${p.name}\n🔖 *SKU Code:* ${p.sku}\n📂 *Category:* ${p.category || 'Timber'}\n💵 *Price:* ₹${Number(p.selling_price || 0).toFixed(2)}\n⚖️ *Available:* ${p.current_stock || 0} ${p.unit || 'pcs'}\n📅 *Date:* ${today}\n\n📎 *Official Vector PDF attached & downloaded.*`;
  } else if (type === 'dashboard') {
    const { invoices = [], inventory = [], vehicles = [] } = activePayload;
    title = 'Send Daily Operations Report to WhatsApp';
    subtitle = 'Dispatches Executive KPI Summary PDF directly to WhatsApp';
    fileName = `Executive_Report_${today}.pdf`;
    generateBlobFn = () => clientMicroPdf.generateDashboardPdfBlob({ firm, invoices, inventory, vehicles });
    downloadFn = () => clientMicroPdf.downloadDashboardPdf({ firm, invoices, inventory, vehicles });

    const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
    const totalPending = invoices.reduce((acc, i) => acc + (Number(i.balance_due) || 0), 0);
    whatsappMessage = `📊 *EXECUTIVE DAILY OPERATIONS REPORT*\n🏢 *${companyName}*\n━━━━━━━━━━━━━━━━━━━━\n📅 *Date:* ${today}\n💰 *Total Billed:* ₹${totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n⏳ *Outstanding Balance:* ₹${totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n📦 *Catalog Items:* ${inventory.length}\n🚛 *Fleet Active:* ${vehicles.filter(v => v.status === 'on_delivery').length}\n\n📎 *Official Vector PDF attached & downloaded.*`;
  } else if (type === 'transaction') {
    const t = activePayload;
    const ref = t.reference_number || 'VOUCHER';
    title = `Send Movement Voucher to WhatsApp (${ref})`;
    subtitle = 'Dispatches Material Movement Voucher PDF directly to WhatsApp';
    fileName = `Stock_Voucher_${ref}.pdf`;
    generateBlobFn = () => clientMicroPdf.generateTransactionPdfBlob({ transaction: t, firm });
    downloadFn = () => clientMicroPdf.downloadTransactionPdf({ transaction: t, firm });

    const isIn = t.transaction_type === 'STOCK_IN';
    whatsappMessage = `🧾 *STOCK MOVEMENT VOUCHER: ${ref}*\n🏢 *${companyName}*\n━━━━━━━━━━━━━━━━━━━━\n🔄 *Movement:* ${isIn ? 'STOCK INWARD (RECEIPT)' : 'STOCK OUTWARD (DISPATCH)'}\n📦 *Material:* ${t.item_name || 'Timber'}\n📊 *Quantity:* ${t.quantity || 0} units\n🏢 *Party:* ${t.party_name || 'Warehouse Operations'}\n📅 *Date:* ${today}\n\n📎 *Official Vector PDF attached & downloaded.*`;
  } else if (type === 'drive') {
    const f = activePayload;
    title = 'Send Document Archive Slip to WhatsApp';
    subtitle = 'Dispatches Cloud Document Archive Slip directly to WhatsApp';
    fileName = `Document_${f.name || 'Archive'}.pdf`;
    whatsappMessage = `📁 *OFFICIAL DOCUMENT ARCHIVE NOTICE*\n🏢 *${companyName}*\n━━━━━━━━━━━━━━━━━━━━\n📄 *Document:* ${f.name}\n📂 *Folder:* ${f.category || 'General'}\n📅 *Archived Date:* ${f.upload_date || today}\n\n📎 *Official Document Record - ${companyName}.*`;
  }

  const [phone, setPhone] = useState(initialPhone);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Standardize phone for WhatsApp URL (e.g. 9876543210 -> 919876543210)
  const getFormattedPhone = () => {
    let clean = (phone || '').replace(/\D/g, '');
    if (clean.length === 10) {
      clean = '91' + clean;
    }
    return clean;
  };

  /**
   * Primary action: Native PDF File Share directly into WhatsApp
   */
  const handleDirectPdfShare = async () => {
    setShareStatus('generating');
    try {
      const { blob } = generateBlobFn();
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });

      // Check if browser supports Web Share API with Files
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: fileName,
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
    downloadFn();

    // 2. Open WhatsApp chat with pre-filled message
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
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
              <h3 className="text-base font-black tracking-tight">{title}</h3>
              <p className="text-[11px] text-emerald-100">{subtitle}</p>
            </div>
          </div>
          {/* HIGH-VISIBILITY RED CLOSE BUTTON */}
          <button 
            type="button"
            onClick={onClose} 
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition ring-2 ring-red-400/40 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Recipient Phone Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>Recipient WhatsApp Phone Number *</span>
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
                <p className="font-bold text-slate-900">{fileName}</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Micro-PDF Vector Attachment • ~5.4 KB • Verified Standard
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadFn}
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
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
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
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
              <span>PDF dispatched to WhatsApp successfully!</span>
            </div>
          )}

          {shareStatus === 'opened' && (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">PDF file downloaded &amp; WhatsApp chat opened!</p>
                <p className="text-[10px] text-blue-600">The PDF is now in your downloads folder. Simply drag or attach the downloaded PDF file into the WhatsApp chat.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>

            {/* Direct Send to WhatsApp Button */}
            <button
              type="button"
              onClick={handleDirectPdfShare}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send PDF to WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
