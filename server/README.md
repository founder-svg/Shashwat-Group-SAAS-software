# Shashwat Group CRM - Server Documentation

The backend server is built using Node.js & Express, structured cleanly for high maintainability and zero hosting cost.

---

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Copy `.env.example` in the project root to `.env` and configure your credentials.

### 3. Start Development Server
```bash
npm run dev
# or
npm start
```
Server runs at `http://localhost:5000`.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new admin/tenant account
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current authenticated user profile

### Leads Management
- `GET /api/leads` - List leads (supports `?status=...` and `?search=...`)
- `POST /api/leads` - Add a new CRM lead
- `PATCH /api/leads/:id/status` - Update lead status (New, Contacted, Qualified, Converted)

### Deals & Pipeline
- `GET /api/deals` - List all deals (supports `?stage=...`)
- `POST /api/deals` - Create deal with budget, probability, and closing date
- `PATCH /api/deals/:id/stage` - Update pipeline stage

### Tasks & Reminders
- `GET /api/tasks` - List tasks sorted by priority and due date
- `POST /api/tasks` - Create task assigned to user/lead/deal

### Inventory & Stock Management (Input / Output)
- `GET /api/inventory/items` - List inventory items (filter by `category`, `itemType`, `lowStockOnly=true`)
- `POST /api/inventory/items` - Add new product / raw material with SKU and reorder level
- `POST /api/inventory/stock-in` - Record Stock In (input/purchase) and increase current balance
- `POST /api/inventory/stock-out` - Record Stock Out (output/dispatch), validates available quantity
- `GET /api/inventory/transactions` - Audit logs of all inputs and outputs

### Billing & Invoicing
- `GET /api/billing/invoices` - List invoices (filter by `status`, `search`)
- `POST /api/billing/invoices` - Generate customer invoice, calculate tax, auto-deduct stock, and auto-sync to Cloud Drive
- `POST /api/billing/invoices/:id/payment` - Record partial or full payment against invoice

### Free Cloud Drive (Google Drive 15GB Free)
- `GET /api/drive/files` - List files in Cloud Drive (filter by `folderCategory: invoices | stock_in | stock_out | reports`)
- `POST /api/drive/upload` - Upload any file directly to Cloud Drive

### Cloud Documents & Attachments
- `POST /api/documents/upload` - Upload file (PDF, contract, ID, image) to Cloud Storage (Cloudinary/Supabase/Local)
- `GET /api/documents` - List uploaded files

### Analytics & Reporting
- `GET /api/analytics/dashboard` - Get high-level KPI metrics (Total Leads, Active Deals, Pipeline Value in INR, Win rate)
