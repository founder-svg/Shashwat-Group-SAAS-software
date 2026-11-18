import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR-PROJECT') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial offline demo seed store (operates smoothly before cloud credentials are pasted)
export const initialDemoData = {
  inventory: [
    {
      id: 'e1',
      sku: 'SW-TEAK-1001',
      name: 'Teak Sawn Timber Planks (Sagwan)',
      description: 'Kiln-dried seasoned grade-A teak timber for doors and furniture [Specs: 10L × 4W × 2T | 0.556 CFT]',
      length: 10,
      width: 4,
      thickness: 2,
      cft: 0.556,
      category: 'Teak Wood',
      item_type: 'finished_good',
      unit: 'CFT',
      cost_price: 1850.00,
      selling_price: 2400.00,
      current_stock: 450.00,
      min_reorder_level: 50.00
    },
    {
      id: 'e2',
      sku: 'SW-PINE-2002',
      name: 'Pine Seasoned Wood Battens',
      description: 'Clean planed pine battens for packaging and construction [Specs: 8L × 3W × 1.5T | 0.250 CFT]',
      length: 8,
      width: 3,
      thickness: 1.5,
      cft: 0.250,
      category: 'Pine Wood',
      item_type: 'finished_good',
      unit: 'CFT',
      cost_price: 650.00,
      selling_price: 890.00,
      current_stock: 1200.00,
      min_reorder_level: 200.00
    },
    {
      id: 'e3',
      sku: 'SW-SAL-3003',
      name: 'Sal Hardwood Heavy Beams',
      description: 'Heavy load-bearing untreated sal timber logs [Specs: 12L × 6W × 4T | 2.000 CFT]',
      length: 12,
      width: 6,
      thickness: 4,
      cft: 2.000,
      category: 'Sal Wood',
      item_type: 'raw_material',
      unit: 'CFT',
      cost_price: 1200.00,
      selling_price: 1650.00,
      current_stock: 280.00,
      min_reorder_level: 40.00
    }
  ],
  invoices: [
    {
      id: 'inv-1',
      invoice_number: 'INV-2026-001',
      customer_name: 'Patel Enterprises',
      customer_email: 'vikram@patelenterprises.in',
      customer_phone: '+91-9988776655',
      invoice_date: '2026-11-17',
      due_date: '2026-12-02',
      subtotal: 97500.00,
      tax_rate: 18.00,
      tax_amount: 17550.00,
      total_amount: 115050.00,
      amount_paid: 50000.00,
      balance_due: 65050.00,
      status: 'PARTIALLY_PAID',
      payment_method: 'Bank Transfer',
      notes: 'Supply and commissioning of 5 units Custom Industrial Control Panel 100A',
      drive_file_url: 'https://drive.google.com',
      file_size_kb: 5.4,
      items: [
        {
          id: 'item-1',
          item_name: 'Custom Industrial Control Panel 100A',
          quantity: 5,
          unit_price: 19500.00,
          total_price: 97500.00
        }
      ]
    }
  ],
  transactions: [
    {
      id: 't-1',
      transaction_type: 'STOCK_IN',
      item_name: 'High-Grade Industrial Steel Sheets',
      quantity: 500.00,
      unit: 'kg',
      balance_after: 1500.00,
      reference_number: 'PO-2026-089',
      party_name: 'Tata Steel Suppliers',
      notes: 'Bulk stock input received at warehouse dock 2',
      created_at: '2026-11-17 14:30',
      voucher_size_kb: 3.8
    },
    {
      id: 't-2',
      transaction_type: 'STOCK_OUT',
      item_name: 'Custom Industrial Control Panel 100A',
      quantity: 5.00,
      unit: 'pcs',
      balance_after: 45.00,
      reference_number: 'DISP-2026-012',
      party_name: 'Patel Enterprises',
      notes: 'Dispatched against Invoice #INV-2026-001',
      created_at: '2026-11-17 17:15',
      voucher_size_kb: 4.1
    }
  ],
  driveFiles: [
    {
      id: 'df-1',
      file_name: 'Invoice_INV-2026-001.pdf',
      folder_category: 'Invoices',
      file_size_kb: 5.4,
      created_at: '2026-11-17 17:15',
      web_view_link: 'https://drive.google.com'
    },
    {
      id: 'df-2',
      file_name: 'Voucher_STOCK_IN_PO-2026-089.pdf',
      folder_category: 'Stock-In-Vouchers',
      file_size_kb: 3.8,
      created_at: '2026-11-17 14:30',
      web_view_link: 'https://drive.google.com'
    },
    {
      id: 'df-3',
      file_name: 'Voucher_STOCK_OUT_DISP-2026-012.pdf',
      folder_category: 'Stock-Out-Dispatches',
      file_size_kb: 4.1,
      created_at: '2026-11-17 17:15',
      web_view_link: 'https://drive.google.com'
    }
  ],
  vehicles: [
    {
      id: 'v-1',
      vehicle_number: 'MH-12-SG-8842',
      vehicle_type: 'Eicher 14ft Truck',
      driver_name: 'Ramesh Jadhav',
      driver_phone: '+91-9822334455',
      capacity_kg: 3500.00,
      status: 'available',
      current_destination: 'Warehouse Base',
      notes: 'Routine service completed on 12 Nov'
    },
    {
      id: 'v-2',
      vehicle_number: 'MH-14-SG-1090',
      vehicle_type: 'Tata Ace Mini Van',
      driver_name: 'Sunil Pawar',
      driver_phone: '+91-9877665544',
      capacity_kg: 1000.00,
      status: 'on_delivery',
      current_destination: 'Industrial Area Phase 2',
      notes: 'Dispatching Invoice #INV-2026-001 to Patel Enterprises'
    },
    {
      id: 'v-3',
      vehicle_number: 'MH-12-SG-5501',
      vehicle_type: 'Mahindra Bolero Pickup',
      driver_name: 'Anil Shinde',
      driver_phone: '+91-9988112233',
      capacity_kg: 1500.00,
      status: 'available',
      current_destination: 'Warehouse Base',
      notes: 'Standby for raw material input pickup'
    }
  ]
};
