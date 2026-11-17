import React, { useState } from 'react';
import { X, Plus, Trash2, Receipt, ShieldCheck } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, onCreated, inventoryItems }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [taxRate, setTaxRate] = useState(18);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [autoDeductStock, setAutoDeductStock] = useState(true);

  const [items, setItems] = useState([
    { itemId: '', itemName: '', quantity: 1, unitPrice: 0 }
  ]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // If itemId selected, auto-fill itemName and unitPrice from stock catalog
    if (field === 'itemId' && value) {
      const selectedProduct = inventoryItems.find(p => p.id === value);
      if (selectedProduct) {
        updated[index].itemName = selectedProduct.name;
        updated[index].unitPrice = Number(selectedProduct.selling_price) || 0;
      }
    }

    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { itemId: '', itemName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - Number(discountAmount || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName) {
      alert('Please enter customer / client name');
      return;
    }
    if (items.some(it => !it.itemName || Number(it.quantity) <= 0)) {
      alert('Please fill all item descriptions and positive quantities');
      return;
    }

    onCreated({
      customerName,
      customerPhone,
      customerEmail,
      invoiceDate,
      dueDate,
      paymentMethod,
      taxRate: Number(taxRate),
      discountAmount: Number(discountAmount),
      notes,
      autoDeductStock,
      items
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Receipt className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">Generate New Customer Invoice (KB Optimized)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Client Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Patel Enterprises"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit / Later">Credit / Net 30</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Invoice Line Items</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((row, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <select
                    value={row.itemId}
                    onChange={(e) => handleItemChange(idx, 'itemId', e.target.value)}
                    className="w-1/3 text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">-- Choose Stock Item (Optional) --</option>
                    {inventoryItems.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} (Stock: {inv.current_stock} {inv.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="Item / Service description"
                    value={row.itemName}
                    onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />

                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-16 text-xs px-2 py-2 border border-slate-300 rounded-lg text-center"
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={row.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    className="w-24 text-xs px-2 py-2 border border-slate-300 rounded-lg text-right"
                  />

                  <div className="w-24 text-xs font-bold text-slate-700 text-right pr-2">
                    ₹{(Number(row.quantity || 0) * Number(row.unitPrice || 0)).toFixed(2)}
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tax, Discounts & Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-2 w-full sm:w-1/2">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDeductStock}
                  onChange={(e) => setAutoDeductStock(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Auto-deduct items from Warehouse Stock (Stock-Out)</span>
              </label>

              <textarea
                rows="2"
                placeholder="Payment terms or notes to customer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
              ></textarea>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>GST / Tax (%):</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right font-medium"
                />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span className="font-semibold text-slate-900">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-20 px-1.5 py-0.5 border border-slate-300 rounded text-right font-medium"
                />
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-brand-700">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium text-right flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" /> Stored as ~5 KB Micro-PDF in Drive
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
            >
              Generate Bill & Save to Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
