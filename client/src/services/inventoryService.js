import { supabase, isConfigured, initialDemoData } from '../config/supabaseClient';

// Local storage cache for offline demo mode
const LOCAL_STORAGE_KEY = 'shashwat_inventory_cache';
const LOCAL_TRANS_KEY = 'shashwat_transactions_cache';

export function getCachedItems() {
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

export function saveCachedItems(items) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export function getCachedTransactions() {
  const cached = localStorage.getItem(LOCAL_TRANS_KEY);
  if (cached) {
    try { 
      const parsed = JSON.parse(cached);
      return parsed.filter(t => !['t-1', 't-2'].includes(t.id));
    } catch (e) {}
  }
  return [];
}

export function saveCachedTransactions(list) {
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
    const cached = getCachedItems().map(enrichItemWithWoodSpecs);
    if (!isConfigured || !supabase) {
      return { data: cached, error: null };
    }
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return { data: cached, error: null };
      }

      const itemMap = new Map();
      cached.forEach(i => itemMap.set(i.id || i.sku, i));
      (data || []).forEach(i => itemMap.set(i.id || i.sku, enrichItemWithWoodSpecs(i)));

      return { data: Array.from(itemMap.values()), error: null };
    } catch (e) {
      return { data: cached, error: null };
    }
  },

  async addItem(item) {
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

    // Always save to local cache first (guarantees immediate visibility)
    const items = getCachedItems();
    const newItem = {
      ...payload,
      id: `local-${Date.now()}`
    };
    items.push(newItem);
    saveCachedItems(items);

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          newItem.id = data.id;
          saveCachedItems(items);
        }
      } catch (e) {
        console.warn('Supabase product sync notice (saved locally):', e);
      }
    }

    return { data: enrichItemWithWoodSpecs(newItem), error: null };
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

  async stockOut({ itemId, itemName, quantity, pieces, unit, vehicleNo, referenceNumber, partyName, notes, allowNegative = true }) {
    const qty = parseFloat(quantity) || 1;

    // 1. ALWAYS UPDATE LOCAL CACHE FIRST
    const items = getCachedItems();
    let item = items.find(i => i.id === itemId);
    if (!item && itemName) {
      item = items.find(i => 
        (i.name && i.name.toLowerCase() === itemName.toLowerCase()) || 
        (i.sku && i.sku.toLowerCase() === itemName.toLowerCase())
      );
    }

    let newStock = 0;
    let effectiveItemName = itemName || 'Stock Material';
    let effectiveUnit = unit || 'pcs';

    if (item) {
      effectiveItemName = item.name;
      effectiveUnit = item.unit || effectiveUnit;
      const currentVal = Number(item.current_stock || 0);
      newStock = allowNegative ? (currentVal - qty) : Math.max(0, currentVal - qty);
      item.current_stock = newStock;
      saveCachedItems(items);
    }

    const transList = getCachedTransactions();
    const newTrans = {
      id: `t-out-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transaction_type: 'STOCK_OUT',
      item_id: item ? item.id : null,
      item_name: effectiveItemName,
      quantity: qty,
      pieces: pieces !== undefined ? pieces : qty,
      unit: effectiveUnit,
      balance_after: newStock,
      reference_number: referenceNumber || `OUT-${Date.now().toString().slice(-4)}`,
      party_name: partyName || 'Customer Dispatch',
      vehicle_no: vehicleNo || '',
      notes: notes || `Dispatched via ${referenceNumber || 'Bill'} to ${partyName || 'Customer'}${vehicleNo ? ` (Vehicle: ${vehicleNo})` : ''}`,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      voucher_size_kb: 4.2
    };
    transList.unshift(newTrans);
    saveCachedTransactions(transList);

    // 2. SYNC TO SUPABASE IF CONFIGURED
    if (isConfigured && supabase && item && item.id && !item.id.startsWith('local-')) {
      try {
        await supabase
          .from('inventory_items')
          .update({ current_stock: newStock, updated_at: new Date() })
          .eq('id', item.id);

        const { data: transData } = await supabase
          .from('stock_transactions')
          .insert([{
            item_id: item.id,
            transaction_type: 'STOCK_OUT',
            quantity: qty,
            unit_cost: item.selling_price || item.cost_price || 0,
            total_cost: qty * (item.selling_price || item.cost_price || 0),
            balance_after: newStock,
            reference_number: referenceNumber,
            party_name: partyName,
            notes: (notes ? `${notes} | ` : '') + (vehicleNo ? `Vehicle: ${vehicleNo}` : '')
          }])
          .select()
          .single();

        if (transData) {
          newTrans.id = transData.id;
          saveCachedTransactions(transList);
        }
      } catch (sbErr) {
        console.warn('Supabase stockOut sync notice (saved locally):', sbErr);
      }
    }

    return { data: { item, transaction: newTrans }, error: null };
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
  },

  getCachedItems,
  saveCachedItems,
  getCachedTransactions,
  saveCachedTransactions
};
