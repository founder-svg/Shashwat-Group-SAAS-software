import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Search,
  CheckCircle2,
  Package,
  X,
  Eye,
  Download,
  Printer,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Send
} from 'lucide-react';
import { calculateCft, isPlywoodItem } from '../utils/woodCalculator';
import StockSheetModal from '../components/StockSheetModal';
import WhatsAppModal from '../components/WhatsAppModal';

export default function Inventory({ 
  firm,
  inventory = [], 
  transactions = [],
  onOpenMovement, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem 
}) {
  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockSheetItem, setStockSheetItem] = useState(null);
  const [isStockSheetOpen, setIsStockSheetOpen] = useState(false);
  const [whatsAppTarget, setWhatsAppTarget] = useState(null);
  
  // Edit Item State
  const [editingItem, setEditingItem] = useState(null);
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Raw Materials');
  const [editItemType, setEditItemType] = useState('raw_material');
  const [editUnit, setEditUnit] = useState('pcs');
  const [editCost, setEditCost] = useState('');
  const [editSelling, setEditSelling] = useState('');
  const [editStock, setEditStock] = useState('0');
  const [editMinReorder, setEditMinReorder] = useState('10');

  // New Item State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Raw Materials');
  const [itemType, setItemType] = useState('raw_material');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [initialStock, setInitialStock] = useState('0');
  const [minReorderLevel, setMinReorderLevel] = useState('10');

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditSku(item.sku || '');
    setEditName(item.name || '');
    setEditCategory(item.category || 'Raw Materials');
    setEditItemType(item.item_type || 'raw_material');
    setEditUnit(item.unit || 'pcs');
    setEditCost(item.cost_price !== undefined ? item.cost_price.toString() : '0');
    setEditSelling(item.selling_price !== undefined ? item.selling_price.toString() : '0');
    setEditStock(item.current_stock !== undefined ? item.current_stock.toString() : '0');
    setEditMinReorder(item.min_reorder_level !== undefined ? item.min_reorder_level.toString() : '10');
  };

  const categories = ['ALL', ...new Set(inventory.filter(i => isAshapura || !isPlywoodItem(i)).map(i => i.category || 'General Timber'))];

  const filteredInventory = inventory.filter((item) => {
    // If firm is Shashwat Woods, strictly show only wood items
    if (!isAshapura && isPlywoodItem(item)) {
      return false;
    }
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate Inward and Outward movements for an item from transactions
  const getItemMovements = (item) => {
    const itemTrans = (transactions || []).filter(t => 
      (t.item_id && t.item_id === item.id) || 
      (t.item_name && t.item_name.toLowerCase() === (item.name || '').toLowerCase()) ||
      (t.sku && t.sku === item.sku)
    );

    const totalIn = itemTrans
      .filter(t => t.transaction_type === 'STOCK_IN')
      .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

    const totalOut = itemTrans
      .filter(t => t.transaction_type === 'STOCK_OUT')
      .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

    return { totalIn, totalOut };
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!sku || !name) {
      alert('SKU and item name are required');
      return;
    }

    onAddItem({
      sku,
      name,
      category,
      item_type: itemType,
      unit,
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      current_stock: parseFloat(initialStock) || 0,
      initial_stock: parseFloat(initialStock) || 0,
      min_reorder_level: parseFloat(minReorderLevel) || 10
    });

    setShowAddModal(false);
    setSku('');
    setName('');
    setCostPrice('');
    setSellingPrice('');
    setInitialStock('0');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editSku || !editName) {
      alert('SKU and item name are required');
      return;
    }

    onUpdateItem(editingItem.id, {
      sku: editSku,
      name: editName,
      category: editCategory,
      item_type: editItemType,
      unit: editUnit,
      cost_price: parseFloat(editCost) || 0,
      selling_price: parseFloat(editSelling) || 0,
      current_stock: parseFloat(editStock) || 0,
      min_reorder_level: parseFloat(editMinReorder) || 10
    });

    setEditingItem(null);
  };

  const handleDeleteItemClick = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" (${item.sku}) from inventory?`)) {
      onDeleteItem(item.id);
    }
  };

  // WhatsApp Share for specific row
  const handleRowWhatsApp = (item, totalIn, totalOut) => {
    const companyTitle = firm?.name || (isAshapura ? 'SHASHWAT ASHAPURA WOODS' : 'SHASHWAT WOODS');
    const today = new Date().toISOString().split('T')[0];
    const msg = `📊 *STOCK MOVEMENT LEDGER REPORT*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📦 *Item:* ${item.name} (${item.sku})\n📂 *Category:* ${item.category || 'General'}\n📅 *Date:* ${today}\n\n📥 *Stock In (Total Inward):* +${totalIn} ${item.unit || 'pcs'}\n📤 *Stock Out (Dispatches):* -${totalOut} ${item.unit || 'pcs'}\n⚖️ *Available Balance:* ${item.current_stock} ${item.unit || 'pcs'}\n💰 *Selling Price:* ₹${Number(item.selling_price || 0).toFixed(2)}\n\n_Official Stock Sheet from ${companyTitle}._`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Management (Stock In & Out)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time warehouse balance tracking, Stock In (Input) receipts, and Stock Out (Output) delivery dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Master Warehouse Stock Sheet Button */}
          <button
            onClick={() => {
              setStockSheetItem(null);
              setIsStockSheetOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            title="Generate and view master stock in & out sheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            <span>Stock Sheet (PDF & Print)</span>
          </button>

          <button
            onClick={() => onOpenMovement('STOCK_IN')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Stock In (Input)</span>
          </button>
          
          <button
            onClick={() => onOpenMovement('STOCK_OUT')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Stock Out (Output)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${categoryFilter === cat
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">SKU Code</th>
                <th className="py-3 px-3">Product / Material</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center text-emerald-700 bg-emerald-50/50">Stock In (+)</th>
                <th className="py-3 px-3 text-center text-rose-700 bg-rose-50/50">Stock Out (-)</th>
                <th className="py-3 px-3 text-center">Available Stock</th>
                <th className="py-3 px-3 text-right">Cost Price (₹)</th>
                <th className="py-3 px-3 text-right">Selling Price (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    No inventory items found. Click "Add Item" to add products to the warehouse.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = Number(item.current_stock) <= Number(item.min_reorder_level);
                  const { totalIn, totalOut } = getItemMovements(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* SKU */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {item.sku}
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Type: {item.item_type?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {item.category}
                      </td>

                      {/* Stock In (+) */}
                      <td className="py-3 px-3 text-center bg-emerald-50/30 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200">
                          +{totalIn} <span className="ml-1 text-[10px] font-normal">{item.unit || 'pcs'}</span>
                        </span>
                      </td>

                      {/* Stock Out (-) */}
                      <td className="py-3 px-3 text-center bg-rose-50/30 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-200">
                          -{totalOut} <span className="ml-1 text-[10px] font-normal">{item.unit || 'pcs'}</span>
                        </span>
                      </td>

                      {/* Available Balance Stock */}
                      <td className="py-3 px-3 text-center font-bold text-sm whitespace-nowrap">
                        <span className={isLow ? 'text-amber-700 font-black' : 'text-slate-900'}>
                          {item.current_stock}
                        </span>{' '}
                        <span className="text-[11px] font-normal text-slate-500">{item.unit}</span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                        ₹{Number(item.cost_price).toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(item.selling_price).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Healthy
                          </span>
                        )}
                      </td>

                      {/* Actions: Preview, PDF, Print, WhatsApp, Edit, Delete */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. Preview Sheet */}
                          <button
                            onClick={() => {
                              setStockSheetItem(item);
                              setIsStockSheetOpen(true);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition border border-blue-200 shadow-2xs cursor-pointer"
                            title="Preview Stock Sheet"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. PDF Download */}
                          <button
                            onClick={() => {
                              setStockSheetItem(item);
                              setIsStockSheetOpen(true);
                            }}
                            className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition border border-indigo-200 shadow-2xs cursor-pointer"
                            title="Stock Sheet PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Print */}
                          <button
                            onClick={() => {
                              setStockSheetItem(item);
                              setIsStockSheetOpen(true);
                              setTimeout(() => window.print(), 350);
                            }}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition border border-slate-200 shadow-2xs cursor-pointer"
                            title="Print Stock Sheet"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. WhatsApp (PDF Sheet) */}
                          <button
                            onClick={() => setWhatsAppTarget({ type: 'inventory', data: { item, transactions } })}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition border border-emerald-200 shadow-2xs cursor-pointer"
                            title="Send Stock Sheet PDF to WhatsApp"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
                            </svg>
                          </button>

                          {/* 5. Edit */}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition border border-amber-200 shadow-2xs cursor-pointer"
                            title="Edit Item Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* 6. Delete */}
                          <button
                            onClick={() => handleDeleteItemClick(item)}
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition border border-rose-200 shadow-2xs cursor-pointer"
                            title="Delete Item"
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

      {/* ------------------------------------------------------------- */}
      {/* 1. STOCK SHEET / LEDGER MODAL (Single Item or Master Warehouse) */}
      {/* ------------------------------------------------------------- */}
      <StockSheetModal
        isOpen={isStockSheetOpen}
        onClose={() => setIsStockSheetOpen(false)}
        item={stockSheetItem}
        inventory={inventory}
        transactions={transactions}
        firm={firm}
        onOpenWhatsAppModal={(payload) => setWhatsAppTarget(payload)}
      />

      {/* WHATSAPP PDF MODAL */}
      {whatsAppTarget && (
        <WhatsAppModal
          isOpen={Boolean(whatsAppTarget)}
          onClose={() => setWhatsAppTarget(null)}
          type={whatsAppTarget.type}
          data={whatsAppTarget.data}
          firm={firm}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. EDIT ITEM MODAL                                            */}
      {/* ------------------------------------------------------------- */}
      {editingItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" /> Edit Inventory Item
              </h3>
              {/* HIGH-VISIBILITY RED CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer ring-1 ring-red-400"
                title="Close Edit Modal"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Type</label>
                  <select
                    value={editItemType}
                    onChange={(e) => setEditItemType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="finished_good">Finished Good</option>
                    <option value="consumable">Consumable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="CFT">Cubic Feet (CFT)</option>
                    <option value="sq.ft">Square Feet (sq.ft)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="meter">Meters (meter)</option>
                    <option value="box">Boxes (box)</option>
                    <option value="liter">Liters (liter)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={editSelling}
                    onChange={(e) => setEditSelling(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available In-Stock</label>
                  <input
                    type="number"
                    step="any"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Low Reorder Alert Level</label>
                  <input
                    type="number"
                    step="any"
                    value={editMinReorder}
                    onChange={(e) => setEditMinReorder(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. ADD NEW ITEM MODAL                                         */}
      {/* ------------------------------------------------------------- */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-600" /> Add New Inventory Item
              </h3>
              {/* HIGH-VISIBILITY RED CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition ring-1 ring-red-400 cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FG-PANEL-02"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Electrical & Control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Control Switchgear 400V"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Type</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="finished_good">Finished Good</option>
                    <option value="consumable">Consumable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="CFT">Cubic Feet (CFT)</option>
                    <option value="sq.ft">Square Feet (sq.ft)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="meter">Meters (meter)</option>
                    <option value="box">Boxes (box)</option>
                    <option value="liter">Liters (liter)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    step="any"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Low Reorder Alert Level</label>
                  <input
                    type="number"
                    step="any"
                    value={minReorderLevel}
                    onChange={(e) => setMinReorderLevel(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Item to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
