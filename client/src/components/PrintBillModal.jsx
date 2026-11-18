import React, { useState } from 'react';
import { X, Printer, Download, HardDrive, ShieldCheck, FileCheck } from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';
import WhatsAppModal from './WhatsAppModal';

export default function PrintBillModal({ isOpen, onClose, invoice, firm }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    clientMicroPdf.downloadInvoicePdf(invoice);
  };

  const subtotal = Number(invoice.subtotal || 0);
  const taxRate = Number(invoice.tax_rate || 18);
  const taxAmount = Number(invoice.tax_amount || 0);
  const grandTotal = Number(invoice.total_amount || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = Number(invoice.balance_due || (grandTotal - amountPaid));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-600 text-white uppercase">
              Micro-PDF Document
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              {invoice.file_size_kb || 5.4} KB (.pdf)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Direct WhatsApp PDF Send Button */}
            <button
              onClick={() => setShowWhatsApp(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Send bill directly to customer on WhatsApp in PDF format"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
              </svg>
              <span>WhatsApp PDF</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Download direct PDF file to your device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF File</span>
            </button>

            {/* Print A4 / Thermal Receipt */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 / Thermal</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Content */}
        <div id="printable-bill" className="p-8 text-slate-800 text-xs bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-5 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">SHASHWAT GROUP</h1>
              <p className="text-[11px] text-slate-600 font-medium">
                Industrial SaaS Solutions • CRM & Inventory Division
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                GSTIN / Tax ID: 27AABCS1234F1Z5 • Email: billing@shashwatgroup.com
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase rounded bg-slate-900 text-white tracking-wider mb-1">
                TAX INVOICE
              </span>
              <p className="text-xs font-bold text-slate-900">{invoice.invoice_number}</p>
              <p className="text-[11px] text-slate-500">Date: {invoice.invoice_date}</p>
              <p className="text-[11px] font-semibold text-emerald-600">Status: {invoice.status}</p>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-5 flex justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Billed To:</p>
              <p className="text-sm font-bold text-slate-900">{invoice.customer_name}</p>
              <p className="text-[11px] text-slate-600">{invoice.customer_phone} • {invoice.customer_email}</p>
              {invoice.customer_address && (
                <p className="text-[11px] text-slate-500 mt-0.5">{invoice.customer_address}</p>
              )}
            </div>
            <div className="text-right text-[11px] space-y-0.5 text-slate-600">
              <p><span className="font-semibold text-slate-800">Payment Due:</span> {invoice.due_date || 'Immediate'}</p>
              <p><span className="font-semibold text-slate-800">Mode:</span> {invoice.payment_method || 'Bank Transfer'}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse mb-5">
            <thead>
              <tr className="border-b border-slate-300 text-slate-700 font-bold text-[11px] bg-slate-100">
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Item Name &amp; Description</th>
                <th className="py-2.5 px-3 text-center">Dimensions</th>
                <th className="py-2.5 px-3 text-center w-20">Pieces</th>
                <th className="py-2.5 px-3 text-center w-24">Total CFT</th>
                <th className="py-2.5 px-3 text-right w-24">Rate (₹)</th>
                <th className="py-2.5 px-3 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {(invoice.items || []).map((it, idx) => {
                const pcs = it.pieces || (it.total_cft ? it.quantity : it.quantity) || 1;
                const cftVal = it.total_cft || it.totalCft || 0;
                const dims = (it.length || it.width || it.thickness) 
                  ? `${it.length || 0}L × ${it.width || 0}W × ${it.thickness || 0}T`
                  : null;

                return (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{it.item_name || it.itemName}</p>
                      {(it.item_description || it.itemDescription) && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {it.item_description || it.itemDescription}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-600">
                      {dims || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {pcs} Pcs
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                      {cftVal > 0 ? `${Number(cftVal).toFixed(3)} CFT` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      ₹{Number(it.unit_price || it.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      ₹{Number(it.total_price || it.totalPrice || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Calculation Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-1.5 text-slate-700 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({taxRate}%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              {Number(invoice.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-₹{Number(invoice.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span>₹{amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-rose-700 border-t border-slate-200 pt-1">
                <span>Balance Due:</span>
                <span>₹{balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Sign */}
          <div className="border-t border-slate-300 pt-4 flex justify-between items-end text-[10px] text-slate-500">
            <div className="max-w-xs space-y-1">
              <p className="font-semibold text-slate-700">Terms & Conditions:</p>
              <p>1. Payment due within specified due date.</p>
              <p>2. Goods once sold cannot be returned without prior authorization.</p>
              <p className="text-[9px] text-emerald-600 mt-2 font-mono">
                Micro-optimized vector document (~5 KB) • Electronically Archived
              </p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-400 w-36 mb-1"></div>
              <p className="font-bold text-slate-800">Authorized Signatory</p>
              <p className="text-[9px]">For Shashwat Group</p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp PDF Dispatch Modal */}
      {showWhatsApp && (
        <WhatsAppModal
          isOpen={showWhatsApp}
          onClose={() => setShowWhatsApp(false)}
          invoice={invoice}
          firm={firm}
        />
      )}
    </div>
  );
}
