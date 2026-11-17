const { initDatabase } = require('../../../database/connection');
const driveManager = require('../../../cloud/drive/driveManager');
const db = initDatabase();

const mockInvoices = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    invoice_number: 'INV-2026-001',
    customer_name: 'Patel Enterprises',
    customer_email: 'vikram@patelenterprises.in',
    customer_phone: '+91-9988776655',
    invoice_date: new Date().toISOString().split('T')[0],
    subtotal: 97500.00,
    tax_rate: 18.00,
    tax_amount: 17550.00,
    total_amount: 115050.00,
    amount_paid: 50000.00,
    balance_due: 65050.00,
    status: 'PARTIALLY_PAID',
    items: [
      {
        item_name: 'Custom Industrial Control Panel 100A',
        quantity: 5,
        unit_price: 19500.00,
        total_price: 97500.00
      }
    ]
  }
];

async function getInvoices(req, res, next) {
  try {
    const { status, search } = req.query;

    if (db.isMock) {
      let list = [...mockInvoices];
      if (status) list = list.filter(i => i.status === status);
      if (search) list = list.filter(i => i.customer_name.toLowerCase().includes(search.toLowerCase()) || i.invoice_number.toLowerCase().includes(search.toLowerCase()));
      return res.json({ success: true, count: list.length, data: list });
    }

    let queryText = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (customer_name ILIKE $${params.length} OR invoice_number ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY invoice_date DESC, created_at DESC';
    const result = await db.query(queryText, params);

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function createInvoice(req, res, next) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      invoiceDate,
      dueDate,
      items, // array of { itemId, itemName, quantity, unitPrice }
      taxRate = 18,
      discountAmount = 0,
      paymentMethod,
      notes,
      autoDeductStock = true
    } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer name and at least one item are required' });
    }

    // Calculate totals
    let subtotal = 0;
    const computedItems = items.map(item => {
      const qty = parseFloat(item.quantity) || 1;
      const price = parseFloat(item.unitPrice) || 0;
      const total = qty * price;
      subtotal += total;
      return {
        ...item,
        quantity: qty,
        unitPrice: price,
        totalPrice: total
      };
    });

    const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
    const totalAmount = subtotal + taxAmount - (parseFloat(discountAmount) || 0);
    const balanceDue = totalAmount;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (db.isMock) {
      const newInvoice = {
        id: `inv-${Date.now()}`,
        invoice_number: invoiceNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
        due_date: dueDate,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        amount_paid: 0,
        balance_due: balanceDue,
        status: 'ISSUED',
        payment_method: paymentMethod || 'Bank Transfer',
        notes,
        items: computedItems
      };
      mockInvoices.unshift(newInvoice);

      return res.status(201).json({
        success: true,
        message: 'Invoice generated successfully (Demo Mode)',
        data: newInvoice
      });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const userId = req.user?.id || null;

    // Insert Invoice
    const invoiceResult = await db.query(
      `INSERT INTO invoices (
        organization_id, created_by, invoice_number, customer_name, customer_email,
        customer_phone, customer_address, invoice_date, due_date, subtotal, tax_rate,
        tax_amount, discount_amount, total_amount, amount_paid, balance_due, status,
        payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0, $15, 'ISSUED', $16, $17)
      RETURNING *`,
      [
        orgId,
        userId,
        invoiceNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        invoiceDate || new Date(),
        dueDate || null,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        balanceDue,
        paymentMethod,
        notes
      ]
    );

    const createdInvoice = invoiceResult.rows[0];

    // Insert Line Items & Auto Deduct Stock if requested
    for (const it of computedItems) {
      await db.query(
        `INSERT INTO invoice_items (invoice_id, item_id, item_name, description, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [createdInvoice.id, it.itemId || null, it.itemName, it.description || '', it.quantity, it.unitPrice, it.totalPrice]
      );

      // Auto deduct stock if item is linked to inventory
      if (autoDeductStock && it.itemId) {
        await db.query(
          'UPDATE inventory_items SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2',
          [it.quantity, it.itemId]
        );

        await db.query(
          `INSERT INTO stock_transactions (organization_id, user_id, item_id, transaction_type, quantity, unit_cost, total_cost, reference_number, party_name, notes)
           VALUES ($1, $2, $3, 'STOCK_OUT', $4, $5, $6, $7, $8, 'Auto-deducted from billing invoice')`,
          [orgId, userId, it.itemId, it.quantity, it.unitPrice, it.totalPrice, invoiceNumber, customerName]
        );
      }
    }

    // Auto-save invoice record to Cloud Drive
    try {
      const invoiceSummary = Buffer.from(JSON.stringify({ ...createdInvoice, items: computedItems }, null, 2));
      const driveUpload = await driveManager.saveInvoiceFile({
        invoiceNumber,
        pdfBuffer: invoiceSummary,
        organizationId: orgId,
        userId,
        invoiceId: createdInvoice.id
      });

      if (driveUpload && driveUpload.webViewLink) {
        await db.query(
          'UPDATE invoices SET cloud_drive_file_id = $1, cloud_drive_url = $2 WHERE id = $3',
          [driveUpload.fileId, driveUpload.webViewLink, createdInvoice.id]
        );
        createdInvoice.cloud_drive_url = driveUpload.webViewLink;
      }
    } catch (driveErr) {
      console.warn('[Drive Sync Warning]:', driveErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Invoice generated and saved to Cloud Drive',
      data: {
        ...createdInvoice,
        items: computedItems
      }
    });
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentAmount, paymentMethod } = req.body;

    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive payment amount required' });
    }

    if (db.isMock) {
      const inv = mockInvoices.find(i => i.id === id);
      if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });

      inv.amount_paid = (parseFloat(inv.amount_paid) || 0) + amt;
      inv.balance_due = Math.max(0, parseFloat(inv.total_amount) - inv.amount_paid);
      inv.status = inv.balance_due === 0 ? 'PAID' : 'PARTIALLY_PAID';
      inv.payment_method = paymentMethod || inv.payment_method;

      return res.json({ success: true, message: `Payment of ₹${amt} recorded`, data: inv });
    }

    const invRes = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invRes.rows[0];
    const newPaid = parseFloat(invoice.amount_paid) + amt;
    const newBalance = Math.max(0, parseFloat(invoice.total_amount) - newPaid);
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const updateRes = await db.query(
      `UPDATE invoices
       SET amount_paid = $1, balance_due = $2, status = $3, payment_method = COALESCE($4, payment_method), updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [newPaid, newBalance, newStatus, paymentMethod, id]
    );

    res.json({
      success: true,
      message: `Payment of ₹${amt} recorded successfully`,
      data: updateRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInvoices,
  createInvoice,
  recordPayment
};
