const { initDatabase, mockData } = require('../../../database/connection');
const driveManager = require('../../../cloud/drive/driveManager');
const db = initDatabase();

// In-memory mock store for inventory if offline
const mockInventory = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    sku: 'RM-STEEL-01',
    name: 'High-Grade Industrial Steel Sheets',
    category: 'Raw Materials',
    item_type: 'raw_material',
    unit: 'kg',
    cost_price: 85.00,
    selling_price: 110.00,
    current_stock: 1500.00,
    min_reorder_level: 300.00
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    sku: 'FG-PANEL-01',
    name: 'Custom Industrial Control Panel 100A',
    category: 'Electrical & Control',
    item_type: 'finished_good',
    unit: 'pcs',
    cost_price: 12500.00,
    selling_price: 19500.00,
    current_stock: 45.00,
    min_reorder_level: 10.00
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    sku: 'CN-COPPER-01',
    name: 'Copper Wiring Spool 50m',
    category: 'Consumables',
    item_type: 'consumable',
    unit: 'box',
    cost_price: 1800.00,
    selling_price: 2400.00,
    current_stock: 8.00,
    min_reorder_level: 15.00
  }
];

const mockStockTransactions = [];

async function getInventoryItems(req, res, next) {
  try {
    const { category, itemType, search, lowStockOnly } = req.query;

    if (db.isMock) {
      let items = [...mockInventory];
      if (category) items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
      if (itemType) items = items.filter(i => i.item_type.toLowerCase() === itemType.toLowerCase());
      if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
      if (lowStockOnly === 'true') items = items.filter(i => Number(i.current_stock) <= Number(i.min_reorder_level));

      return res.json({ success: true, count: items.length, data: items });
    }

    let queryText = 'SELECT * FROM inventory_items WHERE is_active = TRUE';
    const params = [];

    if (category) {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }

    if (itemType) {
      params.push(itemType);
      queryText += ` AND item_type = $${params.length}`;
    }

    if (lowStockOnly === 'true') {
      queryText += ' AND current_stock <= min_reorder_level';
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (name ILIKE $${params.length} OR sku ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY name ASC';
    const result = await db.query(queryText, params);

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function createInventoryItem(req, res, next) {
  try {
    const { sku, name, description, category, itemType, unit, costPrice, sellingPrice, initialStock, minReorderLevel } = req.body;

    if (!sku || !name) {
      return res.status(400).json({ success: false, message: 'SKU and product name are required' });
    }

    if (db.isMock) {
      const newItem = {
        id: `item-${Date.now()}`,
        sku,
        name,
        description: description || '',
        category: category || 'General',
        item_type: itemType || 'finished_good',
        unit: unit || 'pcs',
        cost_price: Number(costPrice) || 0,
        selling_price: Number(sellingPrice) || 0,
        current_stock: Number(initialStock) || 0,
        min_reorder_level: Number(minReorderLevel) || 10
      };
      mockInventory.push(newItem);
      return res.status(201).json({ success: true, message: 'Item created successfully (Demo Mode)', data: newItem });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';

    const result = await db.query(
      `INSERT INTO inventory_items (organization_id, sku, name, description, category, item_type, unit, cost_price, selling_price, current_stock, min_reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [orgId, sku, name, description, category || 'General', itemType || 'finished_good', unit || 'pcs', costPrice || 0, sellingPrice || 0, initialStock || 0, minReorderLevel || 10]
    );

    res.status(201).json({ success: true, message: 'Item created successfully', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function handleStockIn(req, res, next) {
  try {
    const { itemId, quantity, unitCost, referenceNumber, partyName, batchLotNumber, notes } = req.body;

    const qty = parseFloat(quantity);
    if (!itemId || !qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid itemId and positive quantity are required' });
    }

    if (db.isMock) {
      const item = mockInventory.find(i => i.id === itemId);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      item.current_stock = Number(item.current_stock) + qty;
      const trans = {
        id: `trans-${Date.now()}`,
        item_id: itemId,
        transaction_type: 'STOCK_IN',
        quantity: qty,
        unit_cost: unitCost || item.cost_price,
        total_cost: qty * (unitCost || item.cost_price),
        balance_after: item.current_stock,
        reference_number: referenceNumber || `IN-${Date.now()}`,
        party_name: partyName || 'Supplier',
        notes,
        transaction_date: new Date()
      };
      mockStockTransactions.unshift(trans);

      return res.status(201).json({
        success: true,
        message: `Stock IN recorded: +${qty} ${item.unit}. New balance: ${item.current_stock}`,
        transaction: trans,
        item
      });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const userId = req.user?.id || null;

    // Get current item stock
    const itemRes = await db.query('SELECT * FROM inventory_items WHERE id = $1 AND organization_id = $2', [itemId, orgId]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const currentItem = itemRes.rows[0];
    const newStock = parseFloat(currentItem.current_stock) + qty;
    const cost = parseFloat(unitCost || currentItem.cost_price);
    const totalCost = qty * cost;

    // Update item stock
    await db.query(
      'UPDATE inventory_items SET current_stock = $1, cost_price = $2, updated_at = NOW() WHERE id = $3',
      [newStock, cost, itemId]
    );

    // Record stock transaction
    const transResult = await db.query(
      `INSERT INTO stock_transactions (organization_id, user_id, item_id, transaction_type, quantity, unit_cost, total_cost, balance_after, reference_number, batch_lot_number, party_name, notes)
       VALUES ($1, $2, $3, 'STOCK_IN', $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [orgId, userId, itemId, qty, cost, totalCost, newStock, referenceNumber, batchLotNumber, partyName, notes]
    );

    res.status(201).json({
      success: true,
      message: `Stock In recorded successfully: +${qty} ${currentItem.unit}. Current stock is now ${newStock}`,
      transaction: transResult.rows[0],
      currentStock: newStock
    });
  } catch (err) {
    next(err);
  }
}

async function handleStockOut(req, res, next) {
  try {
    const { itemId, quantity, referenceNumber, partyName, notes } = req.body;

    const qty = parseFloat(quantity);
    if (!itemId || !qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid itemId and positive quantity are required' });
    }

    if (db.isMock) {
      const item = mockInventory.find(i => i.id === itemId);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      if (Number(item.current_stock) < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Requested: ${qty}, Available: ${item.current_stock}`
        });
      }

      item.current_stock = Number(item.current_stock) - qty;
      const trans = {
        id: `trans-${Date.now()}`,
        item_id: itemId,
        transaction_type: 'STOCK_OUT',
        quantity: qty,
        unit_cost: item.selling_price,
        total_cost: qty * item.selling_price,
        balance_after: item.current_stock,
        reference_number: referenceNumber || `OUT-${Date.now()}`,
        party_name: partyName || 'Customer',
        notes,
        transaction_date: new Date()
      };
      mockStockTransactions.unshift(trans);

      return res.status(201).json({
        success: true,
        message: `Stock OUT recorded: -${qty} ${item.unit}. Remaining balance: ${item.current_stock}`,
        transaction: trans,
        item
      });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const userId = req.user?.id || null;

    const itemRes = await db.query('SELECT * FROM inventory_items WHERE id = $1 AND organization_id = $2', [itemId, orgId]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const currentItem = itemRes.rows[0];
    const available = parseFloat(currentItem.current_stock);

    if (available < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Available: ${available} ${currentItem.unit}, Requested: ${qty} ${currentItem.unit}`
      });
    }

    const newStock = available - qty;
    const price = parseFloat(currentItem.selling_price);
    const totalAmount = qty * price;

    await db.query(
      'UPDATE inventory_items SET current_stock = $1, updated_at = NOW() WHERE id = $2',
      [newStock, itemId]
    );

    const transResult = await db.query(
      `INSERT INTO stock_transactions (organization_id, user_id, item_id, transaction_type, quantity, unit_cost, total_cost, balance_after, reference_number, party_name, notes)
       VALUES ($1, $2, $3, 'STOCK_OUT', $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [orgId, userId, itemId, qty, price, totalAmount, newStock, referenceNumber, partyName, notes]
    );

    res.status(201).json({
      success: true,
      message: `Stock Out recorded: -${qty} ${currentItem.unit}. Remaining balance is now ${newStock}`,
      transaction: transResult.rows[0],
      currentStock: newStock
    });
  } catch (err) {
    next(err);
  }
}

async function getStockTransactions(req, res, next) {
  try {
    const { type, itemId } = req.query;

    if (db.isMock) {
      let list = [...mockStockTransactions];
      if (type) list = list.filter(t => t.transaction_type === type);
      if (itemId) list = list.filter(t => t.item_id === itemId);
      return res.json({ success: true, count: list.length, data: list });
    }

    let queryText = `
      SELECT st.*, ii.name AS item_name, ii.sku, ii.unit
      FROM stock_transactions st
      JOIN inventory_items ii ON st.item_id = ii.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      params.push(type);
      queryText += ` AND st.transaction_type = $${params.length}`;
    }

    if (itemId) {
      params.push(itemId);
      queryText += ` AND st.item_id = $${params.length}`;
    }

    queryText += ' ORDER BY st.transaction_date DESC LIMIT 100';
    const result = await db.query(queryText, params);

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInventoryItems,
  createInventoryItem,
  handleStockIn,
  handleStockOut,
  getStockTransactions
};
