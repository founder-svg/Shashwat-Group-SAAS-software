-- ==============================================================================
-- SHASHWAT GROUP SAAS CRM - 1-CLICK SUPABASE SETUP SCRIPT (OPTION A)
-- Copy and paste this entire script into your Supabase SQL Editor and click "RUN"
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table (Multi-tenant SaaS)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Shashwat Group HQ',
    slug VARCHAR(100) UNIQUE NOT NULL DEFAULT 'shashwat-group',
    plan VARCHAR(50) DEFAULT 'pro',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Organization
INSERT INTO organizations (id, name, slug)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Shashwat Group HQ', 'shashwat-group')
ON CONFLICT (slug) DO NOTHING;

-- 3. Inventory & Stock Master Table (Wood & Timber Sizing)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL DEFAULT 'a0000000-0000-0000-0000-000000000001',
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    length NUMERIC(10, 2) DEFAULT 0.00,
    width NUMERIC(10, 2) DEFAULT 0.00,
    thickness NUMERIC(10, 2) DEFAULT 0.00,
    cft NUMERIC(10, 3) DEFAULT 0.000,
    category VARCHAR(100) DEFAULT 'Teak Wood',
    item_type VARCHAR(50) DEFAULT 'finished_good', -- 'raw_material', 'finished_good', 'consumable'
    unit VARCHAR(50) DEFAULT 'CFT', -- 'CFT', 'pcs', 'sqft', 'meter'
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    min_reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quick Alter for existing databases
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS length NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS width NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS thickness NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS cft NUMERIC(10, 3) DEFAULT 0.000;

-- 4. Stock In / Stock Out Movement Logs
CREATE TABLE IF NOT EXISTS stock_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL DEFAULT 'a0000000-0000-0000-0000-000000000001',
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'STOCK_IN', 'STOCK_OUT', 'INPUT', 'OUTPUT'
    quantity NUMERIC(12, 2) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_after NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reference_number VARCHAR(100),
    party_name VARCHAR(255),
    notes TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Invoices & Billing Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL DEFAULT 'a0000000-0000-0000-0000-000000000001',
    invoice_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ISSUED', -- 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    notes TEXT,
    cloud_drive_file_id VARCHAR(255),
    cloud_drive_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Invoice Line Items Table (Wood Pieces & CFT)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    length NUMERIC(10, 2) DEFAULT 0.00,
    width NUMERIC(10, 2) DEFAULT 0.00,
    thickness NUMERIC(10, 2) DEFAULT 0.00,
    cft NUMERIC(10, 3) DEFAULT 0.000,
    pieces NUMERIC(10, 2) DEFAULT 1.00,
    total_cft NUMERIC(12, 3) DEFAULT 0.000,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quick Alter for existing databases
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_description TEXT;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS length NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS width NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS thickness NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS cft NUMERIC(10, 3) DEFAULT 0.000;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS pieces NUMERIC(10, 2) DEFAULT 1.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total_cft NUMERIC(12, 3) DEFAULT 0.000;

-- 7. Cloud Drive Documents Metadata Table
CREATE TABLE IF NOT EXISTS drive_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL DEFAULT 'a0000000-0000-0000-0000-000000000001',
    file_name VARCHAR(255) NOT NULL,
    folder_category VARCHAR(100) DEFAULT 'invoices',
    drive_provider VARCHAR(50) DEFAULT 'google_drive',
    drive_file_id VARCHAR(255),
    web_view_link TEXT,
    file_size_bytes BIGINT DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Vehicle & Fleet Management Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL DEFAULT 'a0000000-0000-0000-0000-000000000001',
    vehicle_number VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'Truck',
    driver_name VARCHAR(150),
    driver_phone VARCHAR(50),
    capacity_kg NUMERIC(10, 2) DEFAULT 1500.00,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'on_delivery', 'maintenance'
    current_destination TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES FOR 5 TEAM MEMBERS
-- Enables secure public/authenticated CRUD access for the commercial dashboard
-- ==============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for team
CREATE POLICY "Allow all operations on organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory_items" ON inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock_transactions" ON stock_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoice_items" ON invoice_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on drive_files" ON drive_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. POPULATE INITIAL SEED DATA
-- ==============================================================================

INSERT INTO inventory_items (id, sku, name, category, item_type, unit, cost_price, selling_price, current_stock, min_reorder_level)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'RM-STEEL-01', 'High-Grade Industrial Steel Sheets', 'Raw Materials', 'raw_material', 'kg', 85.00, 110.00, 1500.00, 300.00),
    ('e0000000-0000-0000-0000-000000000002', 'FG-PANEL-01', 'Custom Industrial Control Panel 100A', 'Electrical & Control', 'finished_good', 'pcs', 12500.00, 19500.00, 45.00, 10.00),
    ('e0000000-0000-0000-0000-000000000003', 'CN-COPPER-01', 'Copper Wiring Spool 50m', 'Consumables', 'consumable', 'box', 1800.00, 2400.00, 8.00, 15.00)
ON CONFLICT DO NOTHING;

INSERT INTO invoices (id, invoice_number, customer_name, customer_email, customer_phone, subtotal, tax_rate, tax_amount, total_amount, amount_paid, balance_due, status, payment_method, notes)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'INV-2026-001', 'Patel Enterprises', 'vikram@patelenterprises.in', '+91-9988776655', 97500.00, 18.00, 17550.00, 115050.00, 50000.00, 65050.00, 'PARTIALLY_PAID', 'Bank Transfer', 'Supply of 5 units Custom Industrial Control Panel 100A')
ON CONFLICT DO NOTHING;

INSERT INTO invoice_items (invoice_id, item_name, quantity, unit_price, total_price)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'Custom Industrial Control Panel 100A', 5.00, 19500.00, 97500.00);

INSERT INTO stock_transactions (transaction_type, item_id, quantity, unit_cost, total_cost, balance_after, reference_number, party_name, notes)
VALUES 
    ('STOCK_IN', 'e0000000-0000-0000-0000-000000000001', 500.00, 85.00, 42500.00, 1500.00, 'PO-2026-089', 'Tata Steel Suppliers', 'Bulk stock input received'),
    ('STOCK_OUT', 'e0000000-0000-0000-0000-000000000002', 5.00, 12500.00, 62500.00, 45.00, 'DISP-2026-012', 'Patel Enterprises', 'Dispatched against Invoice #INV-2026-001');

INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, driver_phone, capacity_kg, status, current_destination, notes)
VALUES
    ('MH-12-SG-8842', 'Eicher 14ft Truck', 'Ramesh Jadhav', '+91-9822334455', 3500.00, 'available', 'Warehouse Base', 'Routine service completed on 12 Nov'),
    ('MH-14-SG-1090', 'Tata Ace Mini Van', 'Sunil Pawar', '+91-9877665544', 1000.00, 'on_delivery', 'Industrial Area Phase 2', 'Dispatching Invoice #INV-2026-001 to Patel Enterprises'),
    ('MH-12-SG-5501', 'Mahindra Bolero Pickup', 'Anil Shinde', '+91-9988112233', 1500.00, 'available', 'Warehouse Base', 'Standby for raw material pickup');
