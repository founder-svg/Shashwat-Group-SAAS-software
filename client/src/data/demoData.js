// ==============================================================================
// AUTHENTIC DEMO DATA FOR SHASHWAT GROUP SAAS CRM
// Covers both divisions:
// 1. Shashwat Woods (Specialized Timber, Sawn Wood & Logs)
// 2. Shashwat Ashapura Woods (Engineered Plywoods, Flush Doors, Panels)
// ==============================================================================

export function getTodayYMD(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDemoInventory() {
  return [
    // --------------------------------------------------------------------------
    // SHASHWAT WOODS (TIMBER, SAWN WOOD, ROUND LOGS)
    // --------------------------------------------------------------------------
    {
      id: 'inv-sw-001',
      firm_id: 'shashwat_woods',
      sku: 'SW-TK-001',
      name: 'Teak Sawn Timber Planks (Grade A)',
      description: 'Kiln dried, knot-free architectural grade sawn teak planks for doors & premium furniture.',
      category: 'Teak Wood',
      unit: 'Peace',
      dimensions: '8 ft × 1.5 ft × 2 in',
      length: '8',
      width: '18',
      thickness: '2',
      cft: '2.000',
      current_stock: 1330,
      min_reorder_level: 200,
      unit_price: 1850,
      location: 'Gandhidham Yard A - Section 1',
      created_at: getTodayYMD(10)
    },
    {
      id: 'inv-sw-002',
      firm_id: 'shashwat_woods',
      sku: 'SW-PN-002',
      name: 'Imported Pine Wood Sawn Planks',
      description: 'Lightweight, seasoned European spruce pine wood for packaging and structural partitions.',
      category: 'Pine Wood',
      unit: 'Peace',
      dimensions: '10 ft × 12 in × 1 in',
      length: '10',
      width: '12',
      thickness: '1',
      cft: '0.833',
      current_stock: 2950,
      min_reorder_level: 350,
      unit_price: 680,
      location: 'Gandhidham Yard A - Shed 3',
      created_at: getTodayYMD(10)
    },
    {
      id: 'inv-sw-003',
      firm_id: 'shashwat_woods',
      sku: 'SW-SL-003',
      name: 'Malaysian Sal Wood Beams (Heavy Duty)',
      description: 'Termite-resistant, high-density construction hardwood beams for door frames & roofing.',
      category: 'Hardwood',
      unit: 'Peace',
      dimensions: '12 ft × 5 in × 3 in',
      length: '12',
      width: '5',
      thickness: '3',
      cft: '1.250',
      current_stock: 575,
      min_reorder_level: 100,
      unit_price: 1250,
      location: 'Yard B - Heavy Stacking Bay',
      created_at: getTodayYMD(12)
    },
    {
      id: 'inv-sw-004',
      firm_id: 'shashwat_woods',
      sku: 'SW-MR-004',
      name: 'Red Meranti Timber Rafters',
      description: 'Uniform straight grain reddish timber for window choukhats and interior joinery.',
      category: 'Hardwood',
      unit: 'Peace',
      dimensions: '10 ft × 4 in × 2 in',
      length: '10',
      width: '4',
      thickness: '2',
      cft: '0.556',
      current_stock: 950,
      min_reorder_level: 150,
      unit_price: 920,
      location: 'Yard B - Rafter Bay',
      created_at: getTodayYMD(15)
    },
    {
      id: 'inv-sw-005',
      firm_id: 'shashwat_woods',
      sku: 'SW-LG-005',
      name: 'CP Teak Round Logs (Wholesale Logs)',
      description: 'Forest department certified large girth un-sawn round logs with minimal sapwood.',
      category: 'Round Logs',
      unit: 'Peace',
      dimensions: '15 ft Length × 48 in Girth',
      length: '15',
      width: '48',
      thickness: '48',
      cft: '18.750',
      current_stock: 180,
      min_reorder_level: 30,
      unit_price: 2400,
      location: 'Gandhidham Open Log Yard',
      created_at: getTodayYMD(20)
    },

    // --------------------------------------------------------------------------
    // SHASHWAT ASHAPURA WOODS (PLYWOODS, VENEER, FLUSH DOORS, BLOCKBOARDS)
    // --------------------------------------------------------------------------
    {
      id: 'inv-saw-001',
      firm_id: 'shashwat_ashapura_woods',
      sku: 'SAW-PLY-18M',
      name: 'BWP 710 Marine Grade Plywood (18mm)',
      description: 'Boiling waterproof, phenolic bonded calibrated marine plywood for kitchens & bathrooms.',
      category: 'Marine Plywood (BWP - 710)',
      unit: 'Sheet',
      dimensions: '8×4 ft (18mm)',
      length: '8',
      width: '4',
      thickness: '18mm',
      sqft_per_sheet: 32,
      current_stock: 1600,
      min_reorder_level: 200,
      unit_price: 108, // per sq.ft (₹3,456 per 8x4 sheet)
      sheet_price: 3456,
      location: 'Plywood Warehouse - Rack 101',
      created_at: getTodayYMD(10)
    },
    {
      id: 'inv-saw-002',
      firm_id: 'shashwat_ashapura_woods',
      sku: 'SAW-PLY-12B',
      name: 'BWR Moisture Resistant Plywood (12mm)',
      description: 'Borer and termite proof commercial plywood for bedroom wardrobes and paneling.',
      category: 'Commercial Plywood (BWR)',
      unit: 'Sheet',
      dimensions: '8×4 ft (12mm)',
      length: '8',
      width: '4',
      thickness: '12mm',
      sqft_per_sheet: 32,
      current_stock: 1800,
      min_reorder_level: 250,
      unit_price: 76, // ₹2,432 per sheet
      sheet_price: 2432,
      location: 'Plywood Warehouse - Rack 103',
      created_at: getTodayYMD(10)
    },
    {
      id: 'inv-saw-003',
      firm_id: 'shashwat_ashapura_woods',
      sku: 'SAW-PLY-06MR',
      name: 'MR Commercial Grade Plywood (6mm)',
      description: 'Standard interior grade backing plywood for furniture backs and ceiling paneling.',
      category: 'MR Plywood',
      unit: 'Sheet',
      dimensions: '8×4 ft (6mm)',
      length: '8',
      width: '4',
      thickness: '6mm',
      sqft_per_sheet: 32,
      current_stock: 2100,
      min_reorder_level: 300,
      unit_price: 52, // ₹1,664 per sheet
      sheet_price: 1664,
      location: 'Plywood Warehouse - Rack 105',
      created_at: getTodayYMD(12)
    },
    {
      id: 'inv-saw-004',
      firm_id: 'shashwat_ashapura_woods',
      sku: 'SAW-VEN-04TK',
      name: 'Natural Burma Teak Decorative Veneer (4mm)',
      description: 'High-end architectural crown grain natural wood veneer sheets for luxury interiors.',
      category: 'Decorative Veneer',
      unit: 'Sheet',
      dimensions: '8×4 ft (4mm)',
      length: '8',
      width: '4',
      thickness: '4mm',
      sqft_per_sheet: 32,
      current_stock: 580,
      min_reorder_level: 50,
      unit_price: 165, // ₹5,280 per sheet
      sheet_price: 5280,
      location: 'Veneer Climate Controlled Vault',
      created_at: getTodayYMD(15)
    },
    {
      id: 'inv-saw-005',
      firm_id: 'shashwat_ashapura_woods',
      sku: 'SAW-DOR-32FD',
      name: 'Solid Core Pine Flush Door (32mm)',
      description: 'Chemically treated, seasoned pine timber filler with borer-free face veneer.',
      category: 'Flush Doors',
      unit: 'Peace',
      dimensions: '7 ft × 3 ft × 32mm',
      length: '7',
      width: '3',
      thickness: '32mm',
      sqft_per_sheet: 21,
      current_stock: 260,
      min_reorder_level: 40,
      unit_price: 145, // ₹3,045 per door
      sheet_price: 3045,
      location: 'Doors Bay 2',
      created_at: getTodayYMD(18)
    },
    {
      id: 'inv-saw-006',
      firm_id: 'shashwat_ashapura_woods',
      sku: 'SAW-BLK-19BP',
      name: 'BWP Pine Blockboard (19mm)',
      description: 'Solid seasoned wood batten core, resistant to bending and sagging for long book shelves.',
      category: 'Blockboards',
      unit: 'Sheet',
      dimensions: '8×4 ft (19mm)',
      length: '8',
      width: '4',
      thickness: '19mm',
      sqft_per_sheet: 32,
      current_stock: 650,
      min_reorder_level: 80,
      unit_price: 98, // ₹3,136 per sheet
      sheet_price: 3136,
      location: 'Plywood Warehouse - Rack 108',
      created_at: getTodayYMD(20)
    }
  ];
}

export function getDemoVehicles() {
  return [
    // --------------------------------------------------------------------------
    // SHASHWAT WOODS FLEET
    // --------------------------------------------------------------------------
    {
      id: 'veh-sw-01',
      firm_id: 'shashwat_woods',
      vehicle_number: 'GJ-12-AZ-4821',
      vehicle_type: 'Heavy Truck (Tata 1613)',
      driver_name: 'Ramesh Bhai Rabari',
      driver_phone: '+91 98251 44102',
      capacity_kg: 16000,
      status: 'available',
      current_destination: 'Gandhidham Timber Yard Base',
      notes: 'Timber trailer with heavy-duty side poles for sawn timber and round logs.',
      created_at: getTodayYMD(15)
    },
    {
      id: 'veh-sw-02',
      firm_id: 'shashwat_woods',
      vehicle_number: 'GJ-18-BW-7236',
      vehicle_type: 'Multi-Axle Truck (BharatBenz 2823R)',
      driver_name: 'Vikram Singh Jadeja',
      driver_phone: '+91 99982 77154',
      capacity_kg: 28000,
      status: 'on_delivery',
      current_destination: 'Gandhidham → Ahmedabad GIDC (Delivery in progress)',
      notes: 'En route carrying Teak Sawn Timber consignment (Bill #INV-2026-081).',
      created_at: getTodayYMD(15)
    },
    {
      id: 'veh-sw-03',
      firm_id: 'shashwat_woods',
      vehicle_number: 'GJ-12-CX-3109',
      vehicle_type: 'Pickup (Mahindra Bolero Maxi Truck)',
      driver_name: 'Kanti Bhai Patel',
      driver_phone: '+91 97245 11890',
      capacity_kg: 2500,
      status: 'available',
      current_destination: 'Local Kutch Dispatch Standby',
      notes: 'Fast local transit vehicle for retail furniture makers in Gandhidham & Adipur.',
      created_at: getTodayYMD(20)
    },

    // --------------------------------------------------------------------------
    // SHASHWAT ASHAPURA WOODS FLEET
    // --------------------------------------------------------------------------
    {
      id: 'veh-saw-01',
      firm_id: 'shashwat_ashapura_woods',
      vehicle_number: 'GJ-12-BW-9014',
      vehicle_type: 'Closed Container (Eicher Pro 3015)',
      driver_name: 'Mahendra Bhai Vaghela',
      driver_phone: '+91 94281 33201',
      capacity_kg: 10000,
      status: 'available',
      current_destination: 'Ashapura Plywood Central Depot',
      notes: 'Waterproof enclosed container specially equipped for delicate veneer sheets and flush doors.',
      created_at: getTodayYMD(15)
    },
    {
      id: 'veh-saw-02',
      firm_id: 'shashwat_ashapura_woods',
      vehicle_number: 'GJ-18-AZ-6540',
      vehicle_type: 'Cowl Body Truck (Tata LPT 1918)',
      driver_name: 'Dilip Singh Rathore',
      driver_phone: '+91 98790 55412',
      capacity_kg: 18500,
      status: 'on_delivery',
      current_destination: 'Gandhidham → Rajkot Plywood Market (Delivery in progress)',
      notes: 'Carrying 150 sheets BWP 710 Marine Plywood (Bill #INV-2026-SAW-094).',
      created_at: getTodayYMD(15)
    },
    {
      id: 'veh-saw-03',
      firm_id: 'shashwat_ashapura_woods',
      vehicle_number: 'GJ-12-AY-1892',
      vehicle_type: 'Express LCV (Ashok Leyland Dost+)',
      driver_name: 'Harish Bhai Solanki',
      driver_phone: '+91 97123 44908',
      capacity_kg: 1500,
      status: 'available',
      current_destination: 'Local Retail Dispatch Standby',
      notes: 'Express delivery vehicle for urgent flush door and veneer deliveries.',
      created_at: getTodayYMD(20)
    }
  ];
}

export function getDemoInvoices() {
  const today = getTodayYMD(0);
  const yesterday = getTodayYMD(1);
  const fiveDaysAgo = getTodayYMD(5);
  const tenDaysAgo = getTodayYMD(10);

  return [
    // --------------------------------------------------------------------------
    // SHASHWAT WOODS INVOICES
    // --------------------------------------------------------------------------
    {
      id: 'inv-sw-doc-01',
      firm_id: 'shashwat_woods',
      firm_name: 'SHASHWAT WOODS',
      invoice_number: 'INV-2026-081',
      invoice_date: today,
      customer_name: 'Shree Ram Furniture & Saw Mill',
      customer_phone: '+91 98250 11982',
      customer_email: 'shreeram.furniture.ahm@gmail.com',
      customer_address: 'Plot 42, GIDC Odhav Industrial Estate, Ahmedabad - 382415',
      vehicle_no: 'GJ-18-BW-7236',
      transport: 'SHASHWAT FLEET (BHARATBENZ)',
      payment_method: 'RTGS / Bank Transfer',
      apply_gst: true,
      tax_rate: 18,
      subtotal: 222000,
      tax_amount: 39960,
      total_amount: 261960,
      amount_paid: 261960,
      balance_due: 0,
      status: 'paid',
      file_size_kb: 5.6,
      notes: 'Official Commercial Tax Invoice. Material dispatched in vehicle GJ-18-BW-7236. Delivery terms: FOR Destination.',
      items: [
        {
          id: 'item-sw-1',
          itemName: 'Teak Sawn Timber Planks (Grade A)',
          category: 'Teak Wood',
          unit: 'Peace',
          vehicleNo: 'GJ-18-BW-7236',
          length: '8',
          width: '1.5',
          peace: 120,
          sqft: 120,
          rate: 1850,
          total: 222000,
          description: 'Teak Sawn Timber Planks (Grade A)',
          specific: 'Grade A Kiln Dried'
        }
      ],
      created_at: today
    },
    {
      id: 'inv-sw-doc-02',
      firm_id: 'shashwat_woods',
      firm_name: 'SHASHWAT WOODS',
      invoice_number: 'INV-2026-079',
      invoice_date: yesterday,
      customer_name: 'Ambica Timber & Wood Traders',
      customer_phone: '+91 99988 22109',
      customer_email: 'ambica.timber.surat@yahoo.com',
      customer_address: 'Survey No. 88, Near Sachin GIDC Flyover, Surat, Gujarat - 394230',
      vehicle_no: 'GJ-12-AZ-4821',
      transport: 'SHASHWAT FLEET (TATA 1613)',
      payment_method: 'Cheque / NEFT',
      apply_gst: false,
      tax_rate: 0,
      subtotal: 170000,
      tax_amount: 0,
      total_amount: 170000,
      amount_paid: 100000,
      balance_due: 70000,
      status: 'partial',
      file_size_kb: 5.4,
      notes: 'Delivery Challan & Commercial Bill. Balance payment of ₹70,000 promised within 15 days.',
      items: [
        {
          id: 'item-sw-2',
          itemName: 'Imported Pine Wood Sawn Planks',
          category: 'Pine Wood',
          unit: 'Peace',
          vehicleNo: 'GJ-12-AZ-4821',
          length: '10',
          width: '1',
          peace: 250,
          sqft: 250,
          rate: 680,
          total: 170000,
          description: 'Imported Pine Wood Sawn Planks',
          specific: 'Kiln Dried (KD)'
        }
      ],
      created_at: yesterday
    },
    {
      id: 'inv-sw-doc-03',
      firm_id: 'shashwat_woods',
      firm_name: 'SHASHWAT WOODS',
      invoice_number: 'INV-2026-074',
      invoice_date: fiveDaysAgo,
      customer_name: 'Kutch Heritage Timber Craft',
      customer_phone: '+91 94266 77810',
      customer_address: 'Opp. Jubilee Ground, Bhuj - Kutch 370001',
      vehicle_no: 'GJ-12-CX-3109',
      transport: 'BOLERO PICKUP',
      payment_method: 'Cash / UPI',
      apply_gst: false,
      tax_rate: 0,
      subtotal: 56250,
      tax_amount: 0,
      total_amount: 56250,
      amount_paid: 56250,
      balance_due: 0,
      status: 'paid',
      file_size_kb: 5.2,
      notes: 'Local dispatch delivered and verified by client signature.',
      items: [
        {
          id: 'item-sw-3',
          itemName: 'Malaysian Sal Wood Beams (Heavy Duty)',
          category: 'Hardwood',
          unit: 'Peace',
          vehicleNo: 'GJ-12-CX-3109',
          length: '12',
          width: '5',
          peace: 45,
          sqft: 45,
          rate: 1250,
          total: 56250,
          description: 'Malaysian Sal Wood Beams (Heavy Duty)',
          specific: 'Heavy Construction Grade'
        }
      ],
      created_at: fiveDaysAgo
    },

    // --------------------------------------------------------------------------
    // SHASHWAT ASHAPURA WOODS INVOICES
    // --------------------------------------------------------------------------
    {
      id: 'inv-saw-doc-01',
      firm_id: 'shashwat_ashapura_woods',
      firm_name: 'SHASHWAT ASHAPURA WOODS',
      invoice_number: 'INV-2026-SAW-094',
      invoice_date: today,
      customer_name: 'Marutinandan Plywood & Interior Hardware',
      customer_phone: '+91 97250 88914',
      customer_email: 'marutinandan.ply.rajkot@gmail.com',
      customer_address: '150 Feet Ring Road, Near Big Bazaar, Rajkot, Gujarat - 360005',
      vehicle_no: 'GJ-18-AZ-6540',
      transport: 'SHASHWAT FLEET (TATA LPT 1918)',
      payment_method: 'RTGS Online',
      apply_gst: true,
      tax_rate: 18,
      subtotal: 518400,
      tax_amount: 93312,
      total_amount: 611712,
      amount_paid: 611712,
      balance_due: 0,
      status: 'paid',
      file_size_kb: 5.8,
      notes: 'Tax Invoice cum Delivery Challan. BWP 710 IS:710 verified marine grade plywood sheets.',
      items: [
        {
          id: 'item-saw-1',
          itemName: 'BWP 710 Marine Grade Plywood (18mm)',
          category: 'Marine Plywood (BWP - 710)',
          unit: 'Sheet',
          vehicleNo: 'GJ-18-AZ-6540',
          length: '8',
          width: '4',
          peace: 150,
          sqft: 4800,
          rate: 108,
          total: 518400,
          description: 'BWP 710 Marine Grade Plywood (18mm - 8×4 ft)',
          specific: '18mm BWP 710 Phenolic Calibrated'
        }
      ],
      created_at: today
    },
    {
      id: 'inv-saw-doc-02',
      firm_id: 'shashwat_ashapura_woods',
      firm_name: 'SHASHWAT ASHAPURA WOODS',
      invoice_number: 'INV-2026-SAW-091',
      invoice_date: yesterday,
      customer_name: 'Shreeji Modular Kitchen & Doors',
      customer_phone: '+91 98980 44321',
      customer_email: 'shreeji.kitchens.morbi@gmail.com',
      customer_address: 'Sanala Road, Opp. Sardar Baug, Morbi - 363641',
      vehicle_no: 'GJ-12-BW-9014',
      transport: 'SHASHWAT FLEET (EICHER CONTAINER)',
      payment_method: 'Bank Transfer / Cheque',
      apply_gst: false,
      tax_rate: 0,
      subtotal: 243600,
      tax_amount: 0,
      total_amount: 243600,
      amount_paid: 150000,
      balance_due: 93600,
      status: 'partial',
      file_size_kb: 5.5,
      notes: 'Solid Core Pine Flush Door delivery. Remaining balance of ₹93,600 due on site inspection.',
      items: [
        {
          id: 'item-saw-2',
          itemName: 'Solid Core Pine Flush Door (32mm)',
          category: 'Flush Doors',
          unit: 'Peace',
          vehicleNo: 'GJ-12-BW-9014',
          length: '7',
          width: '3',
          peace: 80,
          sqft: 1680,
          rate: 145,
          total: 243600,
          description: 'Solid Core Pine Flush Door (32mm - 7×3 ft)',
          specific: 'Hardwood Treated Pine Core'
        }
      ],
      created_at: yesterday
    },
    {
      id: 'inv-saw-doc-03',
      firm_id: 'shashwat_ashapura_woods',
      firm_name: 'SHASHWAT ASHAPURA WOODS',
      invoice_number: 'INV-2026-SAW-085',
      invoice_date: tenDaysAgo,
      customer_name: 'Vardhman Designer Veneers & Interiors',
      customer_phone: '+91 94270 33190',
      customer_address: 'Alkapuri Main Commercial Complex, Vadodara - 390007',
      vehicle_no: 'GJ-12-AY-1892',
      transport: 'ASHOK LEYLAND DOST',
      payment_method: 'RTGS',
      apply_gst: true,
      tax_rate: 18,
      subtotal: 211200,
      tax_amount: 38016,
      total_amount: 249216,
      amount_paid: 249216,
      balance_due: 0,
      status: 'paid',
      file_size_kb: 5.5,
      notes: 'Premium natural veneer dispatched in waterproof wrapping. All 40 sheets verified intact.',
      items: [
        {
          id: 'item-saw-3',
          itemName: 'Natural Burma Teak Decorative Veneer (4mm)',
          category: 'Decorative Veneer',
          unit: 'Sheet',
          vehicleNo: 'GJ-12-AY-1892',
          length: '8',
          width: '4',
          peace: 40,
          sqft: 1280,
          rate: 165,
          total: 211200,
          description: 'Natural Burma Teak Decorative Veneer (4mm - 8×4 ft)',
          specific: 'Architectural Crown Cut'
        }
      ],
      created_at: tenDaysAgo
    }
  ];
}

export function getDemoTransactions() {
  const today = getTodayYMD(0);
  const yesterday = getTodayYMD(1);
  const threeDaysAgo = getTodayYMD(3);
  const sevenDaysAgo = getTodayYMD(7);

  return [
    // --------------------------------------------------------------------------
    // SHASHWAT WOODS TRANSACTIONS
    // --------------------------------------------------------------------------
    {
      id: 'trans-sw-01',
      firm_id: 'shashwat_woods',
      transaction_type: 'STOCK_OUT',
      item_name: 'Teak Sawn Timber Planks (Grade A)',
      item_id: 'inv-sw-001',
      quantity: 120,
      unit: 'Peace',
      reference_number: 'INV-2026-081',
      party_name: 'Shree Ram Furniture & Saw Mill',
      vehicle_no: 'GJ-18-BW-7236',
      notes: 'Commercial customer billing dispatch to Ahmedabad.',
      transaction_date: today,
      created_at: today
    },
    {
      id: 'trans-sw-02',
      firm_id: 'shashwat_woods',
      transaction_type: 'STOCK_IN',
      item_name: 'Imported Pine Wood Sawn Planks',
      item_id: 'inv-sw-002',
      quantity: 400,
      unit: 'Peace',
      reference_number: 'PO-KND-992',
      party_name: 'Global Timber Imports Ltd (Kandla Port Terminal)',
      vehicle_no: 'GJ-12-AZ-4821',
      notes: 'Shipment batch #KD-410 received and inspected at Gandhidham yard.',
      transaction_date: today,
      created_at: today
    },
    {
      id: 'trans-sw-03',
      firm_id: 'shashwat_woods',
      transaction_type: 'STOCK_OUT',
      item_name: 'Imported Pine Wood Sawn Planks',
      item_id: 'inv-sw-002',
      quantity: 250,
      unit: 'Peace',
      reference_number: 'INV-2026-079',
      party_name: 'Ambica Timber & Wood Traders (Surat)',
      vehicle_no: 'GJ-12-AZ-4821',
      notes: 'Customer dispatch loading verified on weighbridge.',
      transaction_date: yesterday,
      created_at: yesterday
    },
    {
      id: 'trans-sw-04',
      firm_id: 'shashwat_woods',
      transaction_type: 'STOCK_IN',
      item_name: 'Teak Sawn Timber Planks (Grade A)',
      item_id: 'inv-sw-001',
      quantity: 200,
      unit: 'Peace',
      reference_number: 'PO-MP-412',
      party_name: 'Central Forest Timber Depot (Madhya Pradesh)',
      vehicle_no: 'GJ-18-BW-7236',
      notes: 'Government transit pass TP-7781 verified and logged.',
      transaction_date: threeDaysAgo,
      created_at: threeDaysAgo
    },

    // --------------------------------------------------------------------------
    // SHASHWAT ASHAPURA WOODS TRANSACTIONS
    // --------------------------------------------------------------------------
    {
      id: 'trans-saw-01',
      firm_id: 'shashwat_ashapura_woods',
      transaction_type: 'STOCK_OUT',
      item_name: 'BWP 710 Marine Grade Plywood (18mm)',
      item_id: 'inv-saw-001',
      quantity: 150,
      unit: 'Sheet',
      reference_number: 'INV-2026-SAW-094',
      party_name: 'Marutinandan Plywood & Interior Hardware',
      vehicle_no: 'GJ-18-AZ-6540',
      notes: 'Commercial customer billing dispatch to Rajkot.',
      transaction_date: today,
      created_at: today
    },
    {
      id: 'trans-saw-02',
      firm_id: 'shashwat_ashapura_woods',
      transaction_type: 'STOCK_IN',
      item_name: 'BWP 710 Marine Grade Plywood (18mm)',
      item_id: 'inv-saw-001',
      quantity: 500,
      unit: 'Sheet',
      reference_number: 'PO-PLY-841',
      party_name: 'National Plywood Mills Private Limited',
      vehicle_no: 'GJ-18-AZ-6540',
      notes: 'Direct mill consignment with batch test certificates.',
      transaction_date: today,
      created_at: today
    },
    {
      id: 'trans-saw-03',
      firm_id: 'shashwat_ashapura_woods',
      transaction_type: 'STOCK_OUT',
      item_name: 'Solid Core Pine Flush Door (32mm)',
      item_id: 'inv-saw-005',
      quantity: 80,
      unit: 'Peace',
      reference_number: 'INV-2026-SAW-091',
      party_name: 'Shreeji Modular Kitchen & Doors (Morbi)',
      vehicle_no: 'GJ-12-BW-9014',
      notes: 'Door stack delivery in enclosed container.',
      transaction_date: yesterday,
      created_at: yesterday
    },
    {
      id: 'trans-saw-04',
      firm_id: 'shashwat_ashapura_woods',
      transaction_type: 'STOCK_IN',
      item_name: 'Natural Burma Teak Decorative Veneer (4mm)',
      item_id: 'inv-saw-004',
      quantity: 200,
      unit: 'Sheet',
      reference_number: 'PO-VEN-301',
      party_name: 'Heritage Veneers & Exotic Woods (Mumbai Import)',
      vehicle_no: 'GJ-12-AY-1892',
      notes: 'Climate storage stacking completed in vault.',
      transaction_date: sevenDaysAgo,
      created_at: sevenDaysAgo
    }
  ];
}

export function getDemoDriveFiles() {
  const today = getTodayYMD(0);
  const fiveDaysAgo = getTodayYMD(5);

  return [
    {
      id: 'file-01',
      firm_id: 'shashwat_woods',
      title: 'Forest Department Saw-Mill Transit Permit (Gandhidham 2026)',
      file_name: 'Transit_Pass_Gandhidham_2026.pdf',
      category: 'Legal & Permits',
      file_size_kb: 420,
      uploaded_by: 'Manan (Operations)',
      uploaded_at: today
    },
    {
      id: 'file-02',
      firm_id: 'shashwat_woods',
      title: 'Teak Sawn Timber Consignment e-Way Bill (INV-2026-081)',
      file_name: 'EWay_Bill_INV_081_Ahmedabad.pdf',
      category: 'Tax & Invoices',
      file_size_kb: 185,
      uploaded_by: 'Accounts Team',
      uploaded_at: today
    },
    {
      id: 'file-03',
      firm_id: 'shashwat_ashapura_woods',
      title: 'BWP 710 Marine Plywood BIS Certification & Test Reports',
      file_name: 'BIS_710_Testing_Certificate_SAW.pdf',
      category: 'Quality Certificates',
      file_size_kb: 680,
      uploaded_by: 'Quality Inspection',
      uploaded_at: fiveDaysAgo
    },
    {
      id: 'file-04',
      firm_id: 'shashwat_ashapura_woods',
      title: 'Ashapura Fleet Transit Manifest (GJ-18-AZ-6540)',
      file_name: 'Fleet_Manifest_Rajkot_Delivery.pdf',
      category: 'Logistics',
      file_size_kb: 210,
      uploaded_by: 'Fleet Dispatcher',
      uploaded_at: today
    }
  ];
}
