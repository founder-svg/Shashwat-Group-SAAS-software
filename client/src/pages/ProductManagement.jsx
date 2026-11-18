import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Tag, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Filter
} from 'lucide-react';

export default function ProductManagement({ inventory, onAddItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [itemType, setItemType] = useState('finished_good');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minReorderLevel, setMinReorderLevel] = useState('10');
  const [description, setDescription] = useState('');

  const filteredProducts = inventory.filter((item) => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.item_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!sku || !name) {
      alert('SKU and Product Name are required');
      return;
    }

    onAddItem({
      sku,
      name,
      description,
      category,
      item_type: itemType,
      unit,
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      current_stock: 0,
      initial_stock: 0,
      min_reorder_level: parseFloat(minReorderLevel) || 10
    });

    setShowAddModal(false);
    setSku('');
    setName('');
    setDescription('');
    setCostPrice('');
    setSellingPrice('');
  };

  return (
    <div className="space-y-5">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-100 text-brand-800">
              MODULE 2
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Product Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Catalog all finished products, assemblies, raw materials, SKUs, and margin pricing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total SKUs</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{inventory.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Finished Goods</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {inventory.filter(i => i.item_type === 'finished_good').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase">Raw Materials</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {inventory.filter(i => i.item_type === 'raw_material').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Consumables</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {inventory.filter(i => i.item_type === 'consumable').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, product name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'finished_good', label: 'Finished Goods' },
            { id: 'raw_material', label: 'Raw Materials' },
            { id: 'consumable', label: 'Consumables' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                typeFilter === t.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name & Specs</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Cost Price (₹)</th>
                <th className="py-3 px-4 text-right">Selling Price (₹)</th>
                <th className="py-3 px-4 text-center">Gross Margin</th>
                <th className="py-3 px-4 text-center">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cost = Number(p.cost_price || 0);
                  const selling = Number(p.selling_price || 0);
                  const marginPercent = selling > 0 ? (((selling - cost) / selling) * 100).toFixed(1) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        {p.description && (
                          <p className="text-[10px] text-slate-400 max-w-xs truncate">{p.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 text-[10px]">
                          {p.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600">
                        {p.item_type?.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        ₹{cost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ₹{selling.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          marginPercent > 30 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : marginPercent > 10 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {marginPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500 uppercase">
                        {p.unit}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" /> Add Product to Catalog (Module 2)
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FG-1002"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Industrial Automation"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Phase Servo Motor Drive 15kW"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Specifications / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Voltage, dimensions, batch specs or certifications"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classification Type</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="finished_good">Finished Good (Output)</option>
                    <option value="raw_material">Raw Material (Input)</option>
                    <option value="consumable">Consumable Component</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="meter">Meters (meter)</option>
                    <option value="box">Boxes (box)</option>
                    <option value="set">Sets (set)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Alert</label>
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
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
