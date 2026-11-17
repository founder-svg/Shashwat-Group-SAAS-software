-- ==============================================================================
-- SHASHWAT GROUP - INVENTORY, BILLING & STOCK SEED DATA
-- ==============================================================================

-- 1. Insert Inventory Items (Raw Material & Finished Goods)
INSERT INTO inventory_items (id, organization_id, sku, name, description, category, item_type, unit, cost_price, selling_price, current_stock, min_reorder_level)
VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'RM-STEEL-01',
    'High-Grade Industrial Steel Sheets',
    'Raw material input for fabrication and manufacturing',
    'Raw Materials',
    'raw_material',
    'kg',
    85.00,
    110.00,
    1500.00,
    300.00
),
(
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'FG-PANEL-01',
    'Custom Industrial Control Panel 100A',
    'Finished assembled output product ready for client delivery',
    'Electrical & Control',
    'finished_good',
    'pcs',
    12500.00,
    19500.00,
    45.00,
    10.00
),
(
    'e0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'CN-COPPER-01',
    'Copper Wiring Spool 50m',
    'Input wiring consumable for assembly',
    'Consumables',
    'consumable',
    'box',
    1800.00,
    2400.00,
    8.00, -- Low stock trigger for demo
    15.00
) ON CONFLICT DO NOTHING;

-- 2. Insert Stock In / Stock Out Transactions
INSERT INTO stock_transactions (id, organization_id, item_id, transaction_type, quantity, unit_cost, total_cost, balance_after, reference_number, party_name, notes)
VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'STOCK_IN',
    500.00,
    85.00,
    42500.00,
    1500.00,
    'PO-2026-089',
    'Tata Steel Suppliers',
    'Bulk stock input received at warehouse dock 2'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'STOCK_OUT',
    5.00,
    12500.00,
    62500.00,
    45.00,
    'DISP-2026-012',
    'Patel Enterprises',
    'Stock out dispatched against Invoice #INV-2026-001'
) ON CONFLICT DO NOTHING;

-- 3. Insert Sample Customer Invoice
INSERT INTO invoices (id, organization_id, invoice_number, customer_name, customer_email, customer_phone, invoice_date, due_date, subtotal, tax_rate, tax_amount, total_amount, amount_paid, balance_due, status, payment_method, notes)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'INV-2026-001',
    'Patel Enterprises',
    'vikram@patelenterprises.in',
    '+91-9988776655',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '15 days',
    97500.00,
    18.00,
    17550.00,
    115050.00,
    50000.00,
    65050.00,
    'PARTIALLY_PAID',
    'Bank Transfer',
    'Supply and commissioning of 5 units Custom Industrial Control Panel 100A'
) ON CONFLICT DO NOTHING;

-- 4. Insert Invoice Line Item
INSERT INTO invoice_items (invoice_id, item_id, item_name, description, quantity, unit_price, total_price)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'Custom Industrial Control Panel 100A',
    '5 Units with 1-year Shashwat warranty',
    5.00,
    19500.00,
    97500.00
);
