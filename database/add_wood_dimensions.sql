-- ==============================================================================
-- SHASHWAT GROUP SAAS CRM - WOOD & TIMBER DIMENSIONS MIGRATION (CFT & PIECES)
-- Optional: Run in Supabase SQL Editor to add direct dimension columns
-- ==============================================================================

-- 1. Add wood dimension columns to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS length NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS width NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS thickness NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS cft NUMERIC(10, 3) DEFAULT 0.000;

-- 2. Add wood dimensions and pieces to invoice_items
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_description TEXT;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS length NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS width NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS thickness NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS cft NUMERIC(10, 3) DEFAULT 0.000;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS pieces NUMERIC(10, 2) DEFAULT 1.00;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total_cft NUMERIC(12, 3) DEFAULT 0.000;
