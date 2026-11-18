-- ============================================================================
-- SHASHWAT GROUP ENTERPRISE CRM - FACTORY RESET & DATA PURGE SCRIPT
-- ============================================================================
-- Run this in your Supabase SQL Editor if you want to wipe all demo/sample records
-- and start with a 100% fresh, blank database.
-- ============================================================================

-- 1. Wipe all invoice line items and customer bills
TRUNCATE TABLE invoice_items CASCADE;
TRUNCATE TABLE invoices CASCADE;

-- 2. Wipe all stock transactions and inventory audit history
TRUNCATE TABLE stock_transactions CASCADE;

-- 3. Wipe all product catalog items and timber records
TRUNCATE TABLE inventory_items CASCADE;

-- 4. Wipe all fleet transport and delivery vehicles
TRUNCATE TABLE vehicles CASCADE;

-- 5. Wipe all cloud storage file indexes
TRUNCATE TABLE drive_files CASCADE;

-- ============================================================================
-- Verification: Check that all tables are clean (should return 0 for each)
-- ============================================================================
SELECT 
    (SELECT COUNT(*) FROM inventory_items) AS inventory_count,
    (SELECT COUNT(*) FROM invoices) AS invoices_count,
    (SELECT COUNT(*) FROM invoice_items) AS invoice_items_count,
    (SELECT COUNT(*) FROM stock_transactions) AS stock_transactions_count,
    (SELECT COUNT(*) FROM vehicles) AS vehicles_count,
    (SELECT COUNT(*) FROM drive_files) AS drive_files_count;
