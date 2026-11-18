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
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Eye,
  Truck
} from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';
import WhatsAppModal from '../components/WhatsAppModal';
import InvoiceModal from '../components/InvoiceModal';

export default function Billing({ 
  invoices = [], 
  firm,
  inventory = [],
  onOpenCreate, 
  onPrint, 
  onRecordPayment,
  onUpdateInvoice,
  onDeleteInvoice 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [editingInvoiceData, setEditingInvoiceData] = useState(null);
  const [whatsAppInvoice, setWhatsAppInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.vehicle_no && inv.vehicle_no.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const handleDeleteClick = (inv) => {
    if (confirm(`Are you sure you want to delete Invoice "${inv.invoice_number}" for ${inv.customer_name}? This cannot be undone.`)) {
      if (onDeleteInvoice) {
        onDeleteInvoice(inv.id);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoice Bill &amp; Invoicing</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Commercial bills with packing list, vehicle numbers, conditional GST, instant WhatsApp PDF, Preview, Print &amp; Edit.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Customer Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice, customer, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ISSUED', 'PARTIALLY_PAID', 'PAID'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Invoices' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer / Consignee</th>
                <th className="py-3 px-4">Vehicle No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">File Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400 text-xs">
                    No commercial invoices found. Click "New Customer Invoice" to create a bill.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{inv.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{inv.customer_phone || inv.customer_email || 'No contact'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {inv.vehicle_no ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                          <Truck className="w-3 h-3 text-blue-600" />
                          {inv.vehicle_no}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <p>{inv.invoice_date}</p>
                      <p className="text-[10px] text-slate-400">Due: {inv.due_date || 'Immediate'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
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
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* USER REQUEST: Dedicated Preview Button as 1st Action */}
                      <button
                        onClick={() => onPrint(inv)}
                        title="Preview Bill (Print, WhatsApp, PDF, Edit)"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      {/* Send to WhatsApp (PDF) */}
                      <button
                        onClick={() => setWhatsAppInvoice(inv)}
                        title="Send Bill to WhatsApp (PDF file)"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-300"
                      >
                        <svg className="w-3.5 h-3.5 fill-emerald-600" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
                        </svg>
                        <span>WhatsApp</span>
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => clientMicroPdf.downloadInvoicePdf(inv)}
                        title="Download Bill as PDF (under 8 KB)"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      {/* Print */}
                      <button
                        onClick={() => onPrint(inv)}
                        title="Print A4 / Thermal"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>

                      {/* Record Payment */}
                      {Number(inv.balance_due) > 0 && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          title="Record Payment"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay</span>
                        </button>
                      )}

                      {/* Edit Invoice */}
                      <button
                        onClick={() => setEditingInvoiceData(inv)}
                        title="Edit Invoice Details & Items"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition border border-amber-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Invoice */}
                      <button
                        onClick={() => handleDeleteClick(inv)}
                        title="Delete Invoice"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Record Client Payment
              </h3>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <p><span className="text-slate-500">Invoice:</span> <span className="font-bold">{payingInvoice.invoice_number}</span></p>
              <p><span className="text-slate-500">Customer:</span> <span className="font-bold">{payingInvoice.customer_name}</span></p>
              <p><span className="text-slate-500">Total:</span> ₹{Number(payingInvoice.total_amount).toFixed(2)}</p>
              <p><span className="text-slate-500">Balance Due:</span> <span className="font-black text-rose-600">₹{Number(payingInvoice.balance_due).toFixed(2)}</span></p>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  max={payingInvoice.balance_due}
                  required
                  placeholder={`Max ₹${payingInvoice.balance_due}`}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-bold"
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
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Invoice Full Modal */}
      {editingInvoiceData && (
        <InvoiceModal
          isOpen={Boolean(editingInvoiceData)}
          onClose={() => setEditingInvoiceData(null)}
          onUpdated={onUpdateInvoice}
          invoiceToEdit={editingInvoiceData}
          inventoryItems={inventory}
          firm={firm}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsAppInvoice && (
        <WhatsAppModal
          isOpen={Boolean(whatsAppInvoice)}
          onClose={() => setWhatsAppInvoice(null)}
          invoice={whatsAppInvoice}
          firm={firm}
        />
      )}
    </div>
  );
}
