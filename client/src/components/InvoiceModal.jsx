import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Receipt, 
  ShieldCheck, 
  Calculator, 
  Ruler, 
  Layers, 
  Send,
  Truck,
  Boxes,
  Check,
  ChevronDown,
  Package,
  Search,
  Sparkles
} from 'lucide-react';
import { isPlywoodItem } from '../utils/woodCalculator';

export default function InvoiceModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  invoiceToEdit = null,
  inventoryItems = [],
  vehicles = [],
  firm
}) {
  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');
  const availableItems = inventoryItems.filter(i => isAshapura || !isPlywoodItem(i));

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
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

  // Selection Drawers States for Type-Ahead Autocomplete
  const [activeMaterialDrawerIdx, setActiveMaterialDrawerIdx] = useState(null);
  const [activeVehicleRowDrawerIdx, setActiveVehicleRowDrawerIdx] = useState(null);
  const [showVehicleHeaderDrawer, setShowVehicleHeaderDrawer] = useState(false);

  // Close drawers on outside click
  useEffect(() => {
    const handleClickAway = (e) => {
      if (!e.target.closest('.drawer-container')) {
        setActiveMaterialDrawerIdx(null);
        setActiveVehicleRowDrawerIdx(null);
        setShowVehicleHeaderDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  // Filter matching materials (shows first matches or top saved items)
  const getMatchingMaterials = (query) => {
    if (!query || query.trim() === '') {
      return availableItems.slice(0, 10);
    }
    const q = query.toLowerCase().trim();
    return availableItems.filter(item => 
      item.name?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    ).slice(0, 12);
  };

  // Filter matching registered vehicles
  const getMatchingVehicles = (query) => {
    if (!query || query.trim() === '') {
      return (vehicles || []).slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return (vehicles || []).filter(v => 
      v.vehicle_number?.toLowerCase().includes(q) ||
      v.driver_name?.toLowerCase().includes(q) ||
      v.vehicle_type?.toLowerCase().includes(q)
    ).slice(0, 10);
  };

  const handleSelectMaterial = (idx, item) => {
    const updated = [...items];
    const row = { ...updated[idx] };
    row.itemId = item.id;
    row.itemName = item.name || '';
    if (!row.itemDescription) {
      row.itemDescription = item.description || item.category || '';
    }
    if (Number(row.unitPrice) <= 0) {
      row.unitPrice = Number(item.selling_price || item.cost_price || 0);
    }
    if (item.length && !row.length) row.length = item.length;
    if (item.width && !row.width) row.width = item.width;
    row.sqft = calculateSqFtFormula(row.length, row.width, row.pieces || 1);
    updated[idx] = row;
    setItems(updated);
    setActiveMaterialDrawerIdx(null);
  };

  const handleSelectHeaderVehicle = (v) => {
    setVehicleNo(v.vehicle_number);
    if (v.driver_name) {
      setTransport(`${v.driver_name} (${v.vehicle_type || 'Truck'})`);
    }
    setShowVehicleHeaderDrawer(false);
    // Propagate to rows that have empty or matching previous vehicleNo
    const updated = items.map(it => ({
      ...it,
      vehicleNo: (!it.vehicleNo || it.vehicleNo === vehicleNo) ? v.vehicle_number : it.vehicleNo
    }));
    setItems(updated);
  };

  const handleSelectRowVehicle = (idx, v) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], vehicleNo: v.vehicle_number };
    setItems(updated);
    setActiveVehicleRowDrawerIdx(null);
  };

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
      const phoneVal = invoiceToEdit.customer_phone || invoiceToEdit.customerPhone || '';
      setCustomerPhone(phoneVal);
      setWhatsappNo(invoiceToEdit.whatsapp_no || invoiceToEdit.whatsappNo || phoneVal);
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
      setWhatsappNo('');
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

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Client's exact formula: length X width X peace / 144 = total sq.ft
  function calculateSqFtFormula(len, wid, pcs) {
    const l = parseFloat(len) || 0;
    const w = parseFloat(wid) || 0;
    const p = parseFloat(pcs) || 1;
    if (l <= 0 || w <= 0) return 0;
    return (l * w * p) / 144;
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setCustomerPhone(val);
    if (!whatsappNo || whatsappNo === customerPhone) {
      setWhatsappNo(val);
    }
  };

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

  const processFormSubmit = (sendToWhatsApp = false) => {
    if (!customerName.trim()) {
      alert('Please enter customer / client name');
      return;
    }
    if (sendToWhatsApp && !whatsappNo.trim() && !customerPhone.trim()) {
      alert('Please enter WhatsApp phone number to send the PDF bill');
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
      whatsappNo: (whatsappNo || customerPhone || '').trim(),
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
        whatsapp_no: invoicePayload.whatsappNo,
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
      onCreated(invoicePayload, sendToWhatsApp);
    }

    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processFormSubmit(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-start p-2 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-2 sm:my-6 relative">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {invoiceToEdit ? 'Edit Customer Invoice / Bill' : 'Generate Customer Bill'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Calculation: length × width × peace / 144 = total sq.ft • Direct WhatsApp PDF Dispatch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition ml-2 cursor-pointer ring-2 ring-red-400/40"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Customer Details Box per user's request: Includes WhatsApp No Form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
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
                onChange={handlePhoneChange}
                placeholder="+91-9876543210"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            {/* WhatsApp No Field: Explicitly requested by user */}
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 fill-emerald-600 shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                </svg>
                <span>WhatsApp No (for PDF)</span>
              </label>
              <input
                type="text"
                value={whatsappNo}
                onChange={(e) => setWhatsappNo(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full text-xs px-3 py-2 border-2 border-emerald-400 bg-emerald-50/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-900"
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

          {/* Vehicle and Transport Row with Type-Ahead Selection Drawer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="relative drawer-container">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vehicle No (vechile no)</span>
                </label>
                <span className="text-[10px] text-amber-700 font-semibold">
                  Type letter to search vehicles
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={vehicleNo}
                  onFocus={() => setShowVehicleHeaderDrawer(true)}
                  onChange={(e) => {
                    setVehicleNo(e.target.value.toUpperCase());
                    setShowVehicleHeaderDrawer(true);
                  }}
                  placeholder="e.g. Type 'A' or 'G' (GJ-18-BW-7236)..."
                  className="w-full text-xs px-3 py-1.5 pr-8 border border-amber-300 bg-white rounded-lg font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowVehicleHeaderDrawer(!showVehicleHeaderDrawer)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete Drawer for Header Vehicle */}
              {showVehicleHeaderDrawer && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  <div className="bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold flex items-center justify-between sticky top-0 z-10">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Registered Vehicles ({getMatchingVehicles(vehicleNo).length} found)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Click to select</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {getMatchingVehicles(vehicleNo).length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No registered vehicle matches "{vehicleNo}". You can type any number manually.
                      </div>
                    ) : (
                      getMatchingVehicles(vehicleNo).map((v) => (
                        <button
                          key={v.id || v.vehicle_number}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectHeaderVehicle(v);
                          }}
                          className="w-full text-left p-2.5 hover:bg-amber-50/80 transition flex items-center justify-between gap-2 group cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-amber-900">
                                {v.vehicle_number}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {v.vehicle_type || 'Truck'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Driver: <strong className="text-slate-700">{v.driver_name || 'Unassigned'}</strong>
                              {v.driver_phone ? ` • ${v.driver_phone}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              v.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {v.status === 'available' ? '● Available' : '● On Route'}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transport Details / Driver</label>
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

                  {/* Material (Type-Ahead Selection Drawer), Description & Specific */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Field 1: Material (Saved Stock Autocomplete Drawer) */}
                    <div className="sm:col-span-5 relative drawer-container">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                          <Boxes className="w-3 h-3 text-amber-600" />
                          <span>Material (Saved Stock Selection)</span>
                        </label>
                        {row.itemId && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            ✓ In Stock
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={row.itemName}
                          onFocus={() => setActiveMaterialDrawerIdx(idx)}
                          onChange={(e) => {
                            handleItemChange(idx, 'itemName', e.target.value);
                            setActiveMaterialDrawerIdx(idx);
                          }}
                          placeholder="Type 1st letter (e.g. T for Teak, P for Pine...)"
                          className="w-full text-xs px-2.5 py-1.5 pr-7 border-2 border-amber-300 rounded-lg font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveMaterialDrawerIdx(activeMaterialDrawerIdx === idx ? null : idx)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Autocomplete Drawer for Material */}
                      {activeMaterialDrawerIdx === idx && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                          <div className="bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold flex items-center justify-between sticky top-0 z-10">
                            <span className="flex items-center gap-1.5">
                              <Boxes className="w-3.5 h-3.5 text-amber-400" />
                              <span>Warehouse Stock ({getMatchingMaterials(row.itemName).length} found)</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Click to link &amp; auto-fill</span>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {getMatchingMaterials(row.itemName).length === 0 ? (
                              <div className="p-3 text-center text-xs text-slate-500">
                                No saved material matches "{row.itemName}". You can type custom material name freely.
                              </div>
                            ) : (
                              getMatchingMaterials(row.itemName).map((inv) => {
                                const isHealthy = Number(inv.current_stock || 0) > 0;
                                return (
                                  <button
                                    key={inv.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectMaterial(idx, inv);
                                    }}
                                    className="w-full text-left p-2.5 hover:bg-amber-50/80 transition flex items-center justify-between gap-2 group cursor-pointer"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                                          {inv.name}
                                        </span>
                                        {inv.sku && (
                                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                            {inv.sku}
                                          </span>
                                        )}
                                        {inv.category && (
                                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                            {inv.category}
                                          </span>
                                        )}
                                      </div>
                                      {inv.description && (
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                          {inv.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isHealthy ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                                      }`}>
                                        {isHealthy ? `Stock: ${inv.current_stock} ${inv.unit || 'pcs'}` : '0 In Stock'}
                                      </span>
                                      <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                                        ₹{Number(inv.selling_price || inv.cost_price || 0).toFixed(2)}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Field 2: Description */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                        description (e.g. Teak Sawn Timber Planks)
                      </label>
                      <input
                        type="text"
                        placeholder="description (e.g. Teak Sawn Planks)"
                        value={row.itemDescription}
                        onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                      />
                    </div>

                    {/* Field 3: Specific */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                        specific (e.g. Grade A)
                      </label>
                      <input
                        type="text"
                        placeholder="specific (e.g. Grade A)"
                        value={row.specific || ''}
                        onChange={(e) => handleItemChange(idx, 'specific', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Calculations Grid: vechile no | length | width | peace | sq.ft | Rate | Total */}
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 items-center bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                    <div className="relative drawer-container">
                      <label className="block text-[10px] font-semibold text-slate-700">vechile no</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={vehicleNo || 'Vehicle'}
                          value={row.vehicleNo}
                          onFocus={() => setActiveVehicleRowDrawerIdx(idx)}
                          onChange={(e) => {
                            handleItemChange(idx, 'vehicleNo', e.target.value.toUpperCase());
                            setActiveVehicleRowDrawerIdx(idx);
                          }}
                          className="w-full text-xs px-2 py-1 pr-4 bg-white border border-slate-300 rounded font-mono text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveVehicleRowDrawerIdx(activeVehicleRowDrawerIdx === idx ? null : idx)}
                          className="absolute right-1 top-1.5 text-slate-400 hover:text-slate-600"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Autocomplete Drawer for Row Vehicle */}
                      {activeVehicleRowDrawerIdx === idx && (
                        <div className="absolute left-0 sm:left-auto right-0 top-full mt-1 z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 text-left">
                          <div className="bg-slate-900 text-white px-2.5 py-1 text-[10px] font-bold flex items-center justify-between sticky top-0 z-10">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3 text-amber-400" />
                              <span>Select Dispatch Vehicle</span>
                            </span>
                            <span className="text-[9px] text-slate-400">Click to choose</span>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {getMatchingVehicles(row.vehicleNo).length === 0 ? (
                              <div className="p-2 text-center text-xs text-slate-400">
                                No registered vehicles match. Type manually.
                              </div>
                            ) : (
                              getMatchingVehicles(row.vehicleNo).map((v) => (
                                <button
                                  key={v.id || v.vehicle_number}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectRowVehicle(idx, v);
                                  }}
                                  className="w-full text-left p-2 hover:bg-amber-50 transition flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="text-xs font-mono font-bold text-slate-900">
                                      {v.vehicle_number}
                                    </span>
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {v.driver_name || 'Driver'} • {v.vehicle_type || 'Truck'}
                                    </p>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                    v.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {v.status || 'available'}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
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

                  {/* Connected Stock Info Banner */}
                  {(() => {
                    const linkedItem = availableItems.find(i => 
                      (row.itemId && i.id === row.itemId) || 
                      (row.itemName && i.name?.toLowerCase() === row.itemName.toLowerCase())
                    );
                    if (linkedItem) {
                      return (
                        <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200/90 px-3 py-1.5 rounded-lg text-[10px] text-emerald-950">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Connected Warehouse Stock: <strong>{linkedItem.name}</strong> ({linkedItem.sku || 'SKU'})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Available: <strong className="text-emerald-800">{linkedItem.current_stock} {linkedItem.unit || 'pcs'}</strong></span>
                            <span className="text-[9px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-bold">
                              Will deduct {row.pieces || 1} peace from Stock In &amp; log in Stock Out
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ))}
            </div>
          </div>

          {/* Conditional GST Section */}
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

          {/* Action Buttons: Includes Direct WhatsApp PDF Send */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 order-2 sm:order-1"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2 justify-end">
              {/* Direct WhatsApp PDF Send Button */}
              <button
                type="button"
                onClick={() => processFormSubmit(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
                title="Save bill, download vector PDF, and immediately redirect to WhatsApp"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                </svg>
                <span>Issue &amp; Send to WhatsApp (PDF)</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl shadow-md transition"
              >
                {invoiceToEdit ? 'Save Changes' : 'Issue Bill'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
