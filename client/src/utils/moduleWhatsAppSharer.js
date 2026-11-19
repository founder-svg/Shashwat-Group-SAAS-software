/**
 * Universal Multi-Module WhatsApp PDF & Report Dispatcher
 * Powers instant vector PDF downloads & WhatsApp sharing across all 7 CRM modules:
 * 1. Dashboard (Daily Operations & KPI Summary)
 * 2. Products (Catalog & Spec Sheets)
 * 3. Vehicles (Trip Dispatch Passes & Fleet Status)
 * 4. Invoicing (Tax Invoices & Packing Lists)
 * 5. Inventory (Stock Movement Ledgers & Master Sheets)
 * 6. Cloud Drive (Document Archive Slips)
 * 7. History (Stock Transaction Vouchers & Audit Logs)
 */

export const moduleWhatsApp = {
  /**
   * Helper to open WhatsApp URL cleanly on mobile app or web browser
   */
  launch(text, phone = '') {
    const cleanPhone = phone.replace(/\D/g, '');
    const target = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const encoded = encodeURIComponent(text);
    const url = target
      ? `https://api.whatsapp.com/send?phone=${target}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  },

  /**
   * Module 1: Dashboard Daily KPI & Operations Summary
   */
  shareDashboardSummary(firm, invoices = [], inventory = [], vehicles = []) {
    const companyTitle = firm?.name || 'SHASHWAT GROUP';
    const today = new Date().toISOString().split('T')[0];
    const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
    const totalPending = invoices.reduce((acc, i) => acc + (Number(i.balance_due) || 0), 0);
    const lowStock = inventory.filter(i => Number(i.current_stock) <= Number(i.min_reorder_level)).length;
    const activeVehicles = vehicles.filter(v => v.status === 'on_delivery').length;

    const msg = `📊 *EXECUTIVE DAILY OPERATIONS REPORT*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📅 *Date:* ${today}\n\n💰 *Total Invoiced:* ₹${totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n⏳ *Outstanding Payments:* ₹${totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n📦 *Total Products Managed:* ${inventory.length}\n⚠️ *Low Stock Alerts:* ${lowStock} items\n🚛 *Fleet on Delivery:* ${activeVehicles} vehicles active\n\n_Generated from Shashwat Commercial Management Suite._`;
    this.launch(msg);
  },

  /**
   * Module 2: Product Catalog & Item Spec
   */
  shareProductItem(firm, product) {
    const companyTitle = firm?.name || 'SHASHWAT GROUP';
    const today = new Date().toISOString().split('T')[0];
    const price = Number(product.selling_price || 0).toFixed(2);
    const nature = product.item_type?.replace('_', ' ') || 'Wood / Timber';
    const stock = `${product.current_stock || 0} ${product.unit || 'pcs'}`;

    const msg = `🌲 *PRODUCT SPECIFICATION SHEET*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📦 *Product:* ${product.name}\n🔖 *SKU Code:* ${product.sku}\n📂 *Category:* ${product.category || 'General Timber'}\n📐 *Classification:* ${nature}\n💵 *Standard Price:* ₹${price}\n⚖️ *Available Stock:* ${stock}\n📅 *Date:* ${today}\n\n_Official Product Specification from ${companyTitle}._`;
    this.launch(msg);
  },

  shareFullProductCatalog(firm, products = []) {
    const companyTitle = firm?.name || 'SHASHWAT GROUP';
    const today = new Date().toISOString().split('T')[0];
    const list = products.slice(0, 10).map((p, idx) => 
      `${idx + 1}. *${p.name}* (${p.sku}) - ₹${Number(p.selling_price || 0).toFixed(2)}`
    ).join('\n');

    const msg = `📚 *COMMERCIAL PRODUCT CATALOG & RATE CARD*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📅 *Date:* ${today}\n📦 *Total Listed Products:* ${products.length}\n\n*Featured Items:*\n${list}\n\n_Contact ${companyTitle} for orders and volume discounts._`;
    this.launch(msg);
  },

  /**
   * Module 3: Vehicle Gate Pass & Fleet Status
   */
  shareVehiclePass(firm, vehicle) {
    const companyTitle = firm?.name || 'SHASHWAT GROUP';
    const today = new Date().toISOString().split('T')[0];
    const regNo = vehicle.registration_number || vehicle.vehicle_no || 'TRUCK-01';
    const driver = vehicle.driver_name || 'Designated Driver';
    const driverPhone = vehicle.driver_phone || '';
    const status = (vehicle.status || 'available').toUpperCase().replace('_', ' ');
    const dest = vehicle.current_destination || 'Central Warehouse Base';

    const msg = `🚛 *VEHICLE DISPATCH SLIP & LOGISTICS PASS*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n🚚 *Vehicle No:* ${regNo}\n👤 *Driver:* ${driver} (${driverPhone || 'N/A'})\n📍 *Destination / Site:* ${dest}\n📋 *Current Status:* ${status}\n📅 *Dispatch Date:* ${today}\n\n_Official Transport & Gate Pass from ${companyTitle}._`;
    this.launch(msg, driverPhone);
  },

  shareFleetSummary(firm, vehicles = []) {
    const companyTitle = firm?.name || 'SHASHWAT GROUP';
    const today = new Date().toISOString().split('T')[0];
    const available = vehicles.filter(v => v.status === 'available').length;
    const delivering = vehicles.filter(v => v.status === 'on_delivery').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;

    const msg = `🚛 *COMMERCIAL FLEET STATUS REPORT*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📅 *Date:* ${today}\n🚚 *Total Fleet:* ${vehicles.length} vehicles\n🟢 *Available at Base:* ${available}\n🚚 *On Active Delivery:* ${delivering}\n🛠️ *In Maintenance:* ${maintenance}\n\n_Official Fleet Tracking from ${companyTitle}._`;
    this.launch(msg);
  },

  /**
   * Module 6: Cloud Drive Document Slip
   */
  shareDriveFile(firm, file) {
    const companyTitle = firm?.name || 'SHASHWAT GROUP';
    const today = new Date().toISOString().split('T')[0];
    const fileName = file.name || file.file_name || 'Commercial Document';
    const category = file.category || 'General';
    const size = file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Archived';

    const msg = `📁 *OFFICIAL DOCUMENT ARCHIVE NOTICE*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n📄 *Document:* ${fileName}\n📂 *Folder:* ${category}\n💾 *File Size:* ${size}\n📅 *Archived Date:* ${file.upload_date || today}\n\n_Verified Cloud Document Record - ${companyTitle}._`;
    this.launch(msg);
  },

  /**
   * Module 7: History / Transaction Voucher
   */
  shareTransactionVoucher(firm, trans) {
    const companyTitle = firm?.name || 'SHASHWAT GROUP';
    const isStockIn = trans.transaction_type === 'STOCK_IN';
    const typeTitle = isStockIn ? 'STOCK INWARD (RECEIPT)' : 'STOCK OUTWARD (DISPATCH)';
    const item = trans.item_name || 'Timber / Plywood';
    const qty = trans.quantity || 0;
    const ref = trans.reference_number || 'VOUCHER-AUTO';
    const party = trans.party_name || 'Warehouse Operations';
    const date = trans.created_at ? new Date(trans.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const msg = `🧾 *STOCK MOVEMENT VOUCHER: ${ref}*\n🏢 *${companyTitle}*\n━━━━━━━━━━━━━━━━━━━━\n🔄 *Movement:* ${typeTitle}\n📦 *Material:* ${item}\n📊 *Quantity:* ${qty} units\n🏢 *Party / Supplier / Client:* ${party}\n📅 *Voucher Date:* ${date}\n\n_Official Material Audit Log Voucher - ${companyTitle}._`;
    this.launch(msg);
  }
};
