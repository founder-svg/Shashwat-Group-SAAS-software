import { supabase, isConfigured, initialDemoData } from '../config/supabaseClient';

// Local storage cache for offline demo mode
const LOCAL_STORAGE_KEY = 'shashwat_inventory_cache';
const LOCAL_TRANS_KEY = 'shashwat_transactions_cache';

function getCachedItems() {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return initialDemoData.inventory;
}

function saveCachedItems(items) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

function getCachedTransactions() {
  const cached = localStorage.getItem(LOCAL_TRANS_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return initialDemoData.transactions;
}

function saveCachedTransactions(list) {
  localStorage.setItem(LOCAL_TRANS_KEY, JSON.stringify(list));
}

export const inventoryService = {
  async getItems() {
    if (!isConfigured) {
      return { data: getCachedItems(), error: null };
    }
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  },

  async addItem(item) {
    if (!isConfigured) {
      const items = getCachedItems();
      const newItem = {
        ...item,
        id: `local-${Date.now()}`,
        current_stock: Number(item.initial_stock) || 0,
        cost_price: Number(item.cost_price) || 0,
        selling_price: Number(item.selling_price) || 0,
        min_reorder_level: Number(item.min_reorder_level) || 10
      };
      items.push(newItem);
      saveCachedItems(items);
      return { data: newItem, error: null };
    }
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([item])
      .select()
      .single();
    return { data, error };
  },

  async stockIn({ itemId, quantity, unitCost, referenceNumber, partyName, notes }) {
    const qty = parseFloat(quantity);

    if (!isConfigured) {
      const items = getCachedItems();
      const item = items.find(i => i.id === itemId);
      if (!item) return { error: { message: 'Item not found' } };

      item.current_stock = Number(item.current_stock) + qty;
      saveCachedItems(items);

      const transList = getCachedTransactions();
      const newTrans = {
        id: `t-${Date.now()}`,
        transaction_type: 'STOCK_IN',
        item_name: item.name,
        quantity: qty,
        unit: item.unit,
        balance_after: item.current_stock,
        reference_number: referenceNumber || `IN-${Date.now().toString().slice(-4)}`,
        party_name: partyName || 'Supplier',
        notes: notes || '',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        voucher_size_kb: 3.6
      };
      transList.unshift(newTrans);
      saveCachedTransactions(transList);

      return { data: { item, transaction: newTrans }, error: null };
    }

    // Direct Supabase RPC or multi-table transaction
    const { data: itemData, error: itemErr } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemErr) return { error: itemErr };

    const newStock = Number(itemData.current_stock) + qty;

    await supabase
      .from('inventory_items')
      .update({ current_stock: newStock, updated_at: new Date() })
      .eq('id', itemId);

    const { data: transData, error: transErr } = await supabase
      .from('stock_transactions')
      .insert([{
        item_id: itemId,
        transaction_type: 'STOCK_IN',
        quantity: qty,
        unit_cost: unitCost || itemData.cost_price,
        total_cost: qty * (unitCost || itemData.cost_price),
        balance_after: newStock,
        reference_number: referenceNumber,
        party_name: partyName,
        notes
      }])
      .select()
      .single();

    return { data: { currentStock: newStock, transaction: transData }, error: transErr };
  },

  async stockOut({ itemId, quantity, referenceNumber, partyName, notes }) {
    const qty = parseFloat(quantity);

    if (!isConfigured) {
      const items = getCachedItems();
      const item = items.find(i => i.id === itemId);
      if (!item) return { error: { message: 'Item not found' } };

      if (Number(item.current_stock) < qty) {
        return { error: { message: `Insufficient stock! Available: ${item.current_stock} ${item.unit}` } };
      }

      item.current_stock = Number(item.current_stock) - qty;
      saveCachedItems(items);

      const transList = getCachedTransactions();
      const newTrans = {
        id: `t-${Date.now()}`,
        transaction_type: 'STOCK_OUT',
        item_name: item.name,
        quantity: qty,
        unit: item.unit,
        balance_after: item.current_stock,
        reference_number: referenceNumber || `OUT-${Date.now().toString().slice(-4)}`,
        party_name: partyName || 'Customer',
        notes: notes || '',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        voucher_size_kb: 4.0
      };
      transList.unshift(newTrans);
      saveCachedTransactions(transList);

      return { data: { item, transaction: newTrans }, error: null };
    }

    const { data: itemData, error: itemErr } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemErr) return { error: itemErr };

    if (Number(itemData.current_stock) < qty) {
      return { error: { message: `Insufficient stock! Available: ${itemData.current_stock} ${itemData.unit}` } };
    }

    const newStock = Number(itemData.current_stock) - qty;

    await supabase
      .from('inventory_items')
      .update({ current_stock: newStock, updated_at: new Date() })
      .eq('id', itemId);

    const { data: transData, error: transErr } = await supabase
      .from('stock_transactions')
      .insert([{
        item_id: itemId,
        transaction_type: 'STOCK_OUT',
        quantity: qty,
        unit_cost: itemData.selling_price,
        total_cost: qty * itemData.selling_price,
        balance_after: newStock,
        reference_number: referenceNumber,
        party_name: partyName,
        notes
      }])
      .select()
      .single();

    return { data: { currentStock: newStock, transaction: transData }, error: transErr };
  },

  async getTransactions() {
    if (!isConfigured) {
      return { data: getCachedTransactions(), error: null };
    }
    const { data, error } = await supabase
      .from('stock_transactions')
      .select('*, inventory_items(name, sku, unit)')
      .order('transaction_date', { ascending: false });
    return { data, error };
  }
};
