import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  PlusCircle,
  HardDrive,
  Truck,
  TrendingUp,
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Layers,
  BarChart3,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { SHASHWAT_WOODS_LOGO, SHASHWAT_ASHAPURA_WOODS_LOGO } from '../constants/firmLogos';
import WhatsAppModal from '../components/WhatsAppModal';

// High-resolution photography tailored to each firm's trade:
// 1. Shashwat Woods -> Architectural Sawn Timber, Hardwood Logs & Teak Planks
const WOOD_BG_URL = "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=2400&q=85";
// 2. Shashwat Ashapura Woods -> Architectural Plywood Sheets, Stacked Baltic Birch & Honey Veneer Grains
const PLYWOOD_BG_URL = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85";

export default function Dashboard({
  firm,
  invoices = [],
  inventory = [],
  transactions = [],
  vehicles = [],
  onOpenInvoice,
  onOpenStockMovement,
  onPrintInvoice
}) {
  const [showDashboardWhatsApp, setShowDashboardWhatsApp] = useState(false);
  const [timeframe, setTimeframe] = useState('30d'); // 'today' | '7d' | '30d' | 'all'
  const [activeDock, setActiveDock] = useState('overview'); // 'overview' | 'revenue' | 'inventory' | 'fleet'
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isGlowHigh, setIsGlowHigh] = useState(true);

  // Check active firm division
  const isAshapura = useMemo(() => {
    return firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  }, [firm]);

  // Clean invoices without legacy demo items
  const cleanInvoices = useMemo(() => {
    return invoices.filter(inv =>
      inv &&
      inv.customer_name !== 'Patel Enterprises' &&
      inv.customer_name !== 'Patel Timber Mart' &&
      inv.invoice_number !== 'INV-2026-001' &&
      !['inv-1', 'inv-demo'].includes(inv.id)
    );
  }, [invoices]);

  // Financial aggregates
  const totalBilled = cleanInvoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
  const totalPending = cleanInvoices.reduce((acc, i) => acc + (Number(i.balance_due) || 0), 0);
  const totalReceived = Math.max(0, totalBilled - totalPending);
  const avgBill = cleanInvoices.length > 0 ? (totalBilled / cleanInvoices.length) : 0;

  // Inventory movements
  const totalStockInQty = transactions
    .filter(t => t.transaction_type === 'STOCK_IN')
    .reduce((acc, t) => acc + (Number(t.quantity) || 0), 0);

  const totalStockOutQty = transactions
    .filter(t => t.transaction_type === 'STOCK_OUT')
    .reduce((acc, t) => acc + (Number(t.quantity) || 0), 0);

  const lowStockItems = inventory.filter(i => Number(i.current_stock) <= Number(i.min_reorder_level));
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const onRouteVehicles = vehicles.filter(v => v.status === 'on_delivery');

  // Background asset based on firm
  const currentBgImage = isAshapura ? PLYWOOD_BG_URL : WOOD_BG_URL;
  return (
    <div className="relative w-full transition-all duration-700 isolate">
      {/* ===================================================================== */}
      {/* COMMAND CENTER HEADER & TIMEFRAME SELECTOR */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            Revenue, real-time stock movements, fleet dispatches, and operational health.
          </p>
        </div>

        {/* Timeframe Filter Pills (21st.dev Style) */}
        <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/15 backdrop-blur-md shadow-inner self-end sm:self-auto">
          {['today', '7d', '30d', 'all'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition capitalize cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tf === '30d' ? '30 days' : tf === '7d' ? '7 days' : tf === 'today' ? 'Today' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN COMMAND CENTER WITH LEFT FLOATING DOCK */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* Left Floating Glass Dock Rail */}
        <aside className="hidden lg:flex flex-col gap-2 p-2 rounded-2xl bg-white/10 dark:bg-black/35 backdrop-blur-2xl border border-white/15 shadow-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveDock('overview')}
            className={`p-3 rounded-xl transition cursor-pointer ${
              activeDock === 'overview'
                ? 'bg-white/25 text-white shadow-md border border-white/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Command Center Overview"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveDock('revenue')}
            className={`p-3 rounded-xl transition cursor-pointer ${
              activeDock === 'revenue'
                ? 'bg-amber-500/30 text-amber-300 shadow-md border border-amber-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Billing & Revenue Metrics"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveDock('inventory')}
            className={`p-3 rounded-xl transition cursor-pointer ${
              activeDock === 'inventory'
                ? 'bg-emerald-500/30 text-emerald-300 shadow-md border border-emerald-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Stock & Inventory Balance"
          >
            <Boxes className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveDock('fleet')}
            className={`p-3 rounded-xl transition cursor-pointer ${
              activeDock === 'fleet'
                ? 'bg-blue-500/30 text-blue-300 shadow-md border border-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Fleet Logistics & Delivery Trips"
          >
            <Truck className="w-4 h-4" />
          </button>
        </aside>

        {/* Center Big Glass Card Container */}
        <main className="flex-1 w-full rounded-3xl bg-slate-900/50 dark:bg-black/45 backdrop-blur-3xl border border-white/20 p-5 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
          {/* Header Row: Headline + Timeframe Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Command Center</span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {isAshapura 
                  ? 'Engineered plywoods, architectural veneers, revenue, and material dispatches.' 
                  : 'Sawn timber planks, teak round logs, commercial billings, and fleet deliveries.'}
              </p>
            </div>

            {/* Timeframe Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 self-start sm:self-auto text-xs font-semibold text-slate-300 shadow-inner">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 days' },
                { id: '30d', label: '30 days' },
                { id: 'all', label: 'All Time' },
              ].map(tf => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-3 py-1 rounded-full transition cursor-pointer ${
                    timeframe === tf.id
                      ? 'bg-white text-slate-900 font-bold shadow-md'
                      : 'hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* =================================================================== */}
          {/* 4. GLASS METRIC TILES GRID (MATCHING 21ST DEV GLASSY DASHBOARD) */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 mb-7">
            
            {/* HERO TOTAL REVENUE CARD (Col Span 7) */}
            <div className="xl:col-span-7 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 shadow-xl transition relative overflow-hidden flex flex-col justify-between">
              {/* Subtle top glare */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                  <span className="uppercase tracking-wider text-[11px] text-amber-200">Total Billed Revenue</span>
                  <span className="font-mono text-slate-400">INR (₹)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-md">
                    ₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    ↗ +8.3% <span className="font-normal text-emerald-300/80 ml-1 hidden sm:inline">vs prior period</span>
                  </span>
                </div>

                {/* Quick Action Pills */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={onOpenInvoice}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs transition shadow-lg cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Create Invoice ↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDashboardWhatsApp(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 cursor-pointer"
                  >
                    <span>View Report →</span>
                  </button>
                </div>
              </div>

              {/* Sub-Metric 3-way Split */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Cleared Cash</span>
                  <span className="text-sm font-black text-white font-mono">₹{totalReceived.toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-300 block uppercase font-semibold">Balance Due</span>
                  <span className="text-sm font-black text-rose-400 font-mono">₹{totalPending.toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Avg / Invoice</span>
                  <span className="text-sm font-black text-slate-200 font-mono">₹{avgBill.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* EMERALD CARD: STOCK INTAKE (Col Span 5 / 2 on mobile) */}
            <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card A: Stock In (Input) */}
              <div 
                onClick={() => onOpenStockMovement && onOpenStockMovement('STOCK_IN')}
                className="rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/60 backdrop-blur-2xl border border-emerald-400/30 p-5 shadow-xl transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                  <span>Stock In (Input)</span>
                  <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-3">
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    +{totalStockInQty} <span className="text-xs font-normal">pcs</span>
                  </p>
                  <span className="text-[10px] text-emerald-300/80 font-semibold block mt-0.5">
                    ↗ +9.6% vs prior period
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {transactions.filter(t => t.transaction_type === 'STOCK_IN').length} inward vouchers
                </span>
              </div>

              {/* Card B: Registered Fleet Logistics */}
              <div className="rounded-2xl bg-blue-950/40 hover:bg-blue-950/60 backdrop-blur-2xl border border-blue-400/30 p-5 shadow-xl transition flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-300 text-xs font-bold">
                  <span>Fleet Deliveries</span>
                  <Truck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="my-3">
                  <p className="text-2xl font-black text-blue-300 font-mono">
                    {vehicles.length} <span className="text-xs font-normal">fleet</span>
                  </p>
                  <span className="text-[10px] text-blue-300/80 font-semibold block mt-0.5">
                    {availableVehicles.length} Available • {onRouteVehicles.length} Dispatched
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Active transport network
                </span>
              </div>

              {/* Card C: Stock Out (Dispatched) */}
              <div 
                onClick={() => onOpenStockMovement && onOpenStockMovement('STOCK_OUT')}
                className="rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 backdrop-blur-2xl border border-rose-400/30 p-5 shadow-xl transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
                  <span>Stock Out (Output)</span>
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                </div>
                <div className="my-3">
                  <p className="text-2xl font-black text-rose-400 font-mono">
                    -{totalStockOutQty} <span className="text-xs font-normal">pcs</span>
                  </p>
                  <span className="text-[10px] text-rose-300/80 font-semibold block mt-0.5">
                    Dispatched deliveries
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {transactions.filter(t => t.transaction_type === 'STOCK_OUT').length} logged dispatches
                </span>
              </div>

              {/* Card D: Low Stock & Warehouse Alerts */}
              <div className="rounded-2xl bg-amber-950/40 hover:bg-amber-950/60 backdrop-blur-2xl border border-amber-400/30 p-5 shadow-xl transition flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                  <span>Stock Catalog</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-3">
                  <p className="text-2xl font-black text-amber-300 font-mono">
                    {inventory.length} <span className="text-xs font-normal">items</span>
                  </p>
                  <span className={`text-[10px] font-bold block mt-0.5 ${
                    lowStockItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {lowStockItems.length > 0 ? `⚠️ ${lowStockItems.length} at reorder level` : '✓ All stocks healthy'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isAshapura ? 'Plywood & Veneer Items' : 'Timber & Plank Species'}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 5. BOTTOM SPLIT PANELS (RECENT BILLS & LIVE STOCK MOVEMENTS) */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Panel 1: Recent Invoices Glass List */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white">Recent Customer Bills</h3>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Micro-PDF (&lt; 8 KB)
                </span>
              </div>

              <div className="divide-y divide-white/10 text-xs">
                {cleanInvoices.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No bills generated yet.</p>
                ) : (
                  cleanInvoices.slice(0, 5).map((inv) => (
                    <div 
                      key={inv.id || inv.invoice_number} 
                      onClick={() => onPrintInvoice && onPrintInvoice(inv)}
                      className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-xl transition cursor-pointer group"
                    >
                      <div>
                        <p className="font-bold text-white group-hover:text-amber-300 transition">{inv.customer_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {inv.invoice_number} • {inv.invoice_date || 'Recent'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-white font-mono">
                          ₹{Number(inv.total_amount || 0).toFixed(2)}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : inv.status === 'PARTIALLY_PAID'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                        }`}>
                          {inv.status || 'UNPAID'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Panel 2: Live Stock Movements & Dispatches */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black text-white">Live Stock In &amp; Out Movements</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Real-time Inventory
                </span>
              </div>

              <div className="divide-y divide-white/10 text-xs">
                {transactions.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No stock movements recorded yet.</p>
                ) : (
                  transactions.slice(0, 5).map((t) => {
                    const isIn = t.transaction_type === 'STOCK_IN';
                    return (
                      <div key={t.id} className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-xl transition">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-xl border ${
                            isIn ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' : 'bg-rose-500/20 text-rose-400 border-rose-400/30'
                          }`}>
                            {isIn ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-bold text-white">{t.item_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {t.party_name || (isIn ? 'Supplier' : 'Customer')} • Ref: {t.reference_number || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`font-mono font-black ${isIn ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isIn ? '+' : '-'}{t.quantity} {t.unit || 'pcs'}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Bal: {t.balance_after}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Global WhatsApp Modal for Executive Summary */}
      {showDashboardWhatsApp && (
        <WhatsAppModal
          isOpen={showDashboardWhatsApp}
          onClose={() => setShowDashboardWhatsApp(false)}
          type="dashboard"
          data={{ invoices: cleanInvoices, inventory, vehicles }}
          firm={firm}
        />
      )}
    </div>
  );
}
