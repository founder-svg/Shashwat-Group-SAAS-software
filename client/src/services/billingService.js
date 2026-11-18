import { supabase, isConfigured, initialDemoData } from '../config/supabaseClient';
import { inventoryService } from './inventoryService';

const LOCAL_INVOICE_KEY = 'shashwat_invoices_cache';

function getCachedInvoices() {
  const cached = localStorage.getItem(LOCAL_INVOICE_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      // Clean filter to ensure zero stale mock/demo data like Patel Enterprises
      return parsed.filter(i => 
        i && 
        i.customer_name !== 'Patel Enterprises' && 
        i.customer_name !== 'Patel Timber Mart' && 
        i.invoice_number !== 'INV-2026-001' &&
        !['inv-1', 'inv-demo'].includes(i.id)
      );
    } catch (e) {}
  }
  return [];
}

function saveCachedInvoices(invoices) {
  localStorage.setItem(LOCAL_INVOICE_KEY, JSON.stringify(invoices));
}

export const billingService = {
  async getInvoices() {
    if (!isConfigured) {
      return { data: getCachedInvoices(), error: null };
    }
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .order('invoice_date', { ascending: false });

    // Map invoice_items to items for consistent frontend usage
    if (data) {
      data.forEach(inv => {
        if (inv.invoice_items && !inv.items) {
          inv.items = inv.invoice_items.map(it => ({
            ...it,
            itemName: it.item_name,
            itemDescription: it.item_description || '',
            vehicleNo: it.vehicle_no || inv.vehicle_no || '',
            length: it.length || 0,
            width: it.width || 0,
            thickness: it.thickness || 0,
            unitPrice: it.unit_price,
            totalPrice: it.total_price,
            pieces: it.pieces || it.quantity || 1,
            totalCft: it.total_cft || 0
          }));
        }
      });
    }

    return { data, error };
  },

  async createInvoice(invoiceInput) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      vehicleNo = '',
      transport = 'ARRANGE',
      invoiceDate,
      dueDate,
      items,
      taxRate = 0,
      discountAmount = 0,
      paymentMethod = 'Bank Transfer',
      notes,
      autoDeductStock = true
    } = invoiceInput;

    // Calculate totals & enrich timber fields
    let subtotal = 0;
    const computedItems = items.map((it, idx) => {
      const pcs = parseFloat(it.pieces) || 1;
      const totCft = parseFloat(it.totalCft) || 0;
      const price = parseFloat(it.unitPrice) || 0;
      const rowTotal = it.totalPrice !== undefined 
        ? parseFloat(it.totalPrice) 
        : (totCft > 0 ? totCft * price : pcs * price);

      subtotal += rowTotal;

      return {
        id: `item-${Date.now()}-${idx}`,
        item_id: it.itemId || null,
        item_name: it.itemName,
        item_description: it.itemDescription || '',
        vehicle_no: it.vehicleNo || vehicleNo || '',
        length: parseFloat(it.length) || 0,
        width: parseFloat(it.width) || 0,
        thickness: parseFloat(it.thickness) || 0,
        cft: parseFloat(it.cft) || 0,
        pieces: pcs,
        total_cft: totCft,
        quantity: totCft > 0 ? totCft : pcs,
        unit_price: price,
        total_price: rowTotal
      };
    });

    const activeTaxRate = parseFloat(taxRate) || 0;
    const taxAmount = (subtotal * activeTaxRate) / 100;
    const totalAmount = subtotal + taxAmount - (parseFloat(discountAmount) || 0);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isConfigured) {
      const invoices = getCachedInvoices();
      const newInvoice = {
        id: `inv-${Date.now()}`,
        invoice_number: invoiceNumber,
        customer_name: customerName,
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        customer_address: customerAddress || '',
        vehicle_no: vehicleNo || '',
        transport: transport || 'ARRANGE',
        invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
        due_date: dueDate || '',
        subtotal,
        tax_rate: activeTaxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        amount_paid: 0,
        balance_due: totalAmount,
        status: 'ISSUED',
        payment_method: paymentMethod,
        notes: notes || '',
        file_size_kb: 5.4, // Micro-PDF size strictly in KB
        items: computedItems
      };

      invoices.unshift(newInvoice);
      saveCachedInvoices(invoices);

      // Auto deduct stock in offline mode
      if (autoDeductStock) {
        for (const it of computedItems) {
          if (it.item_id) {
            await inventoryService.stockOut({
              itemId: it.item_id,
              quantity: it.quantity,
              referenceNumber: invoiceNumber,
              partyName: customerName,
              notes: `Auto-deducted for ${customerName} (${it.pieces} pcs)`
            });
          }
        }
      }

      return { data: newInvoice, error: null };
    }

    // Direct Supabase Insert
    const insertPayload = {
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      invoice_date: invoiceDate || new Date(),
      due_date: dueDate,
      subtotal,
      tax_rate: activeTaxRate,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      amount_paid: 0,
      balance_due: totalAmount,
      status: 'ISSUED',
      payment_method: paymentMethod,
      notes
    };

    const { data: invData, error: invErr } = await supabase
      .from('invoices')
      .insert([insertPayload])
      .select()
      .single();

    if (invErr) return { error: invErr };

    // Insert line items
    const lineItemRows = computedItems.map(it => {
      let displayName = it.item_name;
      if (it.item_description) {
        displayName = `${it.item_name} (${it.item_description})`;
      }
      if (it.pieces && it.total_cft) {
        displayName += ` [${it.pieces} Pcs | ${it.total_cft} CFT]`;
      }

      return {
        invoice_id: invData.id,
        item_id: it.item_id,
        item_name: displayName,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.total_price
      };
    });

    await supabase.from('invoice_items').insert(lineItemRows);

    // Auto deduct stock if needed
    if (autoDeductStock) {
      for (const it of computedItems) {
        if (it.item_id) {
          await inventoryService.stockOut({
            itemId: it.item_id,
            quantity: it.quantity,
            referenceNumber: invoiceNumber,
            partyName: customerName,
            notes: `Stock-out dispatch for ${customerName} (${it.pieces} pcs)`
          });
        }
      }
    }

    invData.items = computedItems;
    invData.vehicle_no = vehicleNo;
    invData.transport = transport;
    return { data: invData, error: null };
  },

  async recordPayment(invoiceId, amount, paymentMethod = 'Bank Transfer') {
    const payVal = parseFloat(amount) || 0;
    if (payVal <= 0) return { error: { message: 'Invalid payment amount' } };

    if (!isConfigured) {
      const invoices = getCachedInvoices();
      const idx = invoices.findIndex(i => i.id === invoiceId);
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
        return { data: invoices[idx], error: null };
      }
      return { error: { message: 'Invoice not found' } };
    }

    const { data: inv, error: fetchErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchErr) return { error: fetchErr };

    const newAmountPaid = Number(inv.amount_paid || 0) + payVal;
    const newBalanceDue = Math.max(0, Number(inv.total_amount) - newAmountPaid);
    const newStatus = newBalanceDue === 0 ? 'PAID' : (newAmountPaid > 0 ? 'PARTIALLY_PAID' : inv.status);

    const { data, error } = await supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus,
        payment_method: paymentMethod,
        updated_at: new Date()
      })
      .eq('id', invoiceId)
      .select()
      .single();

    return { data, error };
  },

  async updateInvoice(invoiceId, updates) {
    if (!isConfigured) {
      const invoices = getCachedInvoices();
      const idx = invoices.findIndex(i => i.id === invoiceId);
      if (idx !== -1) {
        invoices[idx] = { ...invoices[idx], ...updates, updated_at: new Date().toISOString() };
        saveCachedInvoices(invoices);
        return { data: invoices[idx], error: null };
      }
      return { error: { message: 'Invoice not found' } };
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', invoiceId)
      .select()
      .single();
    return { data, error };
  },

  async deleteInvoice(invoiceId) {
    if (!isConfigured) {
      let invoices = getCachedInvoices();
      invoices = invoices.filter(i => i.id !== invoiceId);
      saveCachedInvoices(invoices);
      return { data: { success: true }, error: null };
    }

    // Delete related line items first, then invoice
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
    const { data, error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);
    return { data, error };
  }
};
