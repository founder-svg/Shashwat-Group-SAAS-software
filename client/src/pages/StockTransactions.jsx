import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Receipt,
  Truck,
  Boxes,
  FileSpreadsheet,
  Calendar,
  Printer,
  Download,
  HardDrive,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  PackageCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';
import WhatsAppModal from '../components/WhatsAppModal';

export default function StockTransactions({ 
  firm, 
  transactions = [], 
  invoices = [], 
  vehicles = [], 
  inventory = [], 
  onDeleteTransaction, 
  onPrintInvoice, 
  onDeleteInvoice 
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BILLS' | 'STOCK_IN' | 'STOCK_OUT' | 'VEHICLES'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  
  // Modals
  const [whatsAppModalData, setWhatsAppModalData] = useState(null);
  const [whatsAppModalType, setWhatsAppModalType] = useState('transaction');

  // Filter out any legacy demo invoices (e.g. Patel Enterprises)
  const cleanInvoices = useMemo(() => {
    return invoices.filter(inv => 
      inv &&
      inv.customer_name !== 'Patel Enterprises' &&
      inv.customer_name !== 'Patel Timber Mart' &&
      inv.invoice_number !== 'INV-2026-001' &&
      !['inv-1', 'inv-demo'].includes(inv.id)
    );
  }, [invoices]);

  // Date filtering helper
  const isWithinDateFilter = (dateStr) => {
    if (!dateStr || dateFilter === 'ALL') return true;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return true;
    const now = new Date();
    
    if (dateFilter === 'TODAY') {
      return target.toDateString() === now.toDateString();
    }
    if (dateFilter === 'WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return target >= oneWeekAgo;
    }
    if (dateFilter === 'MONTH') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return target >= oneMonthAgo;
    }
    return true;
  };

  // 1. FILTERED TRANSACTIONS (Stock In & Stock Out)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = isWithinDateFilter(t.created_at || t.transaction_date);
      return matchesSearch && matchesDate;
    });
  }, [transactions, searchTerm, dateFilter]);

  const stockInList = useMemo(() => {
    return filteredTransactions.filter(t => t.transaction_type === 'STOCK_IN');
  }, [filteredTransactions]);

  const stockOutList = useMemo(() => {
    return filteredTransactions.filter(t => t.transaction_type === 'STOCK_OUT');
  }, [filteredTransactions]);

  // 2. FILTERED INVOICES / BILLS
  const filteredInvoices = useMemo(() => {
    return cleanInvoices.filter(inv => {
      const matchesSearch = 
        inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.items && inv.items.some(it => (it.itemName || it.item_name)?.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesDate = isWithinDateFilter(inv.invoice_date || inv.created_at);
      return matchesSearch && matchesDate;
    });
  }, [cleanInvoices, searchTerm, dateFilter]);

  // 3. FILTERED VEHICLES & LOGGED DISPATCHES
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        v.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.current_destination?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [vehicles, searchTerm]);

  // 4. UNIFIED ACTIVITY TIMELINE (Chronologically sorted)
  const unifiedTimeline = useMemo(() => {
    const list = [];

    // Add Invoices
    filteredInvoices.forEach(inv => {
      list.push({
        id: `u-inv-${inv.id || inv.invoice_number}`,
        type: 'INVOICE_BILL',
        title: `Tax Invoice Billed: ${inv.invoice_number}`,
        subTitle: `Customer: ${inv.customer_name} • ${inv.items?.length || 1} line item(s)`,
        date: inv.invoice_date || inv.created_at || 'Recent',
        badge: 'BILL GENERATED',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        amount: Number(inv.total_amount || 0),
        vehicleNo: inv.vehicle_no || '',
        party: inv.customer_name,
        raw: inv
      });
    });

    // Add Stock Transactions
    filteredTransactions.forEach(t => {
      const isIn = t.transaction_type === 'STOCK_IN';
      list.push({
        id: `u-trans-${t.id}`,
        type: t.transaction_type,
        title: isIn ? `Stock In (Input): +${t.quantity} ${t.unit || 'pcs'}` : `Stock Out (Dispatched): -${t.quantity} ${t.unit || 'pcs'}`,
        subTitle: `Material: ${t.item_name} • Party: ${t.party_name || (isIn ? 'Supplier' : 'Customer')}`,
        date: t.created_at || t.transaction_date || 'Recent',
        badge: isIn ? 'STOCK IN (INPUT)' : 'STOCK OUT (OUTPUT)',
        badgeColor: isIn ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300',
        vehicleNo: t.vehicle_no || '',
        party: t.party_name,
        balanceAfter: t.balance_after,
        raw: t
      });
    });

    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [filteredInvoices, filteredTransactions]);

  // Overall Statistics
  const totalBilledValue = cleanInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const totalBalanceDue = cleanInvoices.reduce((sum, inv) => sum + Number(inv.balance_due || 0), 0);
  const totalStockInQty = transactions.filter(t => t.transaction_type === 'STOCK_IN').reduce((sum, t) => sum + Number(t.quantity || 0), 0);
  const totalStockOutQty = transactions.filter(t => t.transaction_type === 'STOCK_OUT').reduce((sum, t) => sum + Number(t.quantity || 0), 0);

  const handleDeleteTrans = (t) => {
    if (confirm(`Are you sure you want to delete history record #${t.reference_number || t.id} (${t.item_name})?`)) {
      if (onDeleteTransaction) onDeleteTransaction(t.id);
    }
  };

  const handleDeleteInv = (inv) => {
    if (confirm(`Are you sure you want to delete invoice ${inv.invoice_number} from history?`)) {
      if (onDeleteInvoice) onDeleteInvoice(inv.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Mission */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black shadow-md border border-slate-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Enterprise History &amp; Audit Trail
              </h1>
              <p className="text-xs text-slate-500">
                Unified chronological log of Customer Bills, Warehouse Input (Stock In), Output Dispatches (Stock Out), and Fleet Vehicles.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition no-print self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-600" />
          <span>Print Audit Sheet</span>
        </button>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        {/* Total Invoices Billed */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Customer Bills</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-black text-slate-900">{cleanInvoices.length}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Total: <strong>₹{totalBilledValue.toFixed(2)}</strong>
          </p>
        </div>

        {/* Stock In (Input) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-emerald-800">Stock In (Input)</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-emerald-700">+{totalStockInQty} <span className="text-xs font-normal">units</span></p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {transactions.filter(t => t.transaction_type === 'STOCK_IN').length} receipts logged
          </p>
        </div>

        {/* Stock Out (Output) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-rose-800">Stock Out (Dispatched)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-lg font-black text-rose-700">-{totalStockOutQty} <span className="text-xs font-normal">units</span></p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {transactions.filter(t => t.transaction_type === 'STOCK_OUT').length} dispatches logged
          </p>
        </div>

        {/* Fleet Vehicles */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Registered Fleet</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-black text-slate-900">{vehicles.length}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {vehicles.filter(v => v.status === 'available').length} Available • {vehicles.filter(v => v.status === 'on_delivery').length} On Route
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Tab Buttons */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📋 All Activities</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {unifiedTimeline.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BILLS')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BILLS'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Bills &amp; Invoices</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/10 font-mono">
              {filteredInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STOCK_IN')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STOCK_IN'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Stock In (Input)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {stockInList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STOCK_OUT')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STOCK_OUT'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Stock Out (Output)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {stockOutList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VEHICLES')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'VEHICLES'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Vehicles &amp; Trips</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {filteredVehicles.length}
            </span>
          </button>
        </div>

        {/* Date Filter Quick Pills */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {['ALL', 'TODAY', 'WEEK', 'MONTH'].map((df) => (
            <button
              key={df}
              type="button"
              onClick={() => setDateFilter(df)}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                dateFilter === df
                  ? 'bg-slate-800 text-white font-bold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {df === 'ALL' ? 'All Time' : df === 'TODAY' ? 'Today' : df === 'WEEK' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Universal Search Bar */}
      <div className="relative no-print">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by Invoice # (e.g. INV-2026-...), Material, Customer, Vehicle No (GJ-18-...), Driver..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ALL ACTIVITIES UNIFIED TIMELINE */}
      {/* ===================================================================== */}
      {activeTab === 'ALL' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>Chronological Activity Log</span>
              <span className="text-[10px] text-amber-400 font-mono">({unifiedTimeline.length} events)</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {unifiedTimeline.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No history records matching filter.
              </div>
            ) : (
              unifiedTimeline.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.type === 'INVOICE_BILL' ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                          <Receipt className="w-4 h-4" />
                        </div>
                      ) : item.type === 'STOCK_IN' ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                          <ArrowDownRight className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">
                          {item.title}
                        </h3>
                        {item.vehicleNo && (
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            🚛 {item.vehicleNo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {item.subTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Date: {String(item.date).slice(0, 16).replace('T', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {item.type === 'INVOICE_BILL' ? (
                      <>
                        <span className="text-xs font-black text-slate-900 mr-2">
                          ₹{item.amount.toFixed(2)}
                        </span>
                        {onPrintInvoice && (
                          <button
                            type="button"
                            onClick={() => onPrintInvoice(item.raw)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Preview Bill</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setWhatsAppModalData(item.raw);
                            setWhatsAppModalType('invoice');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setWhatsAppModalData(item.raw);
                            setWhatsAppModalType('transaction');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrans(item.raw)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: BILLS & INVOICES HISTORY */}
      {/* ===================================================================== */}
      {activeTab === 'BILLS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Generated Customer Bills &amp; Dispatches ({filteredInvoices.length})
              </span>
            </div>
            <span className="text-xs text-amber-400 font-mono font-bold">
              Total: ₹{filteredInvoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0).toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vehicle No</th>
                  <th className="py-3 px-4">Items / Peace</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                      No customer bills found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const totalPcs = (inv.items || []).reduce((acc, it) => acc + (Number(it.pieces) || 1), 0);
                    return (
                      <tr key={inv.id || inv.invoice_number} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-800">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{inv.customer_name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{inv.customer_phone || 'No Phone'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {inv.invoice_date || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-blue-700">
                          {inv.vehicle_no ? `🚛 ${inv.vehicle_no}` : <span className="text-slate-400 font-normal">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium">
                          <span>{inv.items?.length || 1} item(s)</span>
                          <span className="text-[10px] text-slate-400 block font-mono">({totalPcs} total peace)</span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          ₹{Number(inv.total_amount || 0).toFixed(2)}
                          {Number(inv.balance_due) > 0 && (
                            <span className="text-[10px] text-rose-600 block font-normal">
                              Due: ₹{Number(inv.balance_due).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            Number(inv.balance_due) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {Number(inv.balance_due) === 0 ? 'PAID' : 'ISSUED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {onPrintInvoice && (
                              <button
                                type="button"
                                onClick={() => onPrintInvoice(inv)}
                                className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                                title="View & Print Bill"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-400" />
                                <span>Preview</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setWhatsAppModalData(inv);
                                setWhatsAppModalType('invoice');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer"
                              title="Send PDF Bill on WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInv(inv)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* ===================================================================== */}
      {/* TAB 3: STOCK IN (INPUT) HISTORY */}
      {/* ===================================================================== */}
      {activeTab === 'STOCK_IN' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-emerald-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowDownRight className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Stock Inward Receipts (Input) — {stockInList.length} Entries
              </span>
            </div>
            <span className="text-xs text-emerald-200 font-mono font-bold">
              Total Inward: +{stockInList.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0)} units
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Material / Item</th>
                  <th className="py-3 px-4 text-center">Inward Quantity</th>
                  <th className="py-3 px-4 text-center">Balance After</th>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Supplier / Source</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4 text-center">Voucher</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockInList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                      No stock inward (Stock In) records found.
                    </td>
                  </tr>
                ) : (
                  stockInList.map((t) => (
                    <tr key={t.id} className="hover:bg-emerald-50/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {t.item_name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                        +{t.quantity} {t.unit || 'pcs'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {t.balance_after} {t.unit || 'pcs'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                        {t.reference_number || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {t.party_name || 'Warehouse Stock Receipt'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {String(t.created_at || t.transaction_date).slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <HardDrive className="w-3 h-3" />
                          {t.voucher_size_kb || 3.6} KB
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setWhatsAppModalData(t);
                              setWhatsAppModalType('transaction');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTrans(t)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: STOCK OUT (OUTPUT) HISTORY */}
      {/* ===================================================================== */}
      {activeTab === 'STOCK_OUT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-rose-950 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="w-4 h-4 text-rose-300" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Stock Dispatches (Output / Dispatched on Bills) — {stockOutList.length} Entries
              </span>
            </div>
            <span className="text-xs text-rose-200 font-mono font-bold">
              Total Dispatched: -{stockOutList.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0)} units
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Dispatched Material</th>
                  <th className="py-3 px-4 text-center">Quantity Deducted</th>
                  <th className="py-3 px-4 text-center">Remaining Balance</th>
                  <th className="py-3 px-4">Invoice / Bill Ref</th>
                  <th className="py-3 px-4">Customer Party</th>
                  <th className="py-3 px-4">Vehicle No</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockOutList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                      No stock dispatch (Stock Out) records found.
                    </td>
                  </tr>
                ) : (
                  stockOutList.map((t) => (
                    <tr key={t.id} className="hover:bg-rose-50/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {t.item_name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-700">
                        -{t.quantity} {t.unit || 'pcs'}
                        {t.pieces && t.pieces !== t.quantity && (
                          <span className="text-[10px] text-slate-400 block font-normal">({t.pieces} pcs)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {t.balance_after} {t.unit || 'pcs'}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-800 font-bold">
                        {t.reference_number || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {t.party_name || 'Customer'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 text-xs">
                        {t.vehicle_no ? `🚛 ${t.vehicle_no}` : <span className="text-slate-400 font-normal">N/A</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {String(t.created_at || t.transaction_date).slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setWhatsAppModalData(t);
                              setWhatsAppModalType('transaction');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTrans(t)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: VEHICLES & FLEET TRIPS HISTORY */}
      {/* ===================================================================== */}
      {activeTab === 'VEHICLES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-blue-950 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Fleet Vehicles &amp; Delivery Trips ({filteredVehicles.length})
              </span>
            </div>
            <span className="text-xs text-blue-300 font-mono font-bold">
              {vehicles.filter(v => v.status === 'available').length} Available • {vehicles.filter(v => v.status === 'on_delivery').length} Dispatched
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Vehicle No</th>
                  <th className="py-3 px-4">Type / Model</th>
                  <th className="py-3 px-4">Driver Name &amp; Phone</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Active Destination / Trips</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 text-xs">
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((v) => {
                    // Count how many invoices used this vehicle
                    const vehicleInvoices = cleanInvoices.filter(i => 
                      i.vehicle_no && i.vehicle_no.toUpperCase() === v.vehicle_number?.toUpperCase()
                    );
                    return (
                      <tr key={v.id || v.vehicle_number} className="hover:bg-blue-50/40 transition">
                        <td className="py-3 px-4 font-mono font-black text-blue-900 text-xs">
                          🚛 {v.vehicle_number}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {v.vehicle_type || 'Truck'}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{v.driver_name || 'Unassigned'}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{v.driver_phone || 'No Contact'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {v.capacity_kg ? `${v.capacity_kg} kg` : '2000 kg'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {v.status === 'available' ? '● Available' : '● On Route'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className="font-semibold text-slate-800 block">
                            {v.current_destination || 'Warehouse Base'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {vehicleInvoices.length} delivery trip(s) logged
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setWhatsAppModalData(v);
                              setWhatsAppModalType('vehicle');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer mx-auto"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global WhatsApp Modal for History */}
      {whatsAppModalData && (
        <WhatsAppModal
          isOpen={Boolean(whatsAppModalData)}
          onClose={() => setWhatsAppModalData(null)}
          type={whatsAppModalType}
          data={whatsAppModalData}
          invoice={whatsAppModalType === 'invoice' ? whatsAppModalData : null}
          firm={firm}
        />
      )}
    </div>
  );
}