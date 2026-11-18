import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Calculator, 
  Ruler, 
  Layers, 
  Tag, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Filter,
  Trees,
  Pencil,
  Trash2,
  X
} from 'lucide-react';
import { calculateCft, formatDimensions } from '../utils/woodCalculator';

export default function ProductManagement({ inventory = [], onAddItem, onUpdateItem, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State for Add
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Teak Wood');
  const [itemType, setItemType] = useState('finished_good');
  const [unit, setUnit] = useState('CFT');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [cft, setCft] = useState('');
  const [isManualCft, setIsManualCft] = useState(false);
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minReorderLevel, setMinReorderLevel] = useState('10');

  // Form State for Edit
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editItemType, setEditItemType] = useState('finished_good');
  const [editUnit, setEditUnit] = useState('CFT');
  const [editLength, setEditLength] = useState('');
  const [editWidth, setEditWidth] = useState('');
  const [editThickness, setEditThickness] = useState('');
  const [editCft, setEditCft] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editSellingPrice, setEditSellingPrice] = useState('');
  const [editMinReorderLevel, setEditMinReorderLevel] = useState('10');

  // Pre-fill Edit Modal when editingItem is selected
  useEffect(() => {
    if (editingItem) {
      setEditSku(editingItem.sku || '');
      setEditName(editingItem.name || '');
      setEditDescription(editingItem.description || '');
      setEditCategory(editingItem.category || 'Teak Wood');
      setEditItemType(editingItem.item_type || 'finished_good');
      setEditUnit(editingItem.unit || 'CFT');
      setEditLength(editingItem.length !== undefined ? editingItem.length.toString() : '');
      setEditWidth(editingItem.width !== undefined ? editingItem.width.toString() : '');
      setEditThickness(editingItem.thickness !== undefined ? editingItem.thickness.toString() : '');
      setEditCft(editingItem.cft !== undefined ? editingItem.cft.toString() : '');
      setEditCostPrice(editingItem.cost_price !== undefined ? editingItem.cost_price.toString() : '');
      setEditSellingPrice(editingItem.selling_price !== undefined ? editingItem.selling_price.toString() : '');
      setEditMinReorderLevel(editingItem.min_reorder_level !== undefined ? editingItem.min_reorder_level.toString() : '10');
    }
  }, [editingItem]);

  // Automatically calculate CFT when add modal dimensions change
  useEffect(() => {
    if (!isManualCft) {
      if (length && width && thickness) {
        const computed = calculateCft(length, width, thickness);
        setCft(computed > 0 ? computed.toString() : '');
      } else {
        setCft('');
      }
    }
  }, [length, width, thickness, isManualCft]);

  // Automatically calculate CFT when edit modal dimensions change
  useEffect(() => {
    if (editingItem && editLength && editWidth && editThickness) {
      const computed = calculateCft(editLength, editWidth, editThickness);
      setEditCft(computed > 0 ? computed.toString() : '');
    }
  }, [editLength, editWidth, editThickness, editingItem]);

  const filteredProducts = inventory.filter((item) => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.item_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      alert('Product / Item Name is required');
      return;
    }

    const finalSku = sku.trim() || `WD-${Date.now().toString().slice(-6)}`;
    const finalLength = parseFloat(length) || 0;
    const finalWidth = parseFloat(width) || 0;
    const finalThickness = parseFloat(thickness) || 0;
    const finalCft = parseFloat(cft) || calculateCft(finalLength, finalWidth, finalThickness);

    onAddItem({
      sku: finalSku,
      name: name.trim(),
      description: description.trim(),
      length: finalLength,
      width: finalWidth,
      thickness: finalThickness,
      cft: finalCft,
      category: category || 'General Timber',
      item_type: itemType,
      unit: unit || 'CFT',
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      current_stock: 0,
      initial_stock: 0,
      min_reorder_level: parseFloat(minReorderLevel) || 10
    });

    // Reset & close modal
    setShowAddModal(false);
    setSku('');
    setName('');
    setDescription('');
    setLength('');
    setWidth('');
    setThickness('');
    setCft('');
    setIsManualCft(false);
    setCostPrice('');
    setSellingPrice('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName) {
      alert('Product / Item Name is required');
      return;
    }

    const finalLength = parseFloat(editLength) || 0;
    const finalWidth = parseFloat(editWidth) || 0;
    const finalThickness = parseFloat(editThickness) || 0;
    const finalCft = parseFloat(editCft) || calculateCft(finalLength, finalWidth, finalThickness);

    if (onUpdateItem) {
      onUpdateItem(editingItem.id, {
        sku: editSku.trim() || editingItem.sku,
        name: editName.trim(),
        description: editDescription.trim(),
        length: finalLength,
        width: finalWidth,
        thickness: finalThickness,
        cft: finalCft,
        category: editCategory,
        item_type: editItemType,
        unit: editUnit,
        cost_price: parseFloat(editCostPrice) || 0,
        selling_price: parseFloat(editSellingPrice) || 0,
        min_reorder_level: parseFloat(editMinReorderLevel) || 10
      });
    }

    setEditingItem(null);
  };

  const handleDeleteClick = (item) => {
    if (confirm(`Are you sure you want to delete "${item.name}" (SKU: ${item.sku})? This action cannot be undone.`)) {
      if (onDeleteItem) {
        onDeleteItem(item.id);
      }
    }
  };

  const handleNameBlur = () => {
    if (!sku && name) {
      const prefix = category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'WD');
      const suffix = Math.floor(100 + Math.random() * 900);
      setSku(`${prefix}-${suffix}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
              MODULE 2
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <Trees className="w-5 h-5 text-emerald-600" />
              <span>Product &amp; Timber Management</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Catalog wood products, sawn timber, logs &amp; plywood with Length, Width, Thickness, auto CFT calculations, and Edit/Delete controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Wood Item / Product</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Wood SKUs</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{inventory.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sawn Finished Timber</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {inventory.filter(i => i.item_type === 'finished_good').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Raw Timber &amp; Logs</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {inventory.filter(i => i.item_type === 'raw_material').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Plywood / Consumables</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">
            {inventory.filter(i => i.item_type === 'consumable').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search timber item, dimensions, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Wood Items' },
            { id: 'finished_good', label: 'Finished Timber' },
            { id: 'raw_material', label: 'Raw Logs' },
            { id: 'consumable', label: 'Plywood & Other' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                typeFilter === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Master Table with Edit & Delete Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Item Name &amp; Description</th>
                <th className="py-3 px-4 text-center">Dimensions (L × W × T)</th>
                <th className="py-3 px-4 text-center">CFT / Piece</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price (₹)</th>
                <th className="py-3 px-4 text-right">Selling Price (₹)</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No wood products found matching criteria. Click "+ Add New Wood Item" to catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cost = Number(p.cost_price || 0);
                  const selling = Number(p.selling_price || 0);
                  const itemCft = p.cft || calculateCft(p.length, p.width, p.thickness);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                        {p.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {p.length || p.width || p.thickness ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <Ruler className="w-3 h-3 text-slate-400" />
                            {p.length || 0} ft × {p.width || 0}&quot; × {p.thickness || 0}&quot;
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {itemCft > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <Calculator className="w-3 h-3 text-emerald-500" />
                            {Number(itemCft).toFixed(3)} CFT
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium text-[10px]">
                          {p.category || 'General Timber'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        ₹{cost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        ₹{selling.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600 uppercase text-[10px]">
                        {p.unit || 'CFT'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => setEditingItem(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-xs transition"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 shadow-xs transition"
                            title="Delete Product"
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Add Item to Catalog (Module 2)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Wood &amp; Timber specifications with automatic CFT calculation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teak Wood Sawn Planks / Pine Battens / Sal Log"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameBlur}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SW-TEAK-1001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Wood Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Teak Wood">Teak Wood (Sagwan)</option>
                    <option value="Pine Wood">Pine Wood</option>
                    <option value="Sal Wood">Sal Wood</option>
                    <option value="Hardwood Logs">Hardwood Logs</option>
                    <option value="Sawn Timber">Sawn Timber</option>
                    <option value="Plywood & Panels">Plywood &amp; Panels</option>
                    <option value="Flush Doors">Flush Doors</option>
                    <option value="General Timber">General Timber</option>
                  </select>
                </div>
              </div>

              {/* WOOD DIMENSIONS & CFT PANEL */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-amber-700" />
                    Wood Dimensions &amp; CFT (Cubic Feet)
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono">
                    Formula: (L × W × T) ÷ 144
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Length (ft)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 10"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-center font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Width (in)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 4"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-center font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Thickness (in)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 2"
                      value={thickness}
                      onChange={(e) => setThickness(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-center font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1 flex items-center justify-between">
                      <span>CFT / Piece</span>
                      {isManualCft && <span className="text-[9px] text-emerald-600">(Manual)</span>}
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.000"
                      value={cft}
                      onChange={(e) => {
                        setCft(e.target.value);
                        setIsManualCft(true);
                      }}
                      className="w-full text-xs px-2.5 py-1.5 bg-emerald-50 border-2 border-emerald-500 rounded-lg text-center font-mono font-black text-emerald-900 focus:outline-none"
                    />
                  </div>
                </div>

                {length && width && thickness && (
                  <p className="text-[11px] text-amber-900 font-mono">
                    💡 1 piece ({length}ft × {width}&quot; × {thickness}&quot;) = <strong>{cft || 0} CFT</strong>
                  </p>
                )}
              </div>

              {/* Item Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Grade A seasoned, kiln-dried, termite-resistant, smooth planed finish"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              {/* Type and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classification Type</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="finished_good">Finished Sawn Timber (Output)</option>
                    <option value="raw_material">Raw Uncut Logs (Input)</option>
                    <option value="consumable">Plywood / Consumable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="CFT">CFT (Cubic Feet - Standard)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="sqft">Square Feet (sqft)</option>
                    <option value="meter">Running Meters (meter)</option>
                    <option value="bundle">Bundles (bundle)</option>
                  </select>
                </div>
              </div>

              {/* Prices & Alert */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹/{unit})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹/{unit})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Alert ({unit})</label>
                  <input
                    type="number"
                    step="any"
                    value={minReorderLevel}
                    onChange={(e) => setMinReorderLevel(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
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
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl shadow-md transition"
                >
                  Save &amp; Catalog Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Edit Wood Product / Item
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update timber specifications, dimensions, and pricing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Teak Wood">Teak Wood (Sagwan)</option>
                    <option value="Pine Wood">Pine Wood</option>
                    <option value="Sal Wood">Sal Wood</option>
                    <option value="Hardwood Logs">Hardwood Logs</option>
                    <option value="Sawn Timber">Sawn Timber</option>
                    <option value="Plywood & Panels">Plywood &amp; Panels</option>
                    <option value="Flush Doors">Flush Doors</option>
                    <option value="General Timber">General Timber</option>
                  </select>
                </div>
              </div>

              {/* WOOD DIMENSIONS & CFT PANEL */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-amber-700" />
                    Wood Dimensions &amp; CFT
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono">
                    (L × W × T) ÷ 144
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Length (ft)</label>
                    <input
                      type="number"
                      step="any"
                      value={editLength}
                      onChange={(e) => setEditLength(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Width (in)</label>
                    <input
                      type="number"
                      step="any"
                      value={editWidth}
                      onChange={(e) => setEditWidth(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">Thickness (in)</label>
                    <input
                      type="number"
                      step="any"
                      value={editThickness}
                      onChange={(e) => setEditThickness(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">CFT / Piece</label>
                    <input
                      type="number"
                      step="any"
                      value={editCft}
                      onChange={(e) => setEditCft(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-emerald-50 border-2 border-emerald-500 rounded-lg text-center font-mono font-black text-emerald-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description</label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classification Type</label>
                  <select
                    value={editItemType}
                    onChange={(e) => setEditItemType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="finished_good">Finished Sawn Timber (Output)</option>
                    <option value="raw_material">Raw Uncut Logs (Input)</option>
                    <option value="consumable">Plywood / Consumable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Unit</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="CFT">CFT (Cubic Feet)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="sqft">Square Feet (sqft)</option>
                    <option value="meter">Running Meters (meter)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Alert</label>
                  <input
                    type="number"
                    step="any"
                    value={editMinReorderLevel}
                    onChange={(e) => setEditMinReorderLevel(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
