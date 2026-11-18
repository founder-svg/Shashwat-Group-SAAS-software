import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Receipt, ShieldCheck, Calculator, Ruler, Layers } from 'lucide-react';
import { isPlywoodItem } from '../utils/woodCalculator';

export default function InvoiceModal({ 
  isOpen, 
  onClose, 
  onCreated, 
  onUpdated,
  invoiceToEdit = null,
  inventoryItems = [], 
  firm 
}) {
  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  const availableItems = inventoryItems.filter(i => isAshapura || !isPlywoodItem(i));

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transport, setTransport] = useState('ARRANGE');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  
  // Conditional GST: default No GST (0%)
  const [applyGst, setApplyGst] = useState(false);
  const [taxRate, setTaxRate] = useState(18);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [autoDeductStock, setAutoDeductStock] = useState(true);

  // Line items matching client sample table:
  // Sr.no | vechile no | length | width | peace | sq.ft | description | specific | Total
  const [items, setItems] = useState([
    { 
      itemId: '', 
      vehicleNo: '',
      length: '', 
      width: '', 
      pieces: 1, // peace
      sqft: 0,   // calculated as length * width * peace / 144
      itemName: '', 
      itemDescription: '', // specific
      unitPrice: 0 
    }
  ]);

  // Sync state if editing an existing invoice
  useEffect(() => {
    if (invoiceToEdit) {
      setCustomerName(invoiceToEdit.customer_name || invoiceToEdit.customerName || '');
      setCustomerPhone(invoiceToEdit.customer_phone || invoiceToEdit.customerPhone || '');
      setCustomerEmail(invoiceToEdit.customer_email || invoiceToEdit.customerEmail || '');
      setCustomerAddress(invoiceToEdit.customer_address || invoiceToEdit.customerAddress || '');
      setVehicleNo(invoiceToEdit.vehicle_no || invoiceToEdit.vehicleNo || '');
      setTransport(invoiceToEdit.transport || 'ARRANGE');
      setInvoiceDate(invoiceToEdit.invoice_date || invoiceToEdit.invoiceDate || new Date().toISOString().split('T')[0]);
      setDueDate(invoiceToEdit.due_date || invoiceToEdit.dueDate || '');
      setPaymentMethod(invoiceToEdit.payment_method || invoiceToEdit.paymentMethod || 'Bank Transfer');
      
      const invTaxRate = Number(invoiceToEdit.tax_rate ?? invoiceToEdit.taxRate ?? 0);
      if (invTaxRate > 0) {
        setApplyGst(true);
        setTaxRate(invTaxRate);
      } else {
        setApplyGst(false);
        setTaxRate(0);
      }

      setDiscountAmount(Number(invoiceToEdit.discount_amount || invoiceToEdit.discountAmount || 0));
      setNotes(invoiceToEdit.notes || '');

      if (invoiceToEdit.items && invoiceToEdit.items.length > 0) {
        setItems(invoiceToEdit.items.map(it => ({
          itemId: it.item_id || it.itemId || '',
          vehicleNo: it.vehicle_no || it.vehicleNo || invoiceToEdit.vehicle_no || '',
          length: it.length || '',
          width: it.width || '',
          pieces: it.pieces || it.quantity || 1,
          sqft: it.sqft || it.total_cft || it.totalCft || calculateSqFtFormula(it.length, it.width, it.pieces || 1),
          itemName: it.item_name || it.itemName || '',
          itemDescription: it.item_description || it.itemDescription || it.specific || '',
          unitPrice: Number(it.unit_price || it.unitPrice || 0)
        })));
      }
    } else {
      // Reset form for fresh invoice
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
      setVehicleNo('');
      setTransport('ARRANGE');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setPaymentMethod('Bank Transfer');
      setApplyGst(false);
      setTaxRate(18);
      setDiscountAmount(0);
      setNotes('');
      setItems([
        { 
          itemId: '', 
          vehicleNo: '',
          length: '', 
          width: '', 
          pieces: 1, 
          sqft: 0, 
          itemName: '', 
          itemDescription: '', 
          unitPrice: 0 
        }
      ]);
    }
  }, [invoiceToEdit, isOpen]);

  if (!isOpen) return null;

  // Client's exact formula: length X width X peace / 144 = total sq.ft
  function calculateSqFtFormula(len, wid, pcs) {
    const l = parseFloat(len) || 0;
    const w = parseFloat(wid) || 0;
    const p = parseFloat(pcs) || 1;
    if (l <= 0 || w <= 0) return 0;
    return (l * w * p) / 144;
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const row = { ...updated[index] };
    row[field] = value;

    // If itemId selected from catalog, auto-fill dimensions, description and rates
    if (field === 'itemId' && value) {
      const selectedProduct = inventoryItems.find(p => p.id === value);
      if (selectedProduct) {
        row.itemName = selectedProduct.name || '';
        row.itemDescription = selectedProduct.description || '';
        row.length = selectedProduct.length || '';
        row.width = selectedProduct.width || '';
        row.unitPrice = Number(selectedProduct.selling_price) || 0;
      }
    }

    // Auto calculate sq.ft when length, width, or pieces (peace) change
    if (field === 'length' || field === 'width' || field === 'pieces' || field === 'itemId') {
      row.sqft = calculateSqFtFormula(row.length, row.width, row.pieces || 1);
    }

    updated[index] = row;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items, 
      { 
        itemId: '', 
        vehicleNo: vehicleNo || '',
        length: '', 
        width: '', 
        pieces: 1, 
        sqft: 0, 
        itemName: '', 
        itemDescription: '', 
        unitPrice: 0 
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Row total: sqft * rate (or pieces * rate if sqft is 0)
  const getRowTotal = (row) => {
    const rate = Number(row.unitPrice || 0);
    const sqftVal = Number(row.sqft || 0);
    const pcs = Number(row.pieces || 0);

    if (sqftVal > 0) {
      return sqftVal * rate;
    }
    return pcs * rate;
  };

  // Grand Totals Calculations
  const subtotal = items.reduce((acc, it) => acc + getRowTotal(it), 0);
  const activeTaxRate = applyGst ? Number(taxRate || 0) : 0;
  const taxAmount = (subtotal * activeTaxRate) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - Number(discountAmount || 0));
  const totalPiecesSum = items.reduce((acc, it) => acc + (Number(it.pieces) || 0), 0);
  const totalSqFtSum = items.reduce((acc, it) => acc + (Number(it.sqft) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter customer / client name');
      return;
    }
    if (items.some(it => !it.itemName.trim() || Number(it.pieces) <= 0)) {
      alert('Please fill all item names and valid peace quantities');
      return;
    }

    const formattedItems = items.map(it => ({
      itemId: it.itemId || null,
      vehicleNo: (it.vehicleNo || vehicleNo || '').trim(),
      length: parseFloat(it.length) || 0,
      width: parseFloat(it.width) || 0,
      pieces: parseFloat(it.pieces) || 1,
      sqft: parseFloat(it.sqft) || calculateSqFtFormula(it.length, it.width, it.pieces),
      total_cft: parseFloat(it.sqft) || calculateSqFtFormula(it.length, it.width, it.pieces),
      itemName: it.itemName.trim(),
      itemDescription: (it.itemDescription || '').trim(),
      specific: (it.itemDescription || '').trim(),
      quantity: parseFloat(it.sqft) > 0 ? parseFloat(it.sqft) : parseFloat(it.pieces),
      unitPrice: Number(it.unitPrice) || 0,
      totalPrice: getRowTotal(it)
    }));

    const invoicePayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim(),
      vehicleNo: vehicleNo.trim(),
      transport: transport.trim(),
      invoiceDate,
      dueDate,
      paymentMethod,
      taxRate: activeTaxRate,
      discountAmount: Number(discountAmount),
      subtotal,
      taxAmount,
      totalAmount: grandTotal,
      totalPieces: totalPiecesSum,
      totalSqFt: totalSqFtSum,
      notes,
      autoDeductStock,
      items: formattedItems
    };

    if (invoiceToEdit && onUpdated) {
      onUpdated(invoiceToEdit.id, {
        customer_name: invoicePayload.customerName,
        customer_phone: invoicePayload.customerPhone,
        customer_email: invoicePayload.customerEmail,
        customer_address: invoicePayload.customerAddress,
        vehicle_no: invoicePayload.vehicleNo,
        transport: invoicePayload.transport,
        invoice_date: invoicePayload.invoiceDate,
        due_date: invoicePayload.dueDate,
        payment_method: invoicePayload.paymentMethod,
        tax_rate: invoicePayload.taxRate,
        discount_amount: invoicePayload.discountAmount,
        subtotal: invoicePayload.subtotal,
        tax_amount: invoicePayload.taxAmount,
        total_amount: invoicePayload.totalAmount,
        notes: invoicePayload.notes,
        items: invoicePayload.items
      });
    } else if (onCreated) {
      onCreated(invoicePayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {invoiceToEdit ? 'Edit Customer Invoice / Bill' : 'Generate Customer Bill'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Calculation: length × width × peace / 144 = total sq.ft
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Customer Details Box per user's 1st image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Client Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Patel Timber Mart / Shree Saw Mills"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Gmail</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Site / Address</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Yard No. 4, GIDC Industrial Estate, Gandhidham"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit / Later">Credit / Net 30</option>
              </select>
            </div>
          </div>

          {/* Vehicle and Transport Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Vehicle No (vechile no)</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                placeholder="e.g. GJ-18-BW-7236"
                className="w-full text-xs px-3 py-1.5 border border-amber-300 bg-white rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transport</label>
              <input
                type="text"
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                placeholder="ARRANGE / Direct"
                className="w-full text-xs px-3 py-1.5 border border-slate-300 bg-white rounded-lg uppercase"
              />
            </div>
          </div>

          {/* Table Line Items matching client sample Excel columns */}
          {/* Columns: Sr.no | vechile no | length | width | peace | sq.ft | description | specific | Total */}
          <div className="border border-slate-200 rounded-xl p-3 sm:p-4 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Bill Items Table
                </span>
                {totalPiecesSum > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    Total: {totalPiecesSum} Peace • {totalSqFtSum.toFixed(3)} sq.ft
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center space-x-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((row, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Row #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-slate-400 hover:text-red-500 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Description & Specific */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <select
                        value={row.itemId}
                        onChange={(e) => handleItemChange(idx, 'itemId', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50"
                      >
                        <option value="">-- Catalog (Optional) --</option>
                        {availableItems.map(inv => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="description (e.g. Teak Sawn Timber Planks)"
                        value={row.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="specific (e.g. Grade A)"
                        value={row.itemDescription}
                        onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Calculations Grid: vechile no | length | width | peace | sq.ft | Rate | Total */}
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 items-center bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700">vechile no</label>
                      <input
                        type="text"
                        placeholder={vehicleNo || 'Vehicle'}
                        value={row.vehicleNo}
                        onChange={(e) => handleItemChange(idx, 'vehicleNo', e.target.value.toUpperCase())}
                        className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-amber-900">length</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Length"
                        value={row.length}
                        onChange={(e) => handleItemChange(idx, 'length', e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-amber-300 rounded text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-amber-900">width</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Width"
                        value={row.width}
                        onChange={(e) => handleItemChange(idx, 'width', e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-amber-300 rounded text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-900">peace *</label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        placeholder="Peace"
                        value={row.pieces}
                        onChange={(e) => handleItemChange(idx, 'pieces', e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border-2 border-amber-400 rounded text-center font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900">sq.ft (L×W×P/144)</label>
                      <div className="w-full text-xs py-1 px-1 bg-emerald-100/80 border border-emerald-300 rounded text-center font-mono font-black text-emerald-900">
                        {Number(row.sqft || 0).toFixed(3)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700">Rate (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Rate"
                        value={row.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-900 text-right">Total (₹)</label>
                      <div className="w-full text-xs py-1 font-black text-slate-900 text-right">
                        ₹{getRowTotal(row).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conditional GST Section (User requested: remove static GST, option Yes/No, if Yes enter % else no field) */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Apply GST on this Bill?</span>
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="applyGstRadio"
                        checked={!applyGst}
                        onChange={() => { setApplyGst(false); setTaxRate(0); }}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-700">No (0% GST)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="applyGstRadio"
                        checked={applyGst}
                        onChange={() => { setApplyGst(true); setTaxRate(18); }}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-700">Yes (Enter GST %)</span>
                    </label>
                  </div>
                </div>

                {/* If Yes: field appears to enter percentage */}
                {applyGst && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Enter GST Percentage (%)</label>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-20 text-right px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                        placeholder="18"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Remarks</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms of delivery, loading/unloading..."
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  id="stockDeduct"
                  checked={autoDeductStock}
                  onChange={(e) => setAutoDeductStock(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="stockDeduct" className="text-slate-700 font-medium">
                  Automatically register stock-out dispatch in Inventory
                </label>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Peace:</span>
                <span className="font-bold text-slate-900 font-mono">{totalPiecesSum}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total sq.ft:</span>
                <span className="font-bold text-emerald-700 font-mono">{totalSqFtSum.toFixed(3)}</span>
              </div>
              <div className="border-t border-slate-200 my-1"></div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Only shown if GST is applied and > 0 */}
              {applyGst && activeTaxRate > 0 && (
                <>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>GST ({activeTaxRate}%):</span>
                    <span className="font-bold text-slate-800">₹{taxAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-slate-600">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-20 text-right px-2 py-0.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div className="border-t-2 border-slate-300 pt-2 flex justify-between items-center">
                <span className="font-black text-sm text-slate-900">Grand Total:</span>
                <span className="font-black text-base text-slate-900">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl shadow-md transition"
            >
              {invoiceToEdit ? 'Save Changes & Update Bill' : 'Issue Bill & Generate Micro-PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
