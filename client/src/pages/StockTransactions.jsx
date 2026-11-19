import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  FileText,
  HardDrive,
  Trash2
} from 'lucide-react';
import { moduleWhatsApp } from '../utils/moduleWhatsAppSharer';
import WhatsAppModal from '../components/WhatsAppModal';

export default function StockTransactions({ firm, transactions = [], onDeleteTransaction }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsAppTrans, setWhatsAppTrans] = useState(null);

  const filtered = transactions.filter((t) => {
    const matchesSearch = 
      t.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.party_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.transaction_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDeleteClick = (t) => {
    if (confirm(`Delete stock log record #${t.reference_number} (${t.transaction_type} for ${t.item_name})?`)) {
      if (onDeleteTransaction) {
        onDeleteTransaction(t.id);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">History (Stock Movement &amp; Activity Audit)</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Permanent history of all inward warehouse receipts (Stock In), outward dispatches (Stock Out), and inventory audits.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search item, party, or ref number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs">
          {['ALL', 'STOCK_IN', 'STOCK_OUT'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'STOCK_IN' ? 'Stock In (Input)' : t === 'STOCK_OUT' ? 'Stock Out (Output)' : 'All Transactions'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4 text-center">Quantity Moved</th>
                <th className="py-3 px-4 text-center">Balance After</th>
                <th className="py-3 px-4">Reference No</th>
                <th className="py-3 px-4">Party (Supplier / Customer)</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4 text-center">Cloud Voucher</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No movement records found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isStockIn = t.transaction_type === 'STOCK_IN';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isStockIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isStockIn ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isStockIn ? 'STOCK IN' : 'STOCK OUT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {t.item_name || t.inventory_items?.name || 'Wood Item'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={isStockIn ? 'text-emerald-700' : 'text-rose-700'}>
                          {isStockIn ? '+' : '-'}{t.quantity} {t.unit || 'CFT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {t.balance_after} {t.unit || 'CFT'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-brand-700">
                        {t.reference_number || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {t.party_name || 'Direct'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {t.transaction_date ? String(t.transaction_date).slice(0, 16).replace('T', ' ') : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <HardDrive className="w-3 h-3" />
                          {t.voucher_size_kb || 3.4} KB
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setWhatsAppTrans(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                            title="Send Movement Voucher PDF to WhatsApp"
                          >
                            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
                            </svg>
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                            title="Delete Transaction Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* WhatsApp Modal for Movement Voucher PDF */}
      {whatsAppTrans && (
        <WhatsAppModal
          isOpen={Boolean(whatsAppTrans)}
          onClose={() => setWhatsAppTrans(null)}
          type="transaction"
          data={whatsAppTrans}
          firm={firm}
        />
      )}
    </div>
  );
}
