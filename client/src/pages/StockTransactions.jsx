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
import GlassFolder from '../components/ui/glass-folder-cards';
import LiquidNavbar from '../components/ui/liquid-glass-navbar';

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
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'folders'
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BILLS' | 'STOCK_IN' | 'STOCK_OUT' | 'VEHICLES'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'CUSTOM' | 'WEEK' | 'MONTH'
  const [selectedCustomDate, setSelectedCustomDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  
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

  // Extract 'YYYY-MM-DD' cleanly from any date representation (string, ISO, Date) in local time
  const toYMD = (val) => {
    if (!val) return '';
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      if (typeof val === 'string') {
        const match = val.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return `${match[1]}-${match[2]}-${match[3]}`;
      }
      return '';
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayObj = useMemo(() => new Date(), []);
  const todayYMD = useMemo(() => toYMD(todayObj), [todayObj]);

  const yesterdayYMD = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return toYMD(y);
  }, []);

  // Date filtering helper
  const isWithinDateFilter = (dateStr) => {
    if (!dateStr || dateFilter === 'ALL') return true;
    const itemYMD = toYMD(dateStr);
    if (!itemYMD) return true;

    if (dateFilter === 'TODAY') {
      return itemYMD === todayYMD;
    }
    if (dateFilter === 'YESTERDAY') {
      return itemYMD === yesterdayYMD;
    }
    if (dateFilter === 'CUSTOM') {
      return itemYMD === selectedCustomDate;
    }
    if (dateFilter === 'WEEK') {
      const target = new Date(dateStr);
      const oneWeekAgo = new Date(todayObj.getTime() - 7 * 24 * 60 * 60 * 1000);
      return target >= oneWeekAgo;
    }
    if (dateFilter === 'MONTH') {
      const target = new Date(dateStr);
      const oneMonthAgo = new Date(todayObj.getTime() - 30 * 24 * 60 * 60 * 1000);
      return target >= oneMonthAgo;
    }
    return true;
  };

  const getDateFilterLabel = () => {
    if (dateFilter === 'ALL') return 'All Time';
    if (dateFilter === 'TODAY') return `Today (${todayYMD})`;
    if (dateFilter === 'YESTERDAY') return `Yesterday (${yesterdayYMD})`;
    if (dateFilter === 'CUSTOM') return `Chosen Date (${selectedCustomDate})`;
    if (dateFilter === 'WEEK') return 'Last 7 Days';
    if (dateFilter === 'MONTH') return 'Last 30 Days';
    return dateFilter;
  };

  // =====================================================================
  // TODAY'S REAL-TIME OFFICE HOURS WORKFLOW ENTRIES
  // =====================================================================
  const todayInvoices = useMemo(() => {
    return cleanInvoices.filter(inv => toYMD(inv.invoice_date || inv.created_at) === todayYMD);
  }, [cleanInvoices, todayYMD]);

  const todayStockIn = useMemo(() => {
    return transactions.filter(t => t.transaction_type === 'STOCK_IN' && toYMD(t.created_at || t.transaction_date) === todayYMD);
  }, [transactions, todayYMD]);

  const todayStockOut = useMemo(() => {
    return transactions.filter(t => t.transaction_type === 'STOCK_OUT' && toYMD(t.created_at || t.transaction_date) === todayYMD);
  }, [transactions, todayYMD]);

  const todayVehiclesActive = useMemo(() => {
    return vehicles.filter(v => 
      cleanInvoices.some(i => toYMD(i.invoice_date || i.created_at) === todayYMD && i.vehicle_no?.trim().toUpperCase() === v.vehicle_number?.trim().toUpperCase()) ||
      transactions.some(t => toYMD(t.created_at || t.transaction_date) === todayYMD && t.vehicle_no?.trim().toUpperCase() === v.vehicle_number?.trim().toUpperCase())
    );
  }, [vehicles, cleanInvoices, transactions, todayYMD]);

  const todayTotalEntries = todayInvoices.length + todayStockIn.length + todayStockOut.length;
  const todayBilledValue = todayInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const todayStockInQty = todayStockIn.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
  const todayStockOutQty = todayStockOut.reduce((sum, t) => sum + Number(t.quantity || 0), 0);

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
  }, [transactions, searchTerm, dateFilter, selectedCustomDate, todayYMD, yesterdayYMD]);

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
  }, [cleanInvoices, searchTerm, dateFilter, selectedCustomDate, todayYMD, yesterdayYMD]);

  // 3. FILTERED VEHICLES & LOGGED DISPATCHES (Filtered by date & search)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        v.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.current_destination?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (dateFilter === 'ALL') return true;

      // Check if vehicle was registered/updated on this date
      const matchesVehicleDate = isWithinDateFilter(v.updated_at || v.created_at);

      // Check if vehicle had an invoice/delivery trip on this date
      const hasInvoiceOnDate = cleanInvoices.some(inv => 
        inv.vehicle_no && 
        inv.vehicle_no.trim().toUpperCase() === v.vehicle_number?.trim().toUpperCase() &&
        isWithinDateFilter(inv.invoice_date || inv.created_at)
      );

      // Check if vehicle had a stock dispatch on this date
      const hasTransactionOnDate = transactions.some(t =>
        t.vehicle_no &&
        t.vehicle_no.trim().toUpperCase() === v.vehicle_number?.trim().toUpperCase() &&
        isWithinDateFilter(t.created_at || t.transaction_date)
      );

      return matchesVehicleDate || hasInvoiceOnDate || hasTransactionOnDate;
    });
  }, [vehicles, searchTerm, dateFilter, selectedCustomDate, cleanInvoices, transactions, todayYMD, yesterdayYMD]);

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

        <div className="flex items-center gap-2 self-start sm:self-auto no-print flex-wrap">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Table Audit View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('folders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'folders'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-black ring-1 ring-amber-400/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Glass Folders Vault</span>
              <span className="text-[9px] bg-amber-400/20 text-amber-500 px-1.5 py-0.2 rounded font-mono font-bold">
                Animated
              </span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TODAY'S LIVE OFFICE HOURS REAL-TIME ENTRIES DONE BANNER */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-4 sm:p-5 text-white shadow-xl border border-amber-500/30 no-print">
        {/* Decorative ambient glow */}
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Live indicator, title, and count */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Office Hours Live Operations</span>
                <span className="text-emerald-400/60 font-mono">·</span>
                <span className="font-mono text-emerald-200">{todayYMD}</span>
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Today's Entries Done:
              </h2>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono drop-shadow-sm">
                {todayTotalEntries} {todayTotalEntries === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Live tracking of bills created, stock inward receipts, outward customer dispatches, and active fleet vehicles during today's business hours.
            </p>
          </div>

          {/* Right: 4 Live Metric Action Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {/* Bills Created Today */}
            <div 
              onClick={() => { setDateFilter('TODAY'); setActiveTab('BILLS'); }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md px-3 py-2.5 rounded-xl border border-white/10 cursor-pointer transition group"
              title="Click to view today's bills"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase">
                <span>Bills Today</span>
                <Receipt className="w-3 h-3 text-amber-400 group-hover:scale-110 transition" />
              </div>
              <p className="text-lg font-black text-white font-mono mt-0.5">{todayInvoices.length}</p>
              <p className="text-[10px] text-slate-300 font-mono">₹{todayBilledValue.toFixed(0)}</p>
            </div>

            {/* Stock Inward Today */}
            <div 
              onClick={() => { setDateFilter('TODAY'); setActiveTab('STOCK_IN'); }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md px-3 py-2.5 rounded-xl border border-white/10 cursor-pointer transition group"
              title="Click to view today's inward stock"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-300 uppercase">
                <span>Stock In</span>
                <ArrowDownRight className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition" />
              </div>
              <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">+{todayStockInQty}</p>
              <p className="text-[10px] text-slate-300 font-mono">{todayStockIn.length} receipts</p>
            </div>

            {/* Stock Outward Today */}
            <div 
              onClick={() => { setDateFilter('TODAY'); setActiveTab('STOCK_OUT'); }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md px-3 py-2.5 rounded-xl border border-white/10 cursor-pointer transition group"
              title="Click to view today's dispatches"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-rose-300 uppercase">
                <span>Stock Out</span>
                <ArrowUpRight className="w-3 h-3 text-rose-400 group-hover:scale-110 transition" />
              </div>
              <p className="text-lg font-black text-rose-400 font-mono mt-0.5">-{todayStockOutQty}</p>
              <p className="text-[10px] text-slate-300 font-mono">{todayStockOut.length} dispatches</p>
            </div>

            {/* Fleet / Delivery Trips Today */}
            <div 
              onClick={() => { setDateFilter('TODAY'); setActiveTab('VEHICLES'); }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md px-3 py-2.5 rounded-xl border border-white/10 cursor-pointer transition group"
              title="Click to view today's vehicle dispatches"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-blue-300 uppercase">
                <span>Fleet Active</span>
                <Truck className="w-3 h-3 text-blue-400 group-hover:scale-110 transition" />
              </div>
              <p className="text-lg font-black text-blue-300 font-mono mt-0.5">{todayVehiclesActive.length}</p>
              <p className="text-[10px] text-slate-300 font-mono">Active Vehicles</p>
            </div>
          </div>
        </div>

        {/* Action strip at bottom of banner */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-[11px]">
              Active Scope: <strong className="text-amber-300 font-mono">{getDateFilterLabel()}</strong>
            </span>
            {dateFilter !== 'ALL' && (
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                {unifiedTimeline.length} matching events
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dateFilter !== 'TODAY' ? (
              <button
                type="button"
                onClick={() => setDateFilter('TODAY')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition shadow-md cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Focus History to Today Only ({todayTotalEntries} entries) →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDateFilter('ALL')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-xs transition border border-white/20 cursor-pointer"
              >
                <span>Reset to All Records</span>
              </button>
            )}
          </div>
        </div>
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

      {/* Main Tabs Navigation & Filter Controls */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Liquid Glass Navbar for History Tabs */}
        <div className="overflow-x-auto py-1">
          <LiquidNavbar
            tone="light"
            sound={false}
            active={['ALL', 'BILLS', 'STOCK_IN', 'STOCK_OUT', 'VEHICLES'].indexOf(activeTab)}
            onChange={(idx) => {
              const tabs = ['ALL', 'BILLS', 'STOCK_IN', 'STOCK_OUT', 'VEHICLES'];
              if (tabs[idx]) setActiveTab(tabs[idx]);
            }}
            items={[
              { label: `All Activities (${unifiedTimeline.length})`, icon: <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />, fx: 'glow' },
              { label: `Bills & Invoices (${filteredInvoices.length})`, icon: <Receipt className="w-3.5 h-3.5 text-amber-600" />, fx: 'drop' },
              { label: `Stock In (${stockInList.length})`, icon: <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />, fx: 'pop' },
              { label: `Stock Out (${stockOutList.length})`, icon: <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />, fx: 'plane' },
              { label: `Vehicles & Trips (${filteredVehicles.length})`, icon: <Truck className="w-3.5 h-3.5 text-blue-600" />, fx: 'wave' },
            ]}
          />
        </div>

        {/* Date Filter Quick Pills & Choose Date Picker */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              key="ALL"
              type="button"
              onClick={() => setDateFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                dateFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              All Records
            </button>
            <button
              key="TODAY"
              type="button"
              onClick={() => setDateFilter('TODAY')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                dateFilter === 'TODAY'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'hover:bg-slate-200/80 text-slate-700 font-semibold'
              }`}
            >
              <span>Today</span>
              <span className={`px-1 py-0.2 rounded text-[10px] font-mono ${
                dateFilter === 'TODAY' ? 'bg-slate-900 text-amber-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {todayTotalEntries}
              </span>
            </button>
            <button
              key="YESTERDAY"
              type="button"
              onClick={() => setDateFilter('YESTERDAY')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                dateFilter === 'YESTERDAY'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              Yesterday
            </button>
          </div>

          {/* Custom Date Picker (Choose Date) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600 ml-1" />
            <label htmlFor="history-choose-date" className="text-[11px] font-bold text-slate-700 cursor-pointer">
              Choose Date:
            </label>
            <input
              id="history-choose-date"
              type="date"
              value={selectedCustomDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedCustomDate(e.target.value);
                  setDateFilter('CUSTOM');
                }
              }}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                dateFilter === 'CUSTOM'
                  ? 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                  : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            />
            {dateFilter === 'CUSTOM' && (
              <button
                type="button"
                onClick={() => setDateFilter('ALL')}
                className="text-slate-400 hover:text-rose-600 text-[10px] px-1 font-bold cursor-pointer"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>
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

      {/* Active Date Filter Notice Banner */}
      {dateFilter !== 'ALL' && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 no-print">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Showing records filtered for <strong>{getDateFilterLabel()}</strong>: Found{' '}
              <strong>{unifiedTimeline.length} entries</strong> ({filteredInvoices.length} bills, {stockInList.length} stock in, {stockOutList.length} stock out, {filteredVehicles.length} vehicles).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDateFilter('ALL')}
            className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer text-xs flex items-center gap-1"
          >
            <span>Show All Records</span>
            <span>✕</span>
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3D GLASS FOLDER CARDS VAULT (ANIMATED CRM THEME) */}
      {/* ===================================================================== */}
      {viewMode === 'folders' && (
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 overflow-hidden shadow-2xl">
          {/* Subtle desk dot grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 text-amber-400 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(currentColor 1.2px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Header banner */}
          <div className="relative text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest mb-2.5 shadow-inner">
              <Boxes className="w-3.5 h-3.5" />
              <span>Interactive Document &amp; Voucher Vault</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              3D Frosted Glass File Archives
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Move cursor to tilt light &amp; 3D perspective · Hover folder to lean glass · Click to fan &amp; inspect sheets
            </p>
          </div>

          {/* 4 Interactive Glass Folders in Responsive Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-12 items-end justify-items-center py-4">
            
            {/* Folder 1: Customer Invoices (Amber Wood theme) */}
            <GlassFolder
              label="Billed Invoices"
              meta={`${filteredInvoices.length} Bills Archived`}
              tone="light"
              art="amberWood"
              seed={108}
              appearDelay={0}
              action="more"
              files={
                filteredInvoices.length > 0
                  ? filteredInvoices.slice(0, 5).map(inv => ({
                      name: inv.invoice_number,
                      meta: `₹${Number(inv.total_amount).toFixed(2)} · ${inv.customer_name}`,
                      raw: inv
                    }))
                  : [
                      { 
                        name: dateFilter !== 'ALL' ? `No Bills on ${getDateFilterLabel()}` : "No Invoices Yet", 
                        meta: dateFilter !== 'ALL' ? "Filtered Scope" : "Create in Billing" 
                      }
                    ]
              }
              onFileSelect={(file) => {
                if (file.raw && onPrintInvoice) {
                  onPrintInvoice(file.raw);
                }
              }}
              menu={[
                { 
                  label: "Preview Latest Bill", 
                  onSelect: () => filteredInvoices[0] && onPrintInvoice && onPrintInvoice(filteredInvoices[0]) 
                },
                {
                  label: "Switch to Table View",
                  onSelect: () => setViewMode('table')
                }
              ]}
            />

            {/* Folder 2: Stock Inward Receipts (Forest Teak theme) */}
            <GlassFolder
              label="Stock In (Input)"
              meta={`${stockInList.length} Receipts`}
              tone="light"
              art="forestTeak"
              seed={42}
              appearDelay={140}
              action="add"
              files={
                stockInList.length > 0
                  ? stockInList.slice(0, 5).map(t => ({
                      name: t.item_name,
                      meta: `+${t.quantity} ${t.unit || 'pcs'} · ${t.party_name || 'Receipt'}`,
                      raw: t
                    }))
                  : [
                      { 
                        name: dateFilter !== 'ALL' ? `No Stock In on ${getDateFilterLabel()}` : "Warehouse Inward", 
                        meta: dateFilter !== 'ALL' ? "Filtered Scope" : "Raw Logs Receipt" 
                      }
                    ]
              }
              onFileSelect={(file) => {
                if (file.raw) {
                  setWhatsAppModalData(file.raw);
                  setWhatsAppModalType('transaction');
                }
              }}
            />

            {/* Folder 3: Stock Dispatches (Warm Mahogany theme) */}
            <GlassFolder
              label="Stock Out (Dispatches)"
              meta={`${stockOutList.length} Dispatches`}
              tone="dark"
              art="mahogany"
              seed={77}
              appearDelay={280}
              action="more"
              files={
                stockOutList.length > 0
                  ? stockOutList.slice(0, 5).map(t => ({
                      name: t.item_name,
                      meta: `-${t.quantity} ${t.unit || 'pcs'} · ${t.vehicle_no || t.party_name || 'Out'}`,
                      raw: t
                    }))
                  : [
                      { 
                        name: dateFilter !== 'ALL' ? `No Dispatches on ${getDateFilterLabel()}` : "Outward Dispatches", 
                        meta: dateFilter !== 'ALL' ? "Filtered Scope" : "Billed Deliveries" 
                      }
                    ]
              }
              onFileSelect={(file) => {
                if (file.raw) {
                  setWhatsAppModalData(file.raw);
                  setWhatsAppModalType('transaction');
                }
              }}
              menu={[
                {
                  label: "View All Dispatches in Table",
                  onSelect: () => {
                    setViewMode('table');
                    setActiveTab('STOCK_OUT');
                  }
                }
              ]}
            />

            {/* Folder 4: Fleet Vehicles & Trips (Slate Navy theme) */}
            <GlassFolder
              label="Fleet Vehicles & Trips"
              meta={`${filteredVehicles.length} Registered`}
              tone="dark"
              art="slateNavy"
              seed={13}
              appearDelay={420}
              action="none"
              files={
                filteredVehicles.length > 0
                  ? filteredVehicles.slice(0, 5).map(v => ({
                      name: v.vehicle_number,
                      meta: `${v.driver_name || 'Driver'} · ${v.status === 'available' ? 'Available' : 'On Route'}`,
                      raw: v
                    }))
                  : [
                      { 
                        name: dateFilter !== 'ALL' ? `No Fleet Trips on ${getDateFilterLabel()}` : "No Vehicles Yet", 
                        meta: dateFilter !== 'ALL' ? "Filtered Scope" : "Register in Fleet" 
                      }
                    ]
              }
              onFileSelect={(file) => {
                if (file.raw) {
                  setWhatsAppModalData(file.raw);
                  setWhatsAppModalType('vehicle');
                }
              }}
            />
          </div>

          {/* Bottom guidance notes */}
          <div className="relative mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-3">
            <span className="font-mono text-amber-400 font-semibold">
              ✦ Clicking any bill or voucher sheet directly opens its live preview &amp; WhatsApp share.
            </span>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="text-white hover:text-amber-400 font-bold underline cursor-pointer"
            >
              Switch back to Full Table Audit View →
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* AUDIT TABLES VIEW */}
      {/* ===================================================================== */}
      {viewMode === 'table' && (
        <>
          {/* TAB 1: ALL ACTIVITIES UNIFIED TIMELINE */}
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
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <p>No activity records found for <strong className="text-slate-600">{getDateFilterLabel()}</strong>.</p>
                {dateFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setDateFilter('ALL')}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    View All Records
                  </button>
                )}
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
                      No customer bills found for <strong className="text-slate-600">{getDateFilterLabel()}</strong>.
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
                      No stock inward (Stock In) records found for <strong className="text-slate-600">{getDateFilterLabel()}</strong>.
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
                      No stock dispatch (Stock Out) records found for <strong className="text-slate-600">{getDateFilterLabel()}</strong>.
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
                      No fleet vehicles or delivery trips logged for <strong className="text-slate-600">{getDateFilterLabel()}</strong>.
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
        </>
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