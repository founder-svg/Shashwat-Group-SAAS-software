import React, { useEffect, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ArrowDownRight, 
  ArrowUpRight, 
  Boxes, 
  CheckCircle2, 
  FileSpreadsheet, 
  Calendar,
  Building2,
  TrendingUp,
  Package,
  Layers,
  Send
} from 'lucide-react';
import { clientMicroPdf } from '../utils/microPdfGenerator';

export default function StockSheetModal({ 
  isOpen, 
  onClose, 
  item = null, 
  inventory = [], 
  transactions = [], 
  firm,
  onOpenWhatsAppModal 
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  const companyTitle = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
  const currentDate = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  // Helper to get stats for a single item
  const getItemStats = (targetItem) => {
    const itemTrans = transactions.filter(t => 
      (t.item_id && t.item_id === targetItem.id) || 
      (t.item_name && t.item_name.toLowerCase() === (targetItem.name || '').toLowerCase()) ||
      (t.sku && t.sku === targetItem.sku)
    );

    const totalIn = itemTrans
      .filter(t => t.transaction_type === 'STOCK_IN')
      .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

    const totalOut = itemTrans
      .filter(t => t.transaction_type === 'STOCK_OUT')
      .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

    const currentStock = Number(targetItem.current_stock || 0);
    const initialStock = targetItem.initial_stock !== undefined 
      ? Number(targetItem.initial_stock) 
      : Math.max(0, currentStock + totalOut - totalIn);

    return {
      initialStock,
      totalIn,
      totalOut,
      currentStock,
      transactions: itemTrans
    };
  };

  // If single item selected
  const singleStats = item ? getItemStats(item) : null;

  // Master warehouse stats for all items
  const allItemStats = inventory.map(it => ({
    item: it,
    stats: getItemStats(it)
  }));

  const grandTotalIn = allItemStats.reduce((sum, entry) => sum + entry.stats.totalIn, 0);
  const grandTotalOut = allItemStats.reduce((sum, entry) => sum + entry.stats.totalOut, 0);
  const grandCurrentStock = allItemStats.reduce((sum, entry) => sum + entry.stats.currentStock, 0);

  // WhatsApp Dispatch
  const handleWhatsAppSend = () => {
    if (onOpenWhatsAppModal) {
      onOpenWhatsAppModal(item ? { type: 'inventory', data: { item, transactions } } : { type: 'inventory_master', data: { inventory, transactions } });
      onClose();
      return;
    }
    let msg = '';
    if (item && singleStats) {
      msg = `📊 *STOCK MOVEMENT LEDGER SHEET*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📦 *Item:* ${item.name} (${item.sku})\n📂 *Category:* ${item.category || 'General'}\n📅 *Date:* ${currentDate}\n\n📥 *Total Stock In:* +${singleStats.totalIn} ${item.unit || 'pcs'}\n📤 *Total Stock Out:* -${singleStats.totalOut} ${item.unit || 'pcs'}\n⚖️ *Available Balance:* ${singleStats.currentStock} ${item.unit || 'pcs'}\n\n_Official Warehouse Stock Report from ${companyTitle}._`;
    } else {
      msg = `📊 *WAREHOUSE INVENTORY BALANCE SHEET*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📅 *Date:* ${currentDate}\n📦 *Total Products:* ${inventory.length}\n📥 *Grand Stock In:* +${grandTotalIn}\n📤 *Grand Stock Out:* -${grandTotalOut}\n⚖️ *Net In-Stock:* ${grandCurrentStock}\n\n_Official Warehouse Inventory Master Report from ${companyTitle}._`;
    }
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleDownloadPdf = () => {
    // Generate vector PDF directly with microPdf
    clientMicroPdf.downloadStockPdf({ item, transactions, inventory, firm });
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-start p-2 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-2 sm:my-6 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* STICKY TOP CONTROL BAR */}
        <div className="sticky top-0 z-40 bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-2.5 no-print">
          <div className="flex items-center space-x-2">
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{item ? 'Item Stock Movement Sheet' : 'Warehouse Master Stock Sheet'}</span>
            </span>
            {item && (
              <span className="text-xs text-amber-400 font-mono font-bold">
                {item.sku}
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Print Sheet */}
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition border border-slate-700 shadow-sm"
              title="Print stock sheet on A4 sheet"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Sheet</span>
            </button>

            {/* 2. WhatsApp Send */}
            <button
              onClick={handleWhatsAppSend}
              type="button"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Send stock details to WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
              </svg>
              <span>WhatsApp</span>
            </button>

            {/* 3. PDF Download */}
            <button
              onClick={handleDownloadPdf}
              type="button"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Download Stock Sheet PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* HIGH-VISIBILITY RED CLOSE BUTTON */}
            <button 
              onClick={onClose} 
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition ml-1 cursor-pointer ring-2 ring-red-400/40"
              title="Close Preview (or press Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Printable Stock Sheet Content */}
        <div id="printable-stock-sheet" className="p-6 sm:p-8 text-slate-900 text-xs bg-white">
          {/* Top Auspicious & Firm Info */}
          <div className="text-center mb-1">
            <p className="text-xs font-bold text-slate-700 tracking-wider font-serif">
              ॥ श्री गणेशाय नमः ॥
            </p>
          </div>

          {/* Firm Title Header */}
          <div className="border-2 border-slate-900 bg-slate-50 p-4 rounded-t-lg text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-wide">
              {companyTitle}
            </h2>
            <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
              PLOT NO-163-164, SHOP 1-3, SN-138 NR. VENUS SOCIETY, ANTARJAL, GANDHIDHAM KUTCH GUJARAT-370205
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-1 text-[11px] font-mono font-bold text-slate-800">
              <span>DATE: {currentDate}</span>
              <span>REPORT: {item ? `MATERIAL STOCK LEDGER (${item.sku})` : 'WAREHOUSE INVENTORY MASTER SHEET'}</span>
              <span>STATUS: REAL-TIME AUDIT</span>
            </div>
          </div>

          {/* SINGLE ITEM VIEW */}
          {item && singleStats && (
            <div className="border-x-2 border-b-2 border-slate-900">
              {/* Product Info Bar */}
              <div className="p-4 bg-slate-100/70 border-b border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Product / Material:</span>
                  <span className="font-black text-slate-900 text-sm">{item.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">SKU Code:</span>
                  <span className="font-mono font-bold text-slate-800">{item.sku}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Category:</span>
                  <span className="font-semibold text-slate-800">{item.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Pricing:</span>
                  <span className="font-mono text-slate-700">Cost: ₹{Number(item.cost_price || 0).toFixed(2)} | Sell: ₹{Number(item.selling_price || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* 4 Summary KPI Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-slate-900 text-center">
                <div className="p-3 border-r border-slate-300 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Opening Stock</span>
                  <span className="text-base font-black text-slate-800 font-mono">{singleStats.initialStock}</span>
                  <span className="text-[10px] text-slate-400 block">{item.unit || 'pcs'}</span>
                </div>
                <div className="p-3 border-r border-slate-300 bg-emerald-50/60">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block flex items-center justify-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-600" /> Total Stock In
                  </span>
                  <span className="text-base font-black text-emerald-700 font-mono">+{singleStats.totalIn}</span>
                  <span className="text-[10px] text-emerald-600 block">Inward Receipts</span>
                </div>
                <div className="p-3 border-r border-slate-300 bg-rose-50/60">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-rose-600" /> Total Stock Out
                  </span>
                  <span className="text-base font-black text-rose-700 font-mono">-{singleStats.totalOut}</span>
                  <span className="text-[10px] text-rose-600 block">Dispatched</span>
                </div>
                <div className="p-3 bg-amber-50/70">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block">Available Balance</span>
                  <span className="text-base font-black text-amber-800 font-mono">{singleStats.currentStock}</span>
                  <span className="text-[10px] text-amber-700 block font-bold">{item.unit || 'pcs'} In Stock</span>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="p-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-brand-600" /> Material Inward &amp; Outward Movement Ledger
                </h4>
                
                <div className="overflow-x-auto border border-slate-300 rounded-lg">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-black text-[10px] uppercase">
                        <th className="py-2 px-2 text-center w-10">Sr.</th>
                        <th className="py-2 px-2.5">Date &amp; Time</th>
                        <th className="py-2 px-2 text-center">Movement</th>
                        <th className="py-2 px-2.5">Ref / Voucher</th>
                        <th className="py-2 px-3">Party / Supplier / Client</th>
                        <th className="py-2 px-2.5 text-right text-emerald-800">Stock In (+)</th>
                        <th className="py-2 px-2.5 text-right text-rose-800">Stock Out (-)</th>
                        <th className="py-2 px-3 text-right font-black">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {singleStats.transactions.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-6 text-center text-slate-400">
                            No movement records registered yet. Available balance: {singleStats.currentStock} {item.unit || 'pcs'}.
                          </td>
                        </tr>
                      ) : (
                        singleStats.transactions.map((t, idx) => {
                          const isIn = t.transaction_type === 'STOCK_IN';
                          const qty = Number(t.quantity || 0);
                          return (
                            <tr key={t.id || idx} className="hover:bg-slate-50/70">
                              <td className="py-2 px-2 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-2.5 font-mono text-[10px] text-slate-700">{t.created_at || t.transaction_date || currentDate}</td>
                              <td className="py-2 px-2 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${
                                  isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {isIn ? 'STOCK IN' : 'STOCK OUT'}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 font-mono font-bold text-slate-800">{t.reference_number || '-'}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{t.party_name || '-'}</td>
                              <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-700">
                                {isIn ? `+${qty}` : '-'}
                              </td>
                              <td className="py-2 px-2.5 text-right font-mono font-bold text-rose-700">
                                {!isIn ? `-${qty}` : '-'}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                                {t.balance_after !== undefined ? t.balance_after : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FULL WAREHOUSE INVENTORY MASTER SHEET */}
          {!item && (
            <div className="border-x-2 border-b-2 border-slate-900">
              {/* Grand Summary KPI Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-slate-900 text-center">
                <div className="p-3 border-r border-slate-300 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Catalog Items</span>
                  <span className="text-base font-black text-slate-800 font-mono">{inventory.length}</span>
                  <span className="text-[10px] text-slate-400 block">Products</span>
                </div>
                <div className="p-3 border-r border-slate-300 bg-emerald-50/60">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block flex items-center justify-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-600" /> Grand Stock In
                  </span>
                  <span className="text-base font-black text-emerald-700 font-mono">+{grandTotalIn}</span>
                  <span className="text-[10px] text-emerald-600 block">Total Material Inward</span>
                </div>
                <div className="p-3 border-r border-slate-300 bg-rose-50/60">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-rose-600" /> Grand Stock Out
                  </span>
                  <span className="text-base font-black text-rose-700 font-mono">-{grandTotalOut}</span>
                  <span className="text-[10px] text-rose-600 block">Total Dispatches</span>
                </div>
                <div className="p-3 bg-amber-50/70">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block">Net Available Stock</span>
                  <span className="text-base font-black text-amber-800 font-mono">{grandCurrentStock}</span>
                  <span className="text-[10px] text-amber-700 block font-bold">Total In Warehouse</span>
                </div>
              </div>

              {/* Master Inventory Sheet Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-black text-[10px] uppercase">
                      <th className="py-2.5 px-2 text-center w-10">Sr.</th>
                      <th className="py-2.5 px-3">SKU Code</th>
                      <th className="py-2.5 px-3">Product / Material</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-2.5 text-center">Opening</th>
                      <th className="py-2.5 px-2.5 text-center text-emerald-800">Stock In (+)</th>
                      <th className="py-2.5 px-2.5 text-center text-rose-800">Stock Out (-)</th>
                      <th className="py-2.5 px-3 text-center font-black">Available Balance</th>
                      <th className="py-2.5 px-2 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-right">Selling Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {allItemStats.map((entry, idx) => {
                      const it = entry.item;
                      const s = entry.stats;
                      return (
                        <tr key={it.id || idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-2 text-center text-slate-500 font-semibold">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{it.sku}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {it.name}
                            {it.length && it.width && (
                              <span className="block text-[9px] text-slate-500 font-normal">
                                {it.length}L × {it.width}W × {it.thickness || 0}T
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{it.category || 'General'}</td>
                          <td className="py-2 px-2.5 text-center font-mono text-slate-600">{s.initialStock}</td>
                          <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-700">+{s.totalIn}</td>
                          <td className="py-2 px-2.5 text-center font-mono font-bold text-rose-700">-{s.totalOut}</td>
                          <td className="py-2 px-3 text-center font-mono font-black text-slate-950 bg-slate-50">
                            {s.currentStock}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-500 text-[10px]">{it.unit || 'pcs'}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                            ₹{Number(it.selling_price || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-900 text-xs text-slate-950">
                      <td colSpan="5" className="py-2.5 px-3 text-right uppercase">Master Warehouse Totals:</td>
                      <td className="py-2.5 px-2.5 text-center font-mono text-emerald-800">+{grandTotalIn}</td>
                      <td className="py-2.5 px-2.5 text-center font-mono text-rose-800">-{grandTotalOut}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-950">{grandCurrentStock}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Footer Signatures */}
          <div className="border-t border-slate-300 pt-4 mt-6 flex justify-between items-end text-[10px] text-slate-600">
            <div className="max-w-xs space-y-0.5">
              <p className="font-bold text-slate-800">Warehouse Verification Notice:</p>
              <p>Physical inventory must match real-time balance records.</p>
              <p>Generated via Shashwat Group Commercial SaaS Platform.</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-500 w-44 mb-1 ml-auto"></div>
              <p className="font-bold text-slate-900">Warehouse In-Charge / Auditor</p>
              <p className="text-[9px] font-semibold text-slate-700">For {companyTitle}</p>
            </div>
          </div>
        </div>

        {/* BOTTOM MODAL FOOTER BAR WITH EXTRA CLOSE BUTTON */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 no-print">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time Stock Sheet generated. Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Esc</kbd> anytime to exit.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer ring-2 ring-red-400/30"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Close</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
