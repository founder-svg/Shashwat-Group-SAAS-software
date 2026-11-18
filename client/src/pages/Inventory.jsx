import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Search,
  CheckCircle2,
  Package
} from 'lucide-react';
import { calculateCft, isPlywoodItem } from '../utils/woodCalculator';

export default function Inventory({ 
  firm,
  inventory = [], 
  onOpenMovement, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem 
}) {
  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

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
    setEditName(item.name || '');
    setEditSku(item.sku || '');
    setEditCategory(item.category || 'General');
    setEditStock(item.current_stock !== undefined ? item.current_stock.toString() : '0');
    setEditMinReorder(item.min_reorder_level !== undefined ? item.min_reorder_level.toString() : '10');
    setEditUnit(item.unit || 'CFT');
    setEditCost(item.cost_price !== undefined ? item.cost_price.toString() : '0');
    setEditSelling(item.selling_price !== undefined ? item.selling_price.toString() : '0');
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
          <button
            onClick={() => onOpenMovement('STOCK_IN')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Stock In (Input)</span>
          </button>
          <button
            onClick={() => onOpenMovement('STOCK_OUT')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Stock Out (Output)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
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
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${categoryFilter === cat
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
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Product / Material</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price (₹)</th>
                <th className="py-3 px-4 text-right">Selling Price (₹)</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = Number(item.current_stock) <= Number(item.min_reorder_level);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Type: {item.item_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        ₹{Number(item.cost_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{Number(item.selling_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-sm">
                        <span className={isLow ? 'text-amber-700 font-black' : 'text-slate-800'}>
                          {item.current_stock}
                        </span>{' '}
                        <span className="text-[11px] font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Low Stock (Reorder: {item.min_reorder_level})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" /> Add New Inventory Item
            </h3>

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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
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
