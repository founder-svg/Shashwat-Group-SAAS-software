import { supabase, isConfigured, initialDemoData } from '../config/supabaseClient';
import { inventoryService } from './inventoryService';

const LOCAL_INVOICE_KEY = 'shashwat_invoices_cache';

function getCachedInvoices() {
  const cached = localStorage.getItem(LOCAL_INVOICE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return initialDemoData.invoices;
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
    return { data, error };
  },

  async createInvoice(invoiceInput) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      invoiceDate,
      dueDate,
      items,
      taxRate = 18,
      discountAmount = 0,
      paymentMethod = 'Bank Transfer',
      notes,
      autoDeductStock = true
    } = invoiceInput;

    // Calculate totals
    let subtotal = 0;
    const computedItems = items.map((it, idx) => {
      const qty = parseFloat(it.quantity) || 1;
      const price = parseFloat(it.unitPrice) || 0;
      const total = qty * price;
      subtotal += total;
      return {
        id: `item-${Date.now()}-${idx}`,
        item_id: it.itemId || null,
        item_name: it.itemName,
        quantity: qty,
        unit_price: price,
        total_price: total
      };
    });

    const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
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
        invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
        due_date: dueDate || '',
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        amount_paid: 0,
        balance_due: totalAmount,
        status: 'ISSUED',
        payment_method: paymentMethod,
        notes: notes || '',
        file_size_kb: 5.8, // Micro-PDF size
        drive_file_url: 'https://drive.google.com',
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
              notes: 'Auto-deducted from sales invoice'
            });
          }
        }
      }

      return { data: newInvoice, error: null };
    }

    // Direct Supabase Insert
    const { data: invData, error: invErr } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        invoice_date: invoiceDate || new Date(),
        due_date: dueDate,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        amount_paid: 0,
        balance_due: totalAmount,
        status: 'ISSUED',
        payment_method: paymentMethod,
        notes
      }])
      .select()
      .single();

    if (invErr) return { error: invErr };

    // Insert line items
    const lineItemRows = computedItems.map(it => ({
      invoice_id: invData.id,
      item_id: it.item_id,
      item_name: it.item_name,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total_price: it.total_price
    }));

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
            notes: 'Auto-deducted from sales invoice'
          });
        }
      }
    }

    return { data: { ...invData, items: computedItems }, error: null };
  },

  async recordPayment(invoiceId, amount, paymentMethod = 'Bank Transfer') {
    const payAmt = parseFloat(amount);

    if (!isConfigured) {
      const invoices = getCachedInvoices();
      const inv = invoices.find(i => i.id === invoiceId);
      if (!inv) return { error: { message: 'Invoice not found' } };

      inv.amount_paid = (parseFloat(inv.amount_paid) || 0) + payAmt;
      inv.balance_due = Math.max(0, parseFloat(inv.total_amount) - inv.amount_paid);
      inv.status = inv.balance_due === 0 ? 'PAID' : 'PARTIALLY_PAID';
      inv.payment_method = paymentMethod;

      saveCachedInvoices(invoices);
      return { data: inv, error: null };
    }

    const { data: inv, error: fetchErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchErr) return { error: fetchErr };

    const newPaid = (parseFloat(inv.amount_paid) || 0) + payAmt;
    const newBalance = Math.max(0, parseFloat(inv.total_amount) - newPaid);
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const { data: updated, error: updateErr } = await supabase
      .from('invoices')
      .update({
        amount_paid: newPaid,
        balance_due: newBalance,
        status: newStatus,
        payment_method: paymentMethod,
        updated_at: new Date()
      })
      .eq('id', invoiceId)
      .select()
      .single();

    return { data: updated, error: updateErr };
  }
};
