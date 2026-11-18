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
  X,
  FileSpreadsheet,
  Grid3X3,
  Sparkles
} from 'lucide-react';
import { 
  calculateCft, 
  calculatePlywoodSqFt, 
  calculatePlywoodSheetPrice, 
  formatDimensions, 
  formatPlywoodDimensions,
  isPlywoodItem 
} from '../utils/woodCalculator';

export default function ProductManagement({ firm, inventory = [], onAddItem, onUpdateItem, onDeleteItem }) {
  // Determine if active firm is Shashwat Ashapura Woods (deals in Woods + Plywoods) or Shashwat Woods (strictly Woods)
  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  const firmName = isAshapura ? 'Shashwat Ashapura Woods' : 'Shashwat Woods';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // --------------------------------------------------------------------------
  // ADD FORM STATE
  // --------------------------------------------------------------------------
  // In Shashwat Woods: productNature is always 'wood'
  // In Shashwat Ashapura Woods: user can choose between 'plywood' and 'wood'
  const [productNature, setProductNature] = useState(isAshapura ? 'plywood' : 'wood');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(isAshapura ? 'Marine Plywood (BWP - 710)' : 'Teak Wood');
  const [itemType, setItemType] = useState('finished_good');
  const [unit, setUnit] = useState(isAshapura ? 'Sheet' : 'CFT');

  // Wood dimensions (Length in ft, Width in inches, Thickness in inches)
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [cft, setCft] = useState('');
  const [isManualCft, setIsManualCft] = useState(false);

  // Plywood dimensions (Length in ft, Width in ft, Thickness in mm)
  const [plywoodPreset, setPlywoodPreset] = useState('8x4');
  const [plyLength, setPlyLength] = useState('8');
  const [plyWidth, setPlyWidth] = useState('4');
  const [plyThickness, setPlyThickness] = useState('18');
  const [plySqFt, setPlySqFt] = useState('32');
  const [ratePerSqFt, setRatePerSqFt] = useState('');
  const [coreType, setCoreType] = useState('Gurjan Core');

  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minReorderLevel, setMinReorderLevel] = useState('10');

  // --------------------------------------------------------------------------
  // EDIT FORM STATE
  // --------------------------------------------------------------------------
  const [editProductNature, setEditProductNature] = useState('wood');
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

  const [editPlyLength, setEditPlyLength] = useState('8');
  const [editPlyWidth, setEditPlyWidth] = useState('4');
  const [editPlyThickness, setEditPlyThickness] = useState('18');
  const [editPlySqFt, setEditPlySqFt] = useState('32');
  const [editRatePerSqFt, setEditRatePerSqFt] = useState('');
  const [editCoreType, setEditCoreType] = useState('');

  const [editCostPrice, setEditCostPrice] = useState('');
  const [editSellingPrice, setEditSellingPrice] = useState('');
  const [editMinReorderLevel, setEditMinReorderLevel] = useState('10');

  // Keep default product nature synced with firm selection
  useEffect(() => {
    if (!isAshapura) {
      setProductNature('wood');
      setCategory('Teak Wood');
      setUnit('CFT');
    } else {
      setProductNature('plywood');
      setCategory('Marine Plywood (BWP - 710)');
      setUnit('Sheet');
    }
  }, [isAshapura]);

  // When editingItem is selected, populate edit state
  useEffect(() => {
    if (editingItem) {
      const isPly = isPlywoodItem(editingItem);
      setEditProductNature(isPly ? 'plywood' : 'wood');
      setEditSku(editingItem.sku || '');
      setEditName(editingItem.name || '');
      setEditDescription(editingItem.description || '');
      setEditCategory(editingItem.category || (isPly ? 'Marine Plywood (BWP - 710)' : 'Teak Wood'));
      setEditItemType(editingItem.item_type || 'finished_good');
      setEditUnit(editingItem.unit || (isPly ? 'Sheet' : 'CFT'));

      if (isPly) {
        setEditPlyLength(editingItem.length !== undefined ? editingItem.length.toString() : '8');
        setEditPlyWidth(editingItem.width !== undefined ? editingItem.width.toString() : '4');
        setEditPlyThickness(editingItem.thickness !== undefined ? editingItem.thickness.toString() : '18');
        const sqft = calculatePlywoodSqFt(editingItem.length || 8, editingItem.width || 4);
        setEditPlySqFt(sqft.toString());
      } else {
        setEditLength(editingItem.length !== undefined ? editingItem.length.toString() : '');
        setEditWidth(editingItem.width !== undefined ? editingItem.width.toString() : '');
        setEditThickness(editingItem.thickness !== undefined ? editingItem.thickness.toString() : '');
        setEditCft(editingItem.cft !== undefined ? editingItem.cft.toString() : '');
      }

      setEditCostPrice(editingItem.cost_price !== undefined ? editingItem.cost_price.toString() : '');
      setEditSellingPrice(editingItem.selling_price !== undefined ? editingItem.selling_price.toString() : '');
      setEditMinReorderLevel(editingItem.min_reorder_level !== undefined ? editingItem.min_reorder_level.toString() : '10');
    }
  }, [editingItem]);

  // --------------------------------------------------------------------------
  // DYNAMIC CALCULATIONS: WOOD CFT
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (productNature === 'wood' && !isManualCft) {
      if (length && width && thickness) {
        const computed = calculateCft(length, width, thickness);
        setCft(computed > 0 ? computed.toString() : '');
      } else {
        setCft('');
      }
    }
  }, [length, width, thickness, isManualCft, productNature]);

  useEffect(() => {
    if (editingItem && editProductNature === 'wood' && editLength && editWidth && editThickness) {
      const computed = calculateCft(editLength, editWidth, editThickness);
      setEditCft(computed > 0 ? computed.toString() : '');
    }
  }, [editLength, editWidth, editThickness, editProductNature, editingItem]);

  // --------------------------------------------------------------------------
  // DYNAMIC CALCULATIONS: PLYWOOD SQFT & SHEET PRICE
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (productNature === 'plywood') {
      const sqft = calculatePlywoodSqFt(plyLength, plyWidth);
      setPlySqFt(sqft > 0 ? sqft.toString() : '');
      if (ratePerSqFt && sqft > 0) {
        const sheetPrice = calculatePlywoodSheetPrice(ratePerSqFt, sqft);
        setSellingPrice(sheetPrice.toString());
      }
    }
  }, [plyLength, plyWidth, ratePerSqFt, productNature]);

  useEffect(() => {
    if (editingItem && editProductNature === 'plywood') {
      const sqft = calculatePlywoodSqFt(editPlyLength, editPlyWidth);
      setEditPlySqFt(sqft > 0 ? sqft.toString() : '');
      if (editRatePerSqFt && sqft > 0) {
        const sheetPrice = calculatePlywoodSheetPrice(editRatePerSqFt, sqft);
        setEditSellingPrice(sheetPrice.toString());
      }
    }
  }, [editPlyLength, editPlyWidth, editRatePerSqFt, editProductNature, editingItem]);

  // Plywood Preset Selection Handler
  const handlePlywoodPresetSelect = (preset) => {
    setPlywoodPreset(preset);
    if (preset === '8x4') {
      setPlyLength('8');
      setPlyWidth('4');
    } else if (preset === '7x4') {
      setPlyLength('7');
      setPlyWidth('4');
    } else if (preset === '6x4') {
      setPlyLength('6');
      setPlyWidth('4');
    } else if (preset === '7x3') {
      setPlyLength('7');
      setPlyWidth('3');
    } else if (preset === '6x3') {
      setPlyLength('6');
      setPlyWidth('3');
    }
  };

  // --------------------------------------------------------------------------
  // FILTERING LOGIC
  // --------------------------------------------------------------------------
  const filteredProducts = inventory.filter((item) => {
    const isPly = isPlywoodItem(item);
    
    // For Shashwat Woods, only display wood items
    if (!isAshapura && isPly) {
      return false;
    }

    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'ALL') return true;
    if (filterTab === 'PLYWOOD') return isPly;
    if (filterTab === 'WOOD') return !isPly;
    if (filterTab === 'TEAK') return item.category?.toLowerCase().includes('teak');
    if (filterTab === 'PINE') return item.category?.toLowerCase().includes('pine');
    if (filterTab === 'BWP') return item.category?.toLowerCase().includes('bwp') || item.category?.toLowerCase().includes('marine');
    if (filterTab === 'MR') return item.category?.toLowerCase().includes('mr') || item.category?.toLowerCase().includes('commercial');
    if (filterTab === 'DOOR') return item.category?.toLowerCase().includes('door') || item.category?.toLowerCase().includes('blockboard');

    return true;
  });

  // --------------------------------------------------------------------------
  // SUBMIT HANDLERS
  // --------------------------------------------------------------------------
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product / Item Name is required');
      return;
    }

    const finalSku = sku.trim() || `${isAshapura && productNature === 'plywood' ? 'SAW-PLY' : isAshapura ? 'SAW-WD' : 'SW-WD'}-${Math.floor(1000 + Math.random() * 9000)}`;

    let finalLength = 0;
    let finalWidth = 0;
    let finalThickness = 0;
    let finalCft = 0;
    let finalUnit = unit;
    let finalCategory = category;

    if (productNature === 'plywood') {
      finalLength = parseFloat(plyLength) || 8;
      finalWidth = parseFloat(plyWidth) || 4;
      finalThickness = parseFloat(plyThickness) || 18;
      finalCft = parseFloat(plySqFt) || calculatePlywoodSqFt(finalLength, finalWidth); // Stores sq.ft in volume field
      finalUnit = unit || 'Sheet';
      finalCategory = category || 'Marine Plywood (BWP - 710)';
    } else {
      finalLength = parseFloat(length) || 0;
      finalWidth = parseFloat(width) || 0;
      finalThickness = parseFloat(thickness) || 0;
      finalCft = parseFloat(cft) || calculateCft(finalLength, finalWidth, finalThickness);
      finalUnit = unit || 'CFT';
      finalCategory = category || 'Teak Wood';
    }

    // Assemble rich specification note if coreType or details present
    let extraSpecs = '';
    if (productNature === 'plywood' && coreType) {
      extraSpecs = `[Plywood: ${coreType} | ${finalLength}ft × ${finalWidth}ft × ${finalThickness}mm | ${finalCft} Sq.Ft] `;
    }

    onAddItem({
      sku: finalSku,
      name: name.trim(),
      description: (extraSpecs + description).trim(),
      length: finalLength,
      width: finalWidth,
      thickness: finalThickness,
      cft: finalCft,
      category: finalCategory,
      item_type: itemType,
      unit: finalUnit,
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      current_stock: 0,
      initial_stock: 0,
      min_reorder_level: parseFloat(minReorderLevel) || 10
    });

    // Reset Form
    setShowAddModal(false);
    setSku('');
    setName('');
    setDescription('');
    setLength('');
    setWidth('');
    setThickness('');
    setCft('');
    setCostPrice('');
    setSellingPrice('');
    setRatePerSqFt('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Product / Item Name is required');
      return;
    }

    let finalLength = 0;
    let finalWidth = 0;
    let finalThickness = 0;
    let finalCft = 0;

    if (editProductNature === 'plywood') {
      finalLength = parseFloat(editPlyLength) || 8;
      finalWidth = parseFloat(editPlyWidth) || 4;
      finalThickness = parseFloat(editPlyThickness) || 18;
      finalCft = parseFloat(editPlySqFt) || calculatePlywoodSqFt(finalLength, finalWidth);
    } else {
      finalLength = parseFloat(editLength) || 0;
      finalWidth = parseFloat(editWidth) || 0;
      finalThickness = parseFloat(editThickness) || 0;
      finalCft = parseFloat(editCft) || calculateCft(finalLength, finalWidth, finalThickness);
    }

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

  // --------------------------------------------------------------------------
  // CATEGORIES LIST
  // --------------------------------------------------------------------------
  const woodCategories = [
    'Teak Wood (Sagwan)',
    'Pine Wood (Imported)',
    'Sal Wood',
    'Sheesham (Rosewood)',
    'Babool (Acacia)',
    'Hardwood Sawn Planks',
    'Softwood Timber Battens',
    'Round Timber Logs',
    'Wooden Beams & Scantlings',
    'General Timber'
  ];

  const plywoodCategories = [
    'Marine Plywood (BWP - 710)',
    'Boiling Water Resistant (BWR - 303)',
    'Commercial Plywood (MR - 303)',
    'Calibrated Plywood',
    'Flush Doors (Pine/Hardwood Core)',
    'Blockboards (Pine/Hardwood)',
    'Shuttering Film-Faced Plywood',
    'MDF / HDF Engineered Boards',
    'Architectural Laminates & Veneers'
  ];

  return (
    <div className="space-y-5">
      {/* Module Banner with Active Firm Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isAshapura ? 'bg-amber-800 text-amber-100' : 'bg-emerald-700 text-white'
            }`}>
              {firmName}
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              {isAshapura ? <Layers className="w-5 h-5 text-amber-600" /> : <Trees className="w-5 h-5 text-emerald-600" />}
              <span>{isAshapura ? 'Wood & Plywood Products' : 'Wood & Timber Management'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAshapura 
              ? 'Catalog both Specialized Timber / Sawn Woods (CFT) and Engineered Plywoods & Sheets (Sq.Ft) with Edit/Delete controls.'
              : 'Exclusive Timber & Sawn Wood catalog with Length (ft), Width (in), Thickness (in) and automatic CFT volume calculations.'
            }
          </p>
        </div>

        <button
          onClick={() => {
            setProductNature(isAshapura ? 'plywood' : 'wood');
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{isAshapura ? '+ Add Wood or Plywood Product' : '+ Add New Wood Product'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
          <p className="text-lg font-black text-slate-900 mt-0.5">{filteredProducts.length}</p>
        </div>
        
        {isAshapura ? (
          <>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">🪵 Plywoods &amp; Sheets</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">
                {inventory.filter(i => isPlywoodItem(i)).length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">🌲 Sawn Timber &amp; Woods</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">
                {inventory.filter(i => !isPlywoodItem(i)).length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">🚪 Doors &amp; Blockboards</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">
                {inventory.filter(i => i.category?.toLowerCase().includes('door') || i.category?.toLowerCase().includes('blockboard')).length}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sawn Finished Timber</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">
                {inventory.filter(i => i.item_type === 'finished_good' && !isPlywoodItem(i)).length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Raw Timber &amp; Logs</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">
                {inventory.filter(i => i.item_type === 'raw_material' && !isPlywoodItem(i)).length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Wood Planks &amp; Battens</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">
                {inventory.filter(i => i.name?.toLowerCase().includes('plank') || i.name?.toLowerCase().includes('batten')).length}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Search & Dynamic Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isAshapura ? "Search wood, plywood, sheets, SKU..." : "Search teak, pine, logs, planks, SKU..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Dynamic Filter Buttons based on Firm */}
        <div className="flex items-center space-x-1 text-xs w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filterTab === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Items
          </button>

          {isAshapura ? (
            <>
              <button
                onClick={() => setFilterTab('PLYWOOD')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  filterTab === 'PLYWOOD' ? 'bg-amber-800 text-amber-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🪵 Plywoods &amp; Sheets
              </button>
              <button
                onClick={() => setFilterTab('WOOD')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  filterTab === 'WOOD' ? 'bg-emerald-800 text-emerald-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🌲 Wood &amp; Timber
              </button>
              <button
                onClick={() => setFilterTab('BWP')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  filterTab === 'BWP' ? 'bg-blue-800 text-blue-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Marine BWP (710)
              </button>
              <button
                onClick={() => setFilterTab('DOOR')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  filterTab === 'DOOR' ? 'bg-indigo-800 text-indigo-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Doors &amp; Blockboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setFilterTab('TEAK')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  filterTab === 'TEAK' ? 'bg-amber-800 text-amber-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Teak Wood
              </button>
              <button
                onClick={() => setFilterTab('PINE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  filterTab === 'PINE' ? 'bg-emerald-800 text-emerald-100' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pine Wood
              </button>
            </>
          )}
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Item Name &amp; Description</th>
                {isAshapura && <th className="py-3 px-4 text-center">Type</th>}
                <th className="py-3 px-4 text-center">Dimensions</th>
                <th className="py-3 px-4 text-center">CFT / Sq.Ft</th>
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
                  <td colSpan={isAshapura ? 10 : 9} className="py-10 text-center text-slate-400">
                    No products found matching criteria. Click &quot;+ Add&quot; to register new catalog items.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isPly = isPlywoodItem(p);
                  const cost = Number(p.cost_price || 0);
                  const selling = Number(p.selling_price || 0);
                  const itemVolume = p.cft || (isPly ? calculatePlywoodSqFt(p.length, p.width) : calculateCft(p.length, p.width, p.thickness));

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
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

                      {isAshapura && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isPly ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              🪵 Plywood
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                              🌲 Wood
                            </span>
                          )}
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isPly ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                            <Ruler className="w-3 h-3 text-blue-500" />
                            {p.length || 8}ft × {p.width || 4}ft × {p.thickness || 18}mm
                          </span>
                        ) : (
                          p.length || p.width || p.thickness ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              <Ruler className="w-3 h-3 text-slate-400" />
                              {p.length || 0}ft × {p.width || 0}&quot; × {p.thickness || 0}&quot;
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {itemVolume > 0 ? (
                          isPly ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                              <Layers className="w-3 h-3 text-blue-500" />
                              {Number(itemVolume).toFixed(0)} Sq.Ft
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <Calculator className="w-3 h-3 text-emerald-500" />
                              {Number(itemVolume).toFixed(3)} CFT
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium text-[10px]">
                          {p.category || 'Timber'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-600 whitespace-nowrap">
                        ₹{cost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        ₹{selling.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600 uppercase text-[10px]">
                        {p.unit || (isPly ? 'Sheet' : 'CFT')}
                      </td>

                      {/* Prominent Action Pills for Edit & Delete */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingItem(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-xs transition"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
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

      {/* ==================================================================== */}
      {/* ADD PRODUCT MODAL: DYNAMIC FOR SHASHWAT WOODS & SHASHWAT ASHAPURA WOODS */}
      {/* ==================================================================== */}
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
                    Add Product ({firmName})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isAshapura 
                      ? 'Add Wood / Timber items or Plywood / Sheet materials' 
                      : 'Exclusive Wood & Timber specifications with auto CFT calculation'
                    }
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

            {/* In Shashwat Ashapura Woods: Toggle between Plywood and Wood */}
            {isAshapura && (
              <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200 flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setProductNature('plywood');
                    setCategory('Marine Plywood (BWP - 710)');
                    setUnit('Sheet');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    productNature === 'plywood'
                      ? 'bg-amber-800 text-amber-100 shadow-xs'
                      : 'text-amber-900 hover:bg-amber-100/70'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>🪵 Plywood &amp; Architectural Sheets</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProductNature('wood');
                    setCategory('Teak Wood');
                    setUnit('CFT');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    productNature === 'wood'
                      ? 'bg-emerald-800 text-emerald-100 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Trees className="w-4 h-4" />
                  <span>🌲 Wood &amp; Sawn Timber</span>
                </button>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    productNature === 'plywood'
                      ? "e.g. 18mm BWP Marine Plywood 8x4 / Pine Core Flush Door"
                      : "e.g. Teak Wood Sawn Planks / Pine Battens / Sal Log"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder={productNature === 'plywood' ? "e.g. SAW-PLY-8418" : "e.g. SW-TEAK-1001"}
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {productNature === 'plywood' ? (
                      plywoodCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    ) : (
                      woodCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    )}
                  </select>
                </div>
              </div>

              {/* ========================================================== */}
              {/* PLYWOOD SPECIFIC INPUTS (When Plywood is selected) */}
              {/* ========================================================== */}
              {productNature === 'plywood' && (
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Grid3X3 className="w-4 h-4 text-amber-700" />
                      Plywood Sheet Dimensions &amp; Area
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-800">
                      Area: {plySqFt || 32} Sq.Ft / Sheet
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                      Standard Sheet Size Presets:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: '8x4', label: '8 × 4 ft (32 sqft)' },
                        { id: '7x4', label: '7 × 4 ft (28 sqft)' },
                        { id: '6x4', label: '6 × 4 ft (24 sqft)' },
                        { id: '7x3', label: '7 × 3 ft (21 sqft)' },
                        { id: '6x3', label: '6 × 3 ft (18 sqft)' }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePlywoodPresetSelect(p.id)}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition border ${
                            plywoodPreset === p.id 
                              ? 'bg-amber-800 text-white border-amber-800' 
                              : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length, Width, Thickness mm */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Length (ft)</label>
                      <input
                        type="number"
                        step="any"
                        value={plyLength}
                        onChange={(e) => {
                          setPlywoodPreset('custom');
                          setPlyLength(e.target.value);
                        }}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Width (ft)</label>
                      <input
                        type="number"
                        step="any"
                        value={plyWidth}
                        onChange={(e) => {
                          setPlywoodPreset('custom');
                          setPlyWidth(e.target.value);
                        }}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Thickness (mm)</label>
                      <select
                        value={plyThickness}
                        onChange={(e) => setPlyThickness(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="4">4 mm</option>
                        <option value="6">6 mm</option>
                        <option value="9">9 mm</option>
                        <option value="12">12 mm</option>
                        <option value="16">16 mm</option>
                        <option value="18">18 mm</option>
                        <option value="19">19 mm</option>
                        <option value="25">25 mm</option>
                        <option value="30">30 mm (Door)</option>
                        <option value="32">32 mm (Door)</option>
                      </select>
                    </div>
                  </div>

                  {/* Core Composition */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Core Composition</label>
                      <select
                        value={coreType}
                        onChange={(e) => setCoreType(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Gurjan Core">100% Gurjan Core</option>
                        <option value="Alternate Core">Alternate Core (Hardwood/Poplar)</option>
                        <option value="Poplar Core">Poplar Core</option>
                        <option value="Eucalyptus Core">Eucalyptus Core</option>
                        <option value="Neem Core">Neem Wood Core</option>
                        <option value="Pine Wood Core">Solid Pine Core (Door)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Rate / Sq.Ft (₹)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 65"
                        value={ratePerSqFt}
                        onChange={(e) => setRatePerSqFt(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* WOOD / TIMBER SPECIFIC INPUTS (CFT CALCULATOR) */}
              {/* ========================================================== */}
              {productNature === 'wood' && (
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-emerald-700" />
                      Timber Sizing &amp; CFT Auto-Calculator
                    </span>
                    <span className="text-[10px] text-emerald-800 font-mono">Formula: (L × W × T) / 144</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Length (ft)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 10"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Width (inches)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 4"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Thickness (inches)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 3"
                        value={thickness}
                        onChange={(e) => setThickness(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  {/* Calculated CFT Field */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-emerald-900">Calculated Volume:</span>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        step="any"
                        placeholder="0.000"
                        value={cft}
                        onChange={(e) => {
                          setIsManualCft(true);
                          setCft(e.target.value);
                        }}
                        className="w-24 text-right text-xs px-2 py-1 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-emerald-900"
                      />
                      <span className="text-xs font-bold text-emerald-900 font-mono">CFT</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unit & Pricing */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {productNature === 'plywood' ? (
                      <>
                        <option value="Sheet">Sheet (Full)</option>
                        <option value="Sq.Ft">Sq.Ft (Square Feet)</option>
                        <option value="pcs">Pieces (pcs)</option>
                      </>
                    ) : (
                      <>
                        <option value="CFT">CFT (Cubic Feet)</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="cu.m">Cu.M (Cubic Meter)</option>
                        <option value="meter">Running Meters</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Description & Technical Specifications */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Description &amp; Technical Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Moisture grade, seasoning details, batch codes, architectural application..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Add Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EDIT PRODUCT MODAL (Supports Wood & Plywood) */}
      {/* ==================================================================== */}
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
                    Edit Product: {editingItem.sku}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update item names, wood/plywood specifications, and rates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
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
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
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
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Dimensions Section for Edit */}
              {editProductNature === 'plywood' ? (
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Grid3X3 className="w-3.5 h-3.5 text-amber-700" />
                    Plywood Sheet Dimensions
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Length (ft)</label>
                      <input
                        type="number"
                        step="any"
                        value={editPlyLength}
                        onChange={(e) => setEditPlyLength(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Width (ft)</label>
                      <input
                        type="number"
                        step="any"
                        value={editPlyWidth}
                        onChange={(e) => setEditPlyWidth(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Thickness (mm)</label>
                      <input
                        type="number"
                        step="any"
                        value={editPlyThickness}
                        onChange={(e) => setEditPlyThickness(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-emerald-700" />
                    Timber Dimensions &amp; CFT
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Length (ft)</label>
                      <input
                        type="number"
                        step="any"
                        value={editLength}
                        onChange={(e) => setEditLength(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Width (in)</label>
                      <input
                        type="number"
                        step="any"
                        value={editWidth}
                        onChange={(e) => setEditWidth(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Thickness (in)</label>
                      <input
                        type="number"
                        step="any"
                        value={editThickness}
                        onChange={(e) => setEditThickness(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Prices & Unit */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
