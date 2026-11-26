import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  LogOut, 
  RefreshCw, 
  Shield, 
  RotateCcw,
  Search,
  Sun,
  Moon,
  Send,
  Bell,
  Sparkles,
  X,
  AlertTriangle,
  FileText,
  Package,
  Truck,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Phone,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { isConfigured } from '../config/supabaseClient';
import { SHASHWAT_WOODS_LOGO, SHASHWAT_ASHAPURA_WOODS_LOGO } from '../constants/firmLogos';

export default function Navbar({ 
  firm, 
  user, 
  onSwitchFirm, 
  onToggleDivision,
  onLogout, 
  onFactoryReset,
  onReloadDemoData,
  isGlowHigh = true,
  onToggleGlow,
  onOpenWhatsAppReport,
  invoices = [],
  inventory = [],
  vehicles = [],
  transactions = [],
  setActiveTab,
  onPrintInvoice
}) {
  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');

  // Search Palette State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // 'all' | 'attention' | 'invoices' | 'inventory' | 'vehicles'
  const modalInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'SG';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleResetClick = () => {
    if (confirm("FACTORY RESET WARNING:\n\nAre you sure you want to permanently clear all space and delete all data (inventory, invoices, vehicles, documents, and history)?\n\nThis will give you completely fresh, clean software to enter new records.")) {
      if (onFactoryReset) {
        onFactoryReset();
      }
    }
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Focus modal input when search palette opens
  useEffect(() => {
    if (isSearchOpen && modalInputRef.current) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Compute "Needs Immediate Attention" records
  const attentionItems = useMemo(() => {
    // 1. Unpaid or pending balance bills
    const pendingBills = invoices
      .filter((inv) => {
        const bal = Number(inv.balance_due || inv.pending_amount || 0);
        const status = (inv.payment_status || inv.status || '').toLowerCase();
        return bal > 0 || status === 'unpaid' || status === 'partial' || status === 'pending';
      })
      .map((inv) => ({
        type: 'bill_due',
        title: `Pending Dues: ${inv.customer_name || 'Customer'}`,
        subtitle: `Invoice #${inv.invoice_number} • ₹${Number(inv.balance_due || inv.pending_amount || 0).toLocaleString('en-IN')} pending balance`,
        badge: 'Payment Overdue',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        actionLabel: 'View Bill',
        data: inv,
        onClick: () => {
          setIsSearchOpen(false);
          if (onPrintInvoice) onPrintInvoice(inv);
          else if (setActiveTab) setActiveTab('billing');
        }
      }));

    // 2. Active fleet vehicles on route
    const transitVehicles = vehicles
      .filter((v) => (v.status || '').toLowerCase().includes('route') || (v.status || '').toLowerCase().includes('transit') || (v.status || '').toLowerCase().includes('busy'))
      .map((v) => ({
        type: 'vehicle_transit',
        title: `Active Delivery: ${v.vehicle_number || v.plate}`,
        subtitle: `${v.driver_name || 'Driver'} • Route: ${v.destination || 'Gandhinagar - Ahmedabad'} • Mo: ${v.driver_phone || '+91 98250 11234'}`,
        badge: 'Vehicle In Transit',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        actionLabel: 'Fleet Tracker',
        data: v,
        onClick: () => {
          setIsSearchOpen(false);
          if (setActiveTab) setActiveTab('vehicles');
        }
      }));

    // 3. Low stock inventory warnings
    const lowStock = inventory
      .filter((item) => {
        const qty = Number(item.quantity || item.stock || 0);
        return qty > 0 && qty < 25; // threshold
      })
      .map((item) => ({
        type: 'stock_low',
        title: `Low Stock Notice: ${item.name || item.product_name}`,
        subtitle: `Only ${item.quantity || item.stock} ${item.unit || 'units'} left in warehouse • Rate ₹${item.unit_price || item.rate}`,
        badge: 'Reorder Warning',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        actionLabel: 'Add Stock',
        data: item,
        onClick: () => {
          setIsSearchOpen(false);
          if (setActiveTab) setActiveTab('inventory');
        }
      }));

    return [...pendingBills, ...transitVehicles, ...lowStock];
  }, [invoices, vehicles, inventory, onPrintInvoice, setActiveTab]);

  // Compute live search filtered items
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // Matching Invoices
    const filteredInvoices = invoices.filter((inv) => {
      if (!q) return true;
      const num = (inv.invoice_number || '').toLowerCase();
      const cust = (inv.customer_name || '').toLowerCase();
      const veh = (inv.vehicle_number || '').toLowerCase();
      const total = String(inv.total_amount || '');
      return num.includes(q) || cust.includes(q) || veh.includes(q) || total.includes(q);
    });

    // Matching Inventory
    const filteredInventory = inventory.filter((item) => {
      if (!q) return true;
      const name = (item.name || item.product_name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const spec = (item.wood_type || item.thickness || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || spec.includes(q);
    });

    // Matching Vehicles
    const filteredVehicles = vehicles.filter((v) => {
      if (!q) return true;
      const num = (v.vehicle_number || v.plate || '').toLowerCase();
      const driver = (v.driver_name || '').toLowerCase();
      const type = (v.type || v.model || '').toLowerCase();
      return num.includes(q) || driver.includes(q) || type.includes(q);
    });

    return {
      invoices: filteredInvoices,
      inventory: filteredInventory,
      vehicles: filteredVehicles,
      totalCount: filteredInvoices.length + filteredInventory.length + filteredVehicles.length
    };
  }, [searchQuery, invoices, inventory, vehicles]);

  return (
    <header className="bg-slate-950/65 backdrop-blur-2xl border-b border-white/15 sticky top-0 z-30 px-4 sm:px-6 py-2.5 shadow-2xl text-white transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Top Left: Active Firm Division Identity & Quick Division Switcher */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Circular Logo Frame */}
          <div className="w-10 h-10 rounded-full bg-white/95 border-2 border-amber-400/60 p-1 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            <img
              src={firm?.logo || (isAshapura ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO)}
              alt={firm?.name || 'Firm Logo'}
              onError={(e) => {
                e.currentTarget.src = isAshapura ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO;
              }}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-none uppercase drop-shadow-sm">
                {firm?.shortName || (isAshapura ? 'ASHAPURA' : 'SHASHWAT')}
              </h1>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20 ${
                isAshapura ? 'bg-amber-500/25 text-amber-300' : 'bg-emerald-500/25 text-emerald-300'
              }`}>
                {isAshapura ? 'Plywood Division' : 'Timber Division'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={onToggleDivision}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold text-amber-300 hover:text-white transition shadow-sm cursor-pointer"
                title={`Switch to ${isAshapura ? 'Shashwat Woods (Timber)' : 'Shashwat Ashapura Woods (Plywood)'}`}
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Switch to {isAshapura ? 'Timber' : 'Plywood'}</span>
              </button>

              <button
                type="button"
                onClick={onSwitchFirm}
                className="text-[10px] font-medium text-slate-400 hover:text-slate-200 underline transition cursor-pointer"
                title="All divisions portal"
              >
                All Divisions
              </button>
            </div>
          </div>
        </div>

        {/* Center: Glowing Chromatic AI Search / Prompt Pill (21st.dev Command Center Style) */}
        <div className="w-full md:w-auto flex-1 max-w-md mx-auto">
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="relative flex items-center rounded-full bg-black/40 hover:bg-black/60 border border-white/25 hover:border-amber-400/60 px-3.5 py-1.5 backdrop-blur-md shadow-inner transition duration-200 group cursor-pointer focus-within:ring-2 focus-within:ring-amber-400/50"
          >
            {/* Chromatic Iridescent Orb */}
            <div className="relative flex items-center justify-center mr-2.5 shrink-0">
              <span className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 blur-[3px] opacity-80 animate-pulse" />
              <span className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 via-rose-400 to-amber-200 shadow-sm" />
            </div>

            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder="Show me what needs attention in billing, stock & dispatches..."
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none font-medium truncate cursor-pointer select-none"
            />

            <div className="hidden sm:flex items-center gap-1.5 ml-2 mr-1">
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-400">Ctrl+K</kbd>
            </div>

            {/* Clickable Search Icon Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
              className="p-1 -mr-1 rounded-full text-slate-300 group-hover:text-amber-400 hover:bg-white/15 transition cursor-pointer"
              title="Search and Attention Center"
            >
              <Search className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Top Right: Ambient Lighting, WhatsApp Summary & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 self-end md:self-auto">
          {/* Ambient Lighting Toggle */}
          {onToggleGlow && (
            <button
              type="button"
              onClick={onToggleGlow}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-amber-300 transition cursor-pointer"
              title="Toggle Ambient Glass Lighting"
            >
              {isGlowHigh ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          )}

          {/* WhatsApp Executive Summary Report */}
          {onOpenWhatsAppReport && (
            <button
              type="button"
              onClick={onOpenWhatsAppReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500/90 text-white border border-emerald-400/30 text-xs font-bold transition shadow-md cursor-pointer backdrop-blur-md"
              title="Send Executive PDF Report to WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Active Logged-in User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/15">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shrink-0 ring-1 ring-white/30">
              {getInitials(user?.name || user?.firstName || 'SG')}
            </div>

            <div className="hidden lg:block text-left leading-tight">
              <span className="block font-bold text-white text-xs tracking-tight truncate max-w-[120px]">
                {user?.name || `${user?.firstName || 'Authorized'} ${user?.lastName || 'User'}`}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                {user?.role || 'Administrator'}
              </span>
            </div>

            {/* Reload Demo Data Button */}
            {onReloadDemoData && (
              <button
                onClick={onReloadDemoData}
                type="button"
                className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                title="Reload Rich Demo Data (Timber, Plywoods, Bills, Fleet)"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="hidden lg:inline">Demo Data</span>
              </button>
            )}

            {/* Factory Reset Button */}
            <button
              onClick={handleResetClick}
              type="button"
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
              title="Factory Reset (Wipe All Records to Zero Before Client Delivery)"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden lg:inline">Factory Reset</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* UNIVERSAL SMART SEARCH & NEEDS ATTENTION COMMAND MODAL PALETTE        */}
      {/* ===================================================================== */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-slate-900/95 border border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[82vh]"
          >
            {/* Modal Search Header Input */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center gap-3">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 blur-[4px] opacity-80 animate-pulse" />
                <span className="relative w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 via-rose-400 to-amber-200 shadow-md" />
              </div>

              <input
                ref={modalInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bills, customer name, vehicle #, wood type, plywood grade, or dues..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none font-medium"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                title="Close (Esc)"
              >
                <span>Esc</span>
              </button>
            </div>

            {/* Filter Pills Navigation */}
            <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSearchFilter('all')}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  searchFilter === 'all' 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Scope</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchFilter('attention')}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  searchFilter === 'attention' 
                    ? 'bg-rose-500 text-white font-bold shadow-md' 
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Needs Attention ({attentionItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchFilter('invoices')}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  searchFilter === 'invoices' 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices ({searchResults.invoices.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchFilter('inventory')}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  searchFilter === 'inventory' 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products & Stock ({searchResults.inventory.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchFilter('vehicles')}
                className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  searchFilter === 'vehicles' 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Fleet Vehicles ({searchResults.vehicles.length})</span>
              </button>
            </div>

            {/* Modal Body / Scrollable Results */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* SECTION 1: NEEDS ATTENTION (Prominently displayed when query is empty or attention tab is selected) */}
              {(searchFilter === 'all' || searchFilter === 'attention') && attentionItems.length > 0 && !searchQuery && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Immediate Attention Required ({attentionItems.length} items)</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">Bills, fleet in transit & stock alerts</span>
                  </div>

                  <div className="space-y-2.5">
                    {attentionItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={item.onClick}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-400/70 hover:bg-slate-800/50 transition cursor-pointer gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            <span className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{item.subtitle}</p>
                        </div>

                        <button
                          type="button"
                          className="self-end sm:self-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-xs font-bold transition border border-amber-400/30 cursor-pointer"
                        >
                          <span>{item.actionLabel}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: INVOICES & BILLS MATCHES */}
              {(searchFilter === 'all' || searchFilter === 'invoices') && searchResults.invoices.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Customer Invoices & Bills ({searchResults.invoices.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {searchResults.invoices.slice(0, 8).map((inv) => (
                      <div
                        key={inv.id || inv.invoice_number}
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (onPrintInvoice) onPrintInvoice(inv);
                          else if (setActiveTab) setActiveTab('billing');
                        }}
                        className="group p-3 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-amber-400/70 hover:bg-slate-800/40 transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono font-bold text-amber-300">{inv.invoice_number}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              Number(inv.balance_due || 0) === 0 
                                ? 'bg-emerald-500/20 text-emerald-300' 
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {Number(inv.balance_due || 0) === 0 ? 'PAID' : `DUE ₹${Number(inv.balance_due).toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                            {inv.customer_name || 'Customer'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            ₹{Number(inv.total_amount || 0).toLocaleString('en-IN')} • {inv.vehicle_number || 'Ex-Factory'} • {inv.date || 'Today'}
                          </p>
                        </div>
                        <div className="mt-2.5 flex items-center justify-end text-[11px] font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                          <span>View & Print</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: PRODUCTS & INVENTORY MATCHES */}
              {(searchFilter === 'all' || searchFilter === 'inventory') && searchResults.inventory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Products & Warehouse Stock ({searchResults.inventory.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {searchResults.inventory.slice(0, 8).map((item) => (
                      <div
                        key={item.id || item.name}
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (setActiveTab) setActiveTab('inventory');
                        }}
                        className="group p-3 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-emerald-400/70 hover:bg-slate-800/40 transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                              {item.category || (isAshapura ? 'Plywood' : 'Timber')}
                            </span>
                            <span className="font-mono text-xs text-white font-bold">
                              ₹{Number(item.unit_price || item.rate || 0).toLocaleString('en-IN')}/{item.unit || 'pc'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition truncate">
                            {item.name || item.product_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Stock Available: <span className="font-bold text-slate-200">{item.quantity || item.stock} {item.unit || 'units'}</span>
                          </p>
                        </div>
                        <div className="mt-2.5 flex items-center justify-end text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                          <span>Inventory Details</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: FLEET VEHICLES MATCHES */}
              {(searchFilter === 'all' || searchFilter === 'vehicles') && searchResults.vehicles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Fleet Transport & Drivers ({searchResults.vehicles.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {searchResults.vehicles.slice(0, 6).map((v) => (
                      <div
                        key={v.id || v.vehicle_number}
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (setActiveTab) setActiveTab('vehicles');
                        }}
                        className="group p-3 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-blue-400/70 hover:bg-slate-800/40 transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono font-bold text-amber-300">{v.vehicle_number || v.plate}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              (v.status || '').toLowerCase().includes('route') 
                                ? 'bg-amber-500/20 text-amber-300' 
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {v.status || 'Available'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-white group-hover:text-blue-300 transition truncate">
                            {v.type || v.model || 'Heavy Haulage Truck'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Driver: <span className="text-slate-200 font-semibold">{v.driver_name || 'Driver'}</span> • Mo: {v.driver_phone || '+91 98250 11234'}
                          </p>
                        </div>
                        <div className="mt-2.5 flex items-center justify-end text-[11px] font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                          <span>Fleet Module</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {searchQuery && searchResults.totalCount === 0 && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No records found for "{searchQuery}"</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Try searching by customer name (e.g. Ambica), wood type (e.g. Teak), vehicle number (e.g. GJ-18), or invoice #.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Quick Shortcuts */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Esc</kbd> Close
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Enter</kbd> Select
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-semibold">{firm?.name || 'Shashwat Group'}</span>
                <span>• Live Database</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
