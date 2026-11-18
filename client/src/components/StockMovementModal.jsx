import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function StockMovementModal({ isOpen, onClose, onSave, inventoryItems, initialType = 'STOCK_IN' }) {
  const [type, setType] = useState(initialType);
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [partyName, setPartyName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const isStockIn = type === 'STOCK_IN';
  const selectedItem = inventoryItems.find(i => i.id === itemId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemId) {
      alert('Please select an inventory item');
      return;
    }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      alert('Please enter a valid positive quantity');
      return;
    }

    if (!isStockIn && selectedItem && Number(selectedItem.current_stock) < qty) {
      alert(`Insufficient stock! Available: ${selectedItem.current_stock} ${selectedItem.unit}`);
      return;
    }

    onSave({
      type,
      itemId,
      quantity: qty,
      unitCost: parseFloat(unitCost) || (selectedItem ? Number(selectedItem.cost_price) : 0),
      referenceNumber: referenceNumber || (isStockIn ? `PO-${Date.now().toString().slice(-4)}` : `DISP-${Date.now().toString().slice(-4)}`),
      partyName: partyName || (isStockIn ? 'Supplier' : 'Customer'),
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header with Type Switch */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${isStockIn ? 'bg-emerald-700' : 'bg-rose-700'}`}>
          <div className="flex items-center space-x-2">
            {isStockIn ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            <h2 className="text-base font-bold">
              {isStockIn ? 'Stock In (Inward Goods Input)' : 'Stock Out (Dispatch Output)'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Movement Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setType('STOCK_IN')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                isStockIn ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock IN (Purchase / Input)
            </button>
            <button
              type="button"
              onClick={() => setType('STOCK_OUT')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                !isStockIn ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock OUT (Sales / Dispatch)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Item / Material *</label>
            <select
              required
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
            >
              <option value="">-- Choose Stock Item --</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku}) - Current Stock: {item.current_stock} {item.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity {selectedItem ? `(${selectedItem.unit})` : ''} *
              </label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isStockIn ? 'Unit Cost Price (₹)' : 'Unit Selling Price (₹)'}
              </label>
              <input
                type="number"
                step="any"
                placeholder={selectedItem ? (isStockIn ? selectedItem.cost_price : selectedItem.selling_price) : '0.00'}
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isStockIn ? 'PO / Bill Reference No' : 'Delivery Challan / Slip No'}
              </label>
              <input
                type="text"
                placeholder={isStockIn ? 'PO-2026-001' : 'CH-2026-001'}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isStockIn ? 'Supplier / Vendor Name' : 'Customer / Destination'}
              </label>
              <input
                type="text"
                placeholder={isStockIn ? 'Supplier Name' : 'Customer Name'}
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              placeholder="Warehouse location, vehicle number, or condition notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Auto-generates secure audit voucher
            </span>
            <span className="font-semibold text-slate-800">
              {quantity && selectedItem
                ? isStockIn
                  ? `New Stock: ${Number(selectedItem.current_stock) + Number(quantity)} ${selectedItem.unit}`
                  : `Remaining: ${Number(selectedItem.current_stock) - Number(quantity)} ${selectedItem.unit}`
                : 'Real-time balance'}
            </span>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition ${
                isStockIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isStockIn ? 'Record Stock IN' : 'Record Stock OUT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
