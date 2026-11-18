import { supabase, isConfigured, initialDemoData } from '../config/supabaseClient';

// Local storage cache for offline demo mode
const LOCAL_STORAGE_KEY = 'shashwat_inventory_cache';
const LOCAL_TRANS_KEY = 'shashwat_transactions_cache';

function getCachedItems() {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      // Filter out any legacy mock demo items
      return parsed.filter(i => !['e1', 'e2', 'e3'].includes(i.id));
    } catch (e) {}
  }
  return [];
}

function saveCachedItems(items) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

function getCachedTransactions() {
  const cached = localStorage.getItem(LOCAL_TRANS_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      return parsed.filter(t => !['t-1', 't-2'].includes(t.id));
    } catch (e) {}
  }
  return [];
}

function saveCachedTransactions(list) {
  localStorage.setItem(LOCAL_TRANS_KEY, JSON.stringify(list));
}

import { parseSpecsFromDescription } from '../utils/woodCalculator';

function enrichItemWithWoodSpecs(item) {
  if (!item) return item;
  if (item.length !== undefined && item.cft !== undefined) return item;
  const parsed = parseSpecsFromDescription(item.description);
  if (parsed) {
    return {
      ...item,
      length: item.length || parsed.length,
      width: item.width || parsed.width,
      thickness: item.thickness || parsed.thickness,
      cft: item.cft || parsed.cft
    };
  }
  return item;
}

export const inventoryService = {
  async getItems() {
    if (!isConfigured) {
      const items = getCachedItems().map(enrichItemWithWoodSpecs);
      return { data: items, error: null };
    }
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });

    const enriched = (data || []).map(enrichItemWithWoodSpecs);
    return { data: enriched, error };
  },

  async addItem(item) {
    // Format description with dimensions spec if available
    let formattedDesc = item.description || '';
    if (item.length && item.width && item.thickness) {
      const specTag = `[Specs: ${item.length}L × ${item.width}W × ${item.thickness}T | ${item.cft || 0} CFT]`;
      if (!formattedDesc.includes('[Specs:')) {
        formattedDesc = formattedDesc ? `${formattedDesc} ${specTag}` : specTag;
      }
    }

    const payload = {
      ...item,
      description: formattedDesc,
      current_stock: Number(item.initial_stock || item.current_stock) || 0,
      cost_price: Number(item.cost_price) || 0,
      selling_price: Number(item.selling_price) || 0,
      min_reorder_level: Number(item.min_reorder_level) || 10
    };

    if (!isConfigured) {
      const items = getCachedItems();
      const newItem = {
        ...payload,
        id: `local-${Date.now()}`
      };
      items.push(newItem);
      saveCachedItems(items);
      return { data: newItem, error: null };
    }

    // Try inserting full payload with wood dimension columns
    let { data, error } = await supabase
      .from('inventory_items')
      .insert([payload])
      .select()
      .single();

    // Fallback if Supabase table doesn't have the new dimension columns yet
    if (error && (error.message?.includes('column') || error.code === '42703')) {
      const standardPayload = {
        sku: payload.sku,
        name: payload.name,
        description: payload.description,
        category: payload.category || 'General',
        item_type: payload.item_type || 'finished_good',
        unit: payload.unit || 'pcs',
        cost_price: payload.cost_price,
        selling_price: payload.selling_price,
        current_stock: payload.current_stock,
        min_reorder_level: payload.min_reorder_level
      };

      const fallbackRes = await supabase
        .from('inventory_items')
        .insert([standardPayload])
        .select()
        .single();

      if (fallbackRes.data) {
        return {
          data: {
            ...fallbackRes.data,
            length: payload.length,
            width: payload.width,
            thickness: payload.thickness,
            cft: payload.cft
          },
          error: null
        };
      }
      return fallbackRes;
    }

    return { data: enrichItemWithWoodSpecs(data), error };
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

  async updateItem(id, updates) {
    let formattedDesc = updates.description || '';
    if (updates.length && updates.width && updates.thickness) {
      const specTag = `[Specs: ${updates.length}L × ${updates.width}W × ${updates.thickness}T | ${updates.cft || 0} CFT]`;
      if (!formattedDesc.includes('[Specs:')) {
        formattedDesc = formattedDesc ? `${formattedDesc} ${specTag}` : specTag;
      }
    }

    const payload = {
      ...updates,
      description: formattedDesc,
      cost_price: Number(updates.cost_price) || 0,
      selling_price: Number(updates.selling_price) || 0,
      min_reorder_level: Number(updates.min_reorder_level) || 10,
      updated_at: new Date()
    };

    if (!isConfigured) {
      const items = getCachedItems();
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...payload };
        saveCachedItems(items);
        return { data: items[idx], error: null };
      }
      return { error: { message: 'Item not found in cache' } };
    }

    // Try updating directly
    let { data, error } = await supabase
      .from('inventory_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error && (error.message?.includes('column') || error.code === '42703')) {
      const cleanPayload = {
        sku: payload.sku,
        name: payload.name,
        description: payload.description,
        category: payload.category || 'General',
        item_type: payload.item_type || 'finished_good',
        unit: payload.unit || 'CFT',
        cost_price: payload.cost_price,
        selling_price: payload.selling_price,
        min_reorder_level: payload.min_reorder_level,
        updated_at: new Date()
      };

      const fallbackRes = await supabase
        .from('inventory_items')
        .update(cleanPayload)
        .eq('id', id)
        .select()
        .single();

      if (fallbackRes.data) {
        return {
          data: {
            ...fallbackRes.data,
            length: payload.length,
            width: payload.width,
            thickness: payload.thickness,
            cft: payload.cft
          },
          error: null
        };
      }
      return fallbackRes;
    }

    return { data: enrichItemWithWoodSpecs(data), error };
  },

  async deleteItem(id) {
    if (!isConfigured) {
      let items = getCachedItems();
      items = items.filter(i => i.id !== id);
      saveCachedItems(items);
      return { data: { success: true }, error: null };
    }
    const { data, error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  async deleteTransaction(id) {
    if (!isConfigured) {
      let list = getCachedTransactions();
      list = list.filter(t => t.id !== id);
      saveCachedTransactions(list);
      return { data: { success: true }, error: null };
    }
    const { data, error } = await supabase
      .from('stock_transactions')
      .delete()
      .eq('id', id);
    return { data, error };
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
