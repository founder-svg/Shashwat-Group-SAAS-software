const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots');
const PDF_PATH = path.resolve(__dirname, 'Shashwat_Group_CRM_Software_Presentation.pdf');
const HTML_PATH = path.resolve(__dirname, 'presentation.html');

const screenshots = [
  {
    file: '01_firm_selection_screen.png',
    title: 'Business Division Gateway',
    subtitle: 'Multi-Firm Enterprise Selection Screen',
    description: 'Allows staff and administrators to select between Shashwat Woods (Specialized Timber & Sawn Logs) and Shashwat Ashapura Woods (Engineered Plywoods, Flush Doors & Architectural Panels). Features isolated accounting, distinct branding, and custom division taglines.',
    highlights: ['Dual-firm multi-tenant architecture', 'Dynamic trade-specific theme accentuation', 'Secure authorized team gateway']
  },
  {
    file: '02_auth_login_portal.png',
    title: 'Secure Access & Operator Authentication',
    subtitle: 'Role-Based Access Control with Email/Gmail Verification',
    description: 'Enterprise operator login portal providing role-specific permissions (Administrator, Accounts Operator, Inventory Manager, Fleet Dispatcher). Supports secure OTP verification and instant authentication.',
    highlights: ['Role-Based Access Control (RBAC)', 'Gmail OTP verification support', 'Integrated division identity header']
  },
  {
    file: '03_dashboard_shashwat_woods.png',
    title: 'Command Center — Shashwat Woods',
    subtitle: '21st.dev Glassy Interface with Sawn Timber Aesthetic',
    description: 'The primary operations command center for Shashwat Woods. Features high-resolution sawn timber background wallpaper, floating ATLAS-style top bar, chromatic AI search orb, live financial metrics in INR currency, fleet status, and real-time ledger stream.',
    highlights: ['High-res sawn timber architectural wallpaper', 'Real-time revenue, stock & fleet metrics', 'Ambient lighting switch (Sun/Moon refraction)']
  },
  {
    file: '04_dashboard_ashapura_woods.png',
    title: 'Command Center — Shashwat Ashapura Woods',
    subtitle: 'Plywood & Architectural Veneer Division Interface',
    description: 'One-click seamless division switching activates the Shashwat Ashapura Woods theme. Displays stacked Baltic birch plywood photography, warm amber-gold rim lighting, Sanskrit motto (|| नीति शतकम् ||), and tailored plywood inventory analytics.',
    highlights: ['Instant 1-click division cross-fade', 'Stacked birch plywood & veneer grain backdrop', 'Dedicated plywood & door inventory metrics']
  },
  {
    file: '05_product_management.png',
    title: 'Product Catalog & Pricing Management',
    subtitle: 'Complete Wood & Plywood Inventory Master',
    description: 'Centralized product repository to configure timber species, plywood grades (BWP/BWR/MR), sheet thicknesses, plank dimensions, and base sales rates. Supports real-time search, category filtering, and item management.',
    highlights: ['Dimension-aware inventory tracking (sq.ft / pieces)', 'Wood grade categorization and rate calculation', 'Full CRUD capabilities with instant updates']
  },
  {
    file: '06_vehicle_fleet_management.png',
    title: 'Vehicle Fleet & Transport Logistics',
    subtitle: 'Delivery Fleet Tracking & Dispatch Control',
    description: 'Manages company delivery trucks, transport contractors, driver contact information, load capacities, and active dispatch status (Available vs. On Route). Connects seamlessly with the billing module for delivery allocations.',
    highlights: ['Vehicle status monitoring (Available, On Route, Inactive)', 'Direct integration with Invoice creation', 'Driver contact and capacity management']
  },
  {
    file: '07_invoice_billing_overview.png',
    title: 'Invoice Billing & Accounts Ledger',
    subtitle: 'Comprehensive Sales Invoices & Payment Tracking',
    description: 'Main billing register displaying all commercial tax invoices, customer names, billing dates, payment statuses (Paid, Partially Paid, Unpaid), balance dues, and one-click actions for WhatsApp PDF dispatch, printing, and editing.',
    highlights: ['Payment status badges and outstanding dues tracking', 'One-click WhatsApp micro-PDF sharing', 'Comprehensive sales analytics with date filtering']
  },
  {
    file: '08_inventory_stock_management.png',
    title: 'Inventory & Stock Balance Management',
    subtitle: 'Inward Receipts, Outward Dispatches & Reorder Alerts',
    description: 'Complete stock control system tracking inward stock receipts (Stock In) and customer dispatches (Stock Out). Features real-time stock balances, supplier references, and instant visual low-stock warning indicators.',
    highlights: ['Unified Stock In & Stock Out transaction log', 'Live stock balance verification', 'Automated minimum reorder level alerts']
  },
  {
    file: '09_cloud_data_storage.png',
    title: 'Secure DATA Cloud Storage Repository',
    subtitle: 'Commercial Documents, Permits & Manifests',
    description: 'Integrated cloud repository for commercial paperwork, transit passes, saw-mill licensing, GST vouchers, and transport receipts. Features drag-and-drop file storage, categorize by division, and instant downloads.',
    highlights: ['Secure multi-file cloud storage', 'File categorisation for commercial paperwork', 'Instant preview and download functionality']
  },
  {
    file: '10_history_vault_audit_trail.png',
    title: 'History Vault & Audit Trail',
    subtitle: '3D Glass Folder Cards + Real-Time Office Hours Entry Counter',
    description: 'Executive audit trail featuring interactive 3D Glass Folder Cards animation. Displays date-filtered operational logs (Today, Yesterday, Choose Date) and a live office hours entry counter showing today\'s activity volume.',
    highlights: ['Interactive 3D Glass Folder Cards animation', 'Date filtering (Today, Yesterday, Custom Date)', 'Live office hours real-time entry counter', 'Comprehensive chronological system audit trail']
  },
  {
    file: '11_invoice_creation_modal.png',
    title: 'Interactive Invoice Creation System',
    subtitle: 'Material & Vehicle Autocomplete Drawers + Auto-Deduct',
    description: 'Streamlined invoice generator featuring intelligent autocomplete drawers. Typing the first letter reveals matching in-stock materials and registered vehicles. Entering quantities automatically calculates sq.ft and totals, and auto-registers a Stock Out dispatch deduction.',
    highlights: ['Material drawer with live stock preview', 'Auto-deduction from Stock In upon dispatch', 'Dynamic L × W × P / 144 timber sq.ft calculations', 'Configurable GST and invoice remarks']
  },
  {
    file: '12_whatsapp_pdf_modal.png',
    title: 'Direct WhatsApp Micro-PDF Dispatch',
    subtitle: 'Ultra-Lightweight (~5.4 KB) Vector Document Sharing',
    description: 'Proprietary micro-PDF generation system creating verified vector attachments under 8 KB. Sends directly to customer WhatsApp with formatted message summaries, eliminating heavy attachments and blank browser screens.',
    highlights: ['Micro-PDF vector generator under 8 KB', 'Pre-formatted commercial WhatsApp message', 'Direct one-tap WhatsApp API integration']
  },
  {
    file: '13_printable_tax_invoice.png',
    title: 'Official Tax Invoice & Packing List Preview',
    subtitle: 'Print-Ready Clean Commercial Document Format',
    description: 'Official tax invoice layout generated directly from the software. Features formal firm branding, GSTIN, division motto, customer billing details, itemized goods description, sq.ft breakdowns, totals in words, and authorized signatory seal.',
    highlights: ['Formal commercial Tax Invoice layout', 'Bilingual company motto and verified credentials', 'Print-ready vector PDF rendering']
  }
];

const screenshotData = screenshots.map((s, idx) => {
  const filePath = path.join(SCREENSHOTS_DIR, s.file);
  const base64 = 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
  return { ...s, index: idx + 1, base64 };
});

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shashwat Group - Commercial SaaS CRM & ERP Presentation</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b132b;
      color: #f1f5f9;
      line-height: 1.4;
    }
    .page {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 12mm 14mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #090e1a;
    }
    .cover-page {
      background: radial-gradient(circle at 80% 20%, #1e3a5f 0%, #0a1128 60%, #050814 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20mm;
    }
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.15);
      padding-bottom: 8mm;
    }
    .brand-title {
      font-size: 28pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .brand-subtitle {
      font-size: 11pt;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 9pt;
      font-weight: 700;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
    }
    .cover-hero {
      margin: 12mm 0;
    }
    .cover-main-title {
      font-size: 34pt;
      font-weight: 900;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 6mm;
    }
    .cover-gradient-text {
      background: linear-gradient(135deg, #f59e0b, #ec4899, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover-desc {
      font-size: 13pt;
      color: #94a3b8;
      max-width: 220mm;
      line-height: 1.6;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6mm;
      margin-top: 6mm;
    }
    .cover-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 5mm;
    }
    .cover-card h4 {
      font-size: 11pt;
      color: #f59e0b;
      margin-bottom: 2mm;
    }
    .cover-card p {
      font-size: 9pt;
      color: #cbd5e1;
    }
    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.15);
      padding-top: 6mm;
      font-size: 9pt;
      color: #64748b;
    }

    /* Content Slide Layout */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 3.5mm;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      padding-bottom: 2.5mm;
    }
    .slide-num {
      font-size: 11pt;
      font-weight: 800;
      color: #f59e0b;
      letter-spacing: 1px;
    }
    .slide-title {
      font-size: 16pt;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
    }
    .slide-subtitle {
      font-size: 9pt;
      font-weight: 600;
      color: #38bdf8;
    }
    .slide-body {
      display: flex;
      gap: 5mm;
      flex: 1;
      min-height: 0;
    }
    .slide-preview-col {
      flex: 2.3;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 2.5mm;
      overflow: hidden;
    }
    .slide-img {
      max-width: 100%;
      max-height: 135mm;
      object-fit: contain;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
    }
    .slide-info-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 4mm;
    }
    .desc-block h5 {
      font-size: 10pt;
      color: #f59e0b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2mm;
    }
    .desc-block p {
      font-size: 9pt;
      color: #cbd5e1;
      line-height: 1.5;
    }
    .highlights-block {
      margin-top: 4mm;
    }
    .highlights-block h5 {
      font-size: 10pt;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2mm;
    }
    .highlights-list {
      list-style: none;
    }
    .highlights-list li {
      font-size: 8.5pt;
      color: #e2e8f0;
      margin-bottom: 1.8mm;
      padding-left: 4.5mm;
      position: relative;
    }
    .highlights-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: 800;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 2.5mm;
      margin-top: 3mm;
      font-size: 8pt;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="page cover-page">
    <div class="cover-header">
      <div>
        <div class="brand-title">SHASHWAT GROUP</div>
        <div class="brand-subtitle">Commercial SaaS ERP & Operations Suite</div>
      </div>
      <div>
        <span class="badge">Official Client Presentation • 2026</span>
      </div>
    </div>

    <div class="cover-hero">
      <div class="cover-main-title">
        Next-Generation <span class="cover-gradient-text">Timber & Plywood</span><br/>
        Commercial Management Suite
      </div>
      <div class="cover-desc">
        A bespoke cloud ERP platform engineered exclusively for high-volume sawn wood planks, teak round logs, engineered marine plywoods, and transport fleet logistics. Featuring our signature 21st.dev Glassy Command Center, dynamic trade-adaptive wallpapers, and WhatsApp micro-PDF dispatch technology.
      </div>
    </div>

    <div class="cover-grid">
      <div class="cover-card">
        <h4>Dual-Division Architecture</h4>
        <p>Unified enterprise hub managing both Shashwat Woods (Timber & Logs) and Shashwat Ashapura Woods (Plywoods & Flush Doors) with isolated ledgers.</p>
      </div>
      <div class="cover-card">
        <h4>Automated Stock Deductions</h4>
        <p>Dispatched materials are automatically calculated in sq.ft and deducted from inward inventory with real-time low-stock reorder indicators.</p>
      </div>
      <div class="cover-card">
        <h4>Direct WhatsApp PDF Dispatch</h4>
        <p>Generates ultra-compact vector PDF tax invoices (under 8 KB) and dispatches directly to customer WhatsApp with formatted message previews.</p>
      </div>
    </div>

    <div class="cover-footer">
      <div>Developed & Engineered by <strong>Wixfox Technologies</strong> (wixfox.com)</div>
      <div>Shashwat Group Enterprise Software Deck • Confidential Client Review</div>
    </div>
  </div>

  <!-- SLIDES FOR EACH INTERFACE -->
  ${screenshotData.map((s) => `
  <div class="page">
    <div class="slide-header">
      <div>
        <div class="slide-title">${s.title}</div>
        <div class="slide-subtitle">${s.subtitle}</div>
      </div>
      <div class="slide-num">PAGE ${s.index < 10 ? '0' + s.index : s.index} / ${screenshotData.length}</div>
    </div>

    <div class="slide-body">
      <div class="slide-preview-col">
        <img class="slide-img" src="${s.base64}" alt="${s.title}" />
      </div>

      <div class="slide-info-col">
        <div>
          <div class="desc-block">
            <h5>Interface Overview</h5>
            <p>${s.description}</p>
          </div>

          <div class="highlights-block">
            <h5>Core Capabilities</h5>
            <ul class="highlights-list">
              ${s.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div style="background: rgba(56,189,248,0.06); border: 1px dashed rgba(56,189,248,0.25); border-radius: 6px; padding: 2.5mm; margin-top: 3mm;">
          <div style="font-size: 7.5pt; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Division Synchronization</div>
          <div style="font-size: 7.5pt; color: #94a3b8; margin-top: 1mm;">
            Real-time synchronization across Billing, Fleet Dispatch, Inventory Stock-Out, and History Vault.
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>Shashwat Group Commercial SaaS Suite • Module Reference: <strong>${s.file.replace('.png','')}</strong></div>
      <div>Confidential Client Presentation Document • Wixfox Technologies</div>
    </div>
  </div>
  `).join('\n')}

</body>
</html>`;

fs.writeFileSync(HTML_PATH, htmlContent, 'utf-8');
console.log('Saved presentation HTML to', HTML_PATH);

console.log('Compiling HTML into High-Resolution PDF via Edge Headless...');
const printProc = spawn(EDGE_PATH, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--print-to-pdf-no-header',
  `--print-to-pdf=${PDF_PATH}`,
  `file:///${HTML_PATH.replace(/\\/g, '/')}`
], { stdio: 'inherit' });

printProc.on('close', code => {
  if (code === 0) {
    const stats = fs.statSync(PDF_PATH);
    console.log('SUCCESS! Presentation PDF generated successfully:');
    console.log(`Path: ${PDF_PATH} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    process.exit(0);
  } else {
    console.error('Edge print process exited with code ' + code);
    process.exit(code);
  }
});
