import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Download,
  CreditCard, 
  ExternalLink, 
  HardDrive,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';

export default function Billing({ invoices, onOpenCreate, onPrint, onRecordPayment }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onRecordPayment(payingInvoice.id, payAmount, payMethod);
    setPayingInvoice(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-100 text-brand-800">
              MODULE 4
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoice Bill & Invoicing</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate GST-compliant commercial bills, track payments, download vector PDFs in KB, and sync to Google Drive.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ISSUED', 'PARTIALLY_PAID', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date / Due</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Drive Storage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-brand-700">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{inv.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{inv.customer_phone || inv.customer_email || 'No contact'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <p>{inv.invoice_date}</p>
                      <p className="text-[10px] text-slate-400">Due: {inv.due_date || 'Immediate'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{Number(inv.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-700">
                      ₹{Number(inv.balance_due || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'PARTIALLY_PAID'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                        {inv.status === 'PARTIALLY_PAID' && <Clock className="w-3 h-3" />}
                        {inv.status === 'ISSUED' && <AlertCircle className="w-3 h-3" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <HardDrive className="w-3 h-3" />
                        {inv.file_size_kb || 5.4} KB
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => clientMicroPdf.downloadInvoicePdf(inv)}
                        title="Download Bill as PDF (under 8 KB)"
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Download className="w-4 h-4 inline" />
                      </button>

                      <button
                        onClick={() => onPrint(inv)}
                        title="Print / Micro-PDF Preview"
                        className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Printer className="w-4 h-4 inline" />
                      </button>

                      {Number(inv.balance_due) > 0 && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          title="Record Payment"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <CreditCard className="w-4 h-4 inline" />
                        </button>
                      )}

                      <a
                        href={inv.drive_file_url || 'https://drive.google.com'}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in Google Drive"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition inline-block"
                      >
                        <ExternalLink className="w-4 h-4 inline" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Record Customer Payment - {payingInvoice.invoice_number}
            </h3>
            <p className="text-xs text-slate-500">
              Customer: <span className="font-semibold text-slate-800">{payingInvoice.customer_name}</span>
              <br />
              Balance Due: <span className="font-bold text-rose-700">₹{Number(payingInvoice.balance_due).toFixed(2)}</span>
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`Max ₹${payingInvoice.balance_due}`}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI (GPay, PhonePe, Paytm)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
