import { supabase, isConfigured } from '../config/supabaseClient';
import { inventoryService } from './inventoryService';

const LOCAL_INVOICE_KEY = 'shashwat_invoices_cache';

function getCachedInvoices() {
  const cached = localStorage.getItem(LOCAL_INVOICE_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      // Clean filter to ensure zero stale mock/demo data like Patel Enterprises
      return (parsed || []).filter(i => 
        i && 
        i.customer_name !== 'Patel Enterprises' && 
        i.customer_name !== 'Patel Timber Mart' && 
        i.invoice_number !== 'INV-2026-001' &&
        !['inv-1', 'inv-demo', '10000000-0000-0000-0000-000000000001'].includes(i.id)
      );
    } catch (e) {}
  }
  return [];
}

function saveCachedInvoices(invoices) {
  try {
    localStorage.setItem(LOCAL_INVOICE_KEY, JSON.stringify(invoices));
  } catch (e) {}
}

export const billingService = {
  async getInvoices() {
    const cached = getCachedInvoices();

    if (!isConfigured || !supabase) {
      return { data: cached, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .order('invoice_date', { ascending: false });

      if (error) {
        console.warn('Supabase fetch notice, falling back to local storage:', error);
        return { data: cached, error: null };
      }

      // Map invoice_items to items for consistent frontend usage
      const cleanList = (data || []).filter(i => 
        i && 
        i.customer_name !== 'Patel Enterprises' && 
        i.customer_name !== 'Patel Timber Mart' && 
        i.invoice_number !== 'INV-2026-001' &&
        !['inv-1', 'inv-demo', '10000000-0000-0000-0000-000000000001'].includes(i.id)
      );

      cleanList.forEach(inv => {
        // 1. Try mapping from invoice_items table
        if (inv.invoice_items && inv.invoice_items.length > 0 && (!inv.items || inv.items.length === 0)) {
          inv.items = inv.invoice_items.map(it => ({
            ...it,
            itemName: it.item_name,
            itemDescription: it.item_description || '',
            vehicleNo: it.vehicle_no || inv.vehicle_no || '',
            length: it.length || 0,
            width: it.width || 0,
            thickness: it.thickness || 0,
            unitPrice: Number(it.unit_price) || 0,
            totalPrice: Number(it.total_price) || 0,
            pieces: it.pieces || it.quantity || 1,
            totalCft: it.total_cft || 0
          }));
        }

        // 2. Try parsing rich items from embedded notes metadata if items still empty
        if ((!inv.items || inv.items.length === 0) && inv.notes && inv.notes.includes('<!--ITEMS:')) {
          try {
            const match = inv.notes.match(/<!--ITEMS:(.*?)-->/);
            if (match) {
              inv.items = JSON.parse(match[1]);
            }
          } catch (e) {}
        }
      });

      // Merge cached and remote items (deduplicated by invoice_number)
      const invoiceMap = new Map();
      cached.forEach(i => invoiceMap.set(i.invoice_number || i.id, i));
      
      cleanList.forEach(remoteInv => {
        const key = remoteInv.invoice_number || remoteInv.id;
        const cachedInv = invoiceMap.get(key);

        // NEVER let a remote record with 0 items overwrite rich cached items!
        if (cachedInv && cachedInv.items && cachedInv.items.length > 0 && (!remoteInv.items || remoteInv.items.length === 0)) {
          remoteInv.items = cachedInv.items;
        }

        invoiceMap.set(key, remoteInv);
      });

      const merged = Array.from(invoiceMap.values()).sort((a, b) => {
        return new Date(b.invoice_date || 0) - new Date(a.invoice_date || 0);
      });

      // Update cache with merged records to ensure persistence
      saveCachedInvoices(merged);

      return { data: merged, error: null };
    } catch (err) {
      console.warn('Network error, showing local invoices:', err);
      return { data: cached, error: null };
    }
  },

  async createInvoice(invoiceInput) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      whatsappNo,
      customerAddress,
      vehicleNo = '',
      transport = 'ARRANGE',
      invoiceDate,
      dueDate,
      items = [],
      taxRate = 0,
      discountAmount = 0,
      paymentMethod = 'Bank Transfer',
      notes,
      autoDeductStock = true
    } = invoiceInput;

    // Sanitize dates to prevent Postgres empty string syntax error: invalid input syntax for type date: ""
    const cleanDueDate = dueDate && String(dueDate).trim() !== '' ? String(dueDate).trim() : null;
    const cleanInvoiceDate = invoiceDate && String(invoiceDate).trim() !== '' 
      ? String(invoiceDate).trim() 
      : new Date().toISOString().split('T')[0];

    // Calculate totals & round numeric values to 2 decimals to prevent Postgres numeric field overflow
    let subtotal = 0;
    const computedItems = items.map((it, idx) => {
      const pcs = parseFloat(it.pieces) || 1;
      const totCft = parseFloat(it.totalCft || it.sqft) || 0;
      const price = parseFloat(it.unitPrice) || 0;
      const rowTotal = it.totalPrice !== undefined 
        ? parseFloat(it.totalPrice) 
        : (totCft > 0 ? totCft * price : pcs * price);

      subtotal += rowTotal;

      return {
        id: `item-${Date.now()}-${idx}`,
        item_id: it.itemId || null,
        item_name: it.itemName,
        item_description: it.itemDescription || it.specific || '',
        specific: it.specific || it.itemDescription || '',
        vehicle_no: it.vehicleNo || vehicleNo || '',
        length: Number((parseFloat(it.length) || 0).toFixed(2)),
        width: Number((parseFloat(it.width) || 0).toFixed(2)),
        thickness: Number((parseFloat(it.thickness) || 0).toFixed(2)),
        cft: Number((parseFloat(it.cft) || 0).toFixed(3)),
        sqft: Number((totCft || 0).toFixed(3)),
        pieces: pcs,
        total_cft: Number((totCft || 0).toFixed(3)),
        quantity: Number((totCft > 0 ? totCft : pcs).toFixed(2)),
        unit_price: Number(price.toFixed(2)),
        total_price: Number(rowTotal.toFixed(2))
      };
    });

    const activeTaxRate = Number((parseFloat(taxRate) || 0).toFixed(2));
    const taxAmount = Number(((subtotal * activeTaxRate) / 100).toFixed(2));
    const cleanDiscount = Number((parseFloat(discountAmount) || 0).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount - cleanDiscount).toFixed(2));
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build complete invoice object
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_email: customerEmail || '',
      customer_phone: customerPhone || '',
      whatsapp_no: whatsappNo || customerPhone || '',
      customer_address: customerAddress || '',
      vehicle_no: vehicleNo || '',
      transport: transport || 'ARRANGE',
      invoice_date: cleanInvoiceDate,
      due_date: cleanDueDate || '',
      subtotal: Number(subtotal.toFixed(2)),
      tax_rate: activeTaxRate,
      tax_amount: taxAmount,
      discount_amount: cleanDiscount,
      total_amount: totalAmount,
      amount_paid: 0.00,
      balance_due: totalAmount,
      status: 'ISSUED',
      payment_method: paymentMethod || 'Bank Transfer',
      notes: notes || '',
      file_size_kb: 5.4,
      items: computedItems
    };

    // 1. ALWAYS SAVE TO LOCAL STORAGE FIRST (Guarantees invoice is immediately displayed)
    const cachedInvoices = getCachedInvoices();
    cachedInvoices.unshift(newInvoice);
    saveCachedInvoices(cachedInvoices);

    // Auto deduct stock in offline mode
    if (autoDeductStock) {
      for (const it of computedItems) {
        if (it.item_id) {
          inventoryService.stockOut({
            itemId: it.item_id,
            quantity: it.quantity,
            referenceNumber: invoiceNumber,
            partyName: customerName,
            notes: `Dispatched against ${invoiceNumber} (${it.pieces} pcs)`
          }).catch(() => {});
        }
      }
    }

    // 2. SYNC TO SUPABASE IF CONFIGURED (With resilient fallback)
    if (isConfigured && supabase) {
      try {
        const insertPayload = {
          invoice_number: invoiceNumber,
          customer_name: customerName,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
          customer_address: customerAddress || null,
          invoice_date: cleanInvoiceDate,
          due_date: cleanDueDate,
          subtotal: Number(subtotal.toFixed(2)),
          tax_rate: activeTaxRate,
          tax_amount: taxAmount,
          discount_amount: cleanDiscount,
          total_amount: totalAmount,
          amount_paid: 0.00,
          balance_due: totalAmount,
          status: 'ISSUED',
          payment_method: paymentMethod || 'Bank Transfer',
          notes: (notes ? `${notes}\n` : '') + `<!--ITEMS:${JSON.stringify(computedItems)}-->`
        };

        const { data: invData, error: invErr } = await supabase
          .from('invoices')
          .insert([insertPayload])
          .select()
          .single();

        if (!invErr && invData) {
          newInvoice.id = invData.id;

          // Insert line items
          const lineItemRows = computedItems.map(it => ({
            invoice_id: invData.id,
            item_id: it.item_id || null,
            item_name: it.item_description ? `${it.item_name} (${it.item_description})` : it.item_name,
            quantity: Number((it.quantity || 1).toFixed(2)),
            unit_price: Number((it.unit_price || 0).toFixed(2)),
            total_price: Number((it.total_price || 0).toFixed(2))
          }));

          await supabase.from('invoice_items').insert(lineItemRows).catch(() => {});
        } else if (invErr) {
          console.warn('Supabase insert notice (stored locally):', invErr.message);
        }
      } catch (sbErr) {
        console.warn('Supabase network notice (stored locally):', sbErr);
      }
    }

    // Always return successful creation
    return { data: newInvoice, error: null };
  },

  async recordPayment(invoiceId, amount, paymentMethod = 'Bank Transfer') {
    const payVal = parseFloat(amount) || 0;
    if (payVal <= 0) return { error: { message: 'Invalid payment amount' } };

    // Update locally first
    const invoices = getCachedInvoices();
    const idx = invoices.findIndex(i => i.id === invoiceId || i.invoice_number === invoiceId);
    let updatedInv = null;
    if (idx !== -1) {
      const inv = invoices[idx];
      const newAmountPaid = Number(inv.amount_paid || 0) + payVal;
      const newBalanceDue = Math.max(0, Number(inv.total_amount) - newAmountPaid);
      const newStatus = newBalanceDue === 0 ? 'PAID' : (newAmountPaid > 0 ? 'PARTIALLY_PAID' : inv.status);

      invoices[idx] = {
        ...inv,
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString()
      };
      saveCachedInvoices(invoices);
      updatedInv = invoices[idx];
    }

    if (isConfigured && supabase) {
      try {
        await supabase
          .from('invoices')
          .update({
            amount_paid: updatedInv ? updatedInv.amount_paid : payVal,
            balance_due: updatedInv ? updatedInv.balance_due : 0,
            status: updatedInv ? updatedInv.status : 'PAID',
            payment_method: paymentMethod,
            updated_at: new Date()
          })
          .eq('id', invoiceId);
      } catch (e) {}
    }

    return { data: updatedInv, error: null };
  },

  async updateInvoice(invoiceId, updates) {
    const invoices = getCachedInvoices();
    const idx = invoices.findIndex(i => i.id === invoiceId || i.invoice_number === invoiceId);
    let updatedInv = null;
    if (idx !== -1) {
      invoices[idx] = { ...invoices[idx], ...updates, updated_at: new Date().toISOString() };
      saveCachedInvoices(invoices);
      updatedInv = invoices[idx];
    }

    if (isConfigured && supabase) {
      try {
        await supabase
          .from('invoices')
          .update({ ...updates, updated_at: new Date() })
          .eq('id', invoiceId);
      } catch (e) {}
    }

    return { data: updatedInv || updates, error: null };
  },

  async deleteInvoice(invoiceId) {
    let invoices = getCachedInvoices();
    invoices = invoices.filter(i => i.id !== invoiceId && i.invoice_number !== invoiceId);
    saveCachedInvoices(invoices);

    if (isConfigured && supabase) {
      try {
        await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
        await supabase.from('invoices').delete().eq('id', invoiceId);
      } catch (e) {}
    }

    return { data: { success: true }, error: null };
  }
};
