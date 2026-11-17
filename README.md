# Shashwat Group - SaaS & CRM Software

Enterprise-grade, lightweight, and cost-optimized SaaS CRM platform developed for **Shashwat Group**.

Built from the ground up for zero hosting and database overhead (perfect for budget-conscious commercial deployments under ₹35,000 INR).

---

## 🚀 Repository & Project Details

- **GitHub Repository**: [founder-svg/Shashwat-Group-SAAS-software](https://github.com/founder-svg/Shashwat-Group-SAAS-software)
- **Primary Tech Stack**: Node.js, Express, PostgreSQL (Supabase / Neon), Cloudinary / Supabase Storage, Docker.
- **Budget Strategy**: 100% Free Tier Cloud Architecture (₹0 monthly operational cost).

---

## 📁 Project Directory Structure

```text
├── cloud/                      # Cloud integrations & zero-cost deployment configurations
│   ├── deployment/             # Render blueprint & Docker container configs
│   ├── docs/                   # Step-by-step guides for free tier accounts
│   ├── storage/                # Unified multi-provider cloud storage service
│   │   ├── providers/          # Supabase Storage, Cloudinary, Local Disk
│   │   └── storageService.js   # Cloud file manager interface
│   └── README.md
│
├── database/                   # Database schemas, migrations & connection pool
│   ├── seeds/                  # Initial data for Shashwat Group HQ
│   ├── connection.js           # Multi-provider DB manager (Postgres / Supabase / Mock)
│   ├── schema.sql              # Complete relational schema (Multi-tenant SaaS)
│   └── README.md
│
├── server/                     # Backend REST API Server
│   ├── src/
│   │   ├── config/             # Environment & security config
│   │   ├── controllers/        # Auth, Leads, Deals, Tasks, Documents, Analytics
│   │   ├── middleware/         # JWT auth, RBAC, error handlers
│   │   ├── routes/             # RESTful API endpoints
│   │   └── index.js            # Main application entry point
│   ├── package.json
│   └── README.md
│
├── docs/                       # Architectural blueprints and diagrams
│   └── ARCHITECTURE.md
│
├── .env.example                # Sample environment configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # Main documentation
```

---

## ⚡ Core Features

- **Multi-Tenant SaaS Core**: Support multiple branches, business units, or customer accounts under one roof.
- **Lead & Customer Lifecycle**: Track leads from inbound capture to converted customers with stage tracking and budget estimations.
- **Deals & Pipeline Management**: Visual deal tracking with stages, win probability, deal value in INR, and expected close dates.
- **Cloud Document Storage**: Attach proposals, contracts, customer identity documents directly to deals/leads with Cloudinary or Supabase Storage.
- **Role-Based Access Control (RBAC)**: Superadmin, Manager, and Sales Representative permission levels.
- **Zero-Cost Cloud Deployment**: Ready for one-click deployment on Render.com free web service.

---

## 🛠️ Recommended 100% Free Cloud Tools

| Tool | Provider | Purpose | Free Quota |
|---|---|---|---|
| **Cloud Database** | [Supabase](https://supabase.com) | PostgreSQL Database | 500 MB DB + Auth |
| **Media / File Storage** | [Cloudinary](https://cloudinary.com) | Documents, PDFs, Images | 25 GB bandwidth & storage / month |
| **API Server Hosting** | [Render](https://render.com) | Web Service Hosting | 750 free hours / month |
| **Transactional Email** | [Resend](https://resend.com) | Notifications & Alerts | 3,000 emails / month |

---

## 🏁 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/founder-svg/Shashwat-Group-SAAS-software.git
   cd Shashwat-Group-SAAS-software
   ```

2. **Configure Environment**:
   ```bash
   copy .env.example .env
   ```

3. **Install Server Dependencies & Run**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Verify Health Endpoint**:
   Open [http://localhost:5000/health](http://localhost:5000/health) or [http://localhost:5000](http://localhost:5000) in your browser.
