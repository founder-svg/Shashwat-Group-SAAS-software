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

### Cloud Documents & Attachments
- `POST /api/documents/upload` - Upload file (PDF, contract, ID, image) to Cloud Storage (Cloudinary/Supabase/Local)
- `GET /api/documents` - List uploaded files

### Analytics & Reporting
- `GET /api/analytics/dashboard` - Get high-level KPI metrics (Total Leads, Active Deals, Pipeline Value in INR, Win rate)
