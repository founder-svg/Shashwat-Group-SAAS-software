import React, { useState } from 'react';
import {
  IndianRupee,
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  PlusCircle,
  HardDrive
} from 'lucide-react';
import { moduleWhatsApp } from '../utils/moduleWhatsAppSharer';
import WhatsAppModal from '../components/WhatsAppModal';

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
  const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
  const totalPending = invoices.reduce((acc, i) => acc + (Number(i.balance_due) || 0), 0);
  const lowStockItems = inventory.filter(i => Number(i.current_stock) <= Number(i.min_reorder_level));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">Shashwat Commercial Suite</span>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1.5">
            Command Center Dashboard
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Centralized management system for billing, inventory balance, vehicle logistics, and archived records.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowDashboardWhatsApp(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            title="Send Daily Operations Summary PDF to WhatsApp"
          >
            <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
            </svg>
            <span>WhatsApp Summary</span>
          </button>
          <button
            onClick={onOpenInvoice}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Bill</span>
          </button>
          <button
            onClick={() => onOpenStockMovement('STOCK_IN')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Stock In (Input)</span>
          </button>
          <button
            onClick={() => onOpenStockMovement('STOCK_OUT')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Stock Out (Output)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoiced</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {invoices.length} Generated Invoices
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance Due</p>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">
            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">
            Awaiting Customer Clearance
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Catalog</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {inventory.length} Items
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Raw Materials & Finished Products
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
            <div className={`p-2 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${lowStockItems.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {lowStockItems.length} Items
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            At or below reorder threshold
          </span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-600" /> Recent Customer Bills
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Micro-PDF (&lt; 8 KB)</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{inv.customer_name}</p>
                  <p className="text-[11px] text-slate-500">{inv.invoice_number} • {inv.invoice_date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{Number(inv.total_amount).toFixed(2)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : inv.status === 'PARTIALLY_PAID'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                    }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" /> Recent Stock Movements (In/Out)
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold">Live Inventory</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {transactions.slice(0, 5).map((t) => {
              const isStockIn = t.transaction_type === 'STOCK_IN';
              return (
                <div key={t.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg ${isStockIn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {isStockIn ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{t.item_name}</p>
                      <p className="text-[11px] text-slate-500">{t.party_name} • Ref: {t.reference_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isStockIn ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isStockIn ? '+' : '-'}{t.quantity} {t.unit}
                    </p>
                    <span className="text-[10px] text-slate-400">Bal: {t.balance_after}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* WhatsApp Modal for Dashboard Executive PDF Report */}
      {showDashboardWhatsApp && (
        <WhatsAppModal
          isOpen={showDashboardWhatsApp}
          onClose={() => setShowDashboardWhatsApp(false)}
          type="dashboard"
          data={{ invoices, inventory, vehicles }}
          firm={firm}
        />
      )}
    </div>
  );
}
