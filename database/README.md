# Shashwat Group CRM - Database Setup Guide

This project is optimized for **zero-cost operation** (budget < 35,000 INR) by using enterprise-grade, generous free-tier cloud databases.

---

## Recommended Free Cloud Databases

### Option 1: Supabase (Recommended)
- **Free Quota**:
  - 500 MB PostgreSQL database
  - 50,000 monthly active users (Auth)
  - 1 GB file storage
  - Built-in REST and real-time APIs
- **Setup in 3 Minutes**:
  1. Go to [https://supabase.com](https://supabase.com) and sign up with GitHub / Google.
  2. Click **New Project** and name it `shashwat-group-crm`.
  3. Set a database password and choose region (e.g., `Mumbai / India (ap-south-1)` for best latency).
  4. Once created, go to **Project Settings** -> **Database** -> **Connection string** (URI).
  5. Copy the connection string and paste it into your `.env`:
     ```env
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```
  6. Go to **SQL Editor** in Supabase dashboard, copy the contents of `database/schema.sql`, and click **Run**.
  7. (Optional) Run `database/seeds/001_seed_data.sql` to populate sample data.

---

### Option 2: Neon Serverless Postgres (Alternative)
- **Free Quota**:
  - 0.5 GB compute, 3 GB storage
  - Branching databases for dev/staging
- **Setup**:
  1. Go to [https://neon.tech](https://neon.tech) and create a free project.
  2. Copy the connection string into `DATABASE_URL` in `.env`.
  3. Execute `database/schema.sql` inside the Neon SQL console.

---

## Schema Overview

- **organizations**: Multi-tenant SaaS structure for Shashwat Group.
- **users**: Team members (Admin, Managers, Sales Reps).
- **leads**: Inbound CRM leads, sources, budget estimates, and lifecycle stages.
- **contacts**: Customer records, company details, phone/email directory.
- **deals**: Sales pipeline stages (Prospecting -> Closed Won) with deal value in INR.
- **activities**: Logs of calls, client meetings, emails, and follow-ups.
- **tasks**: Action items with deadlines, assigned agents, and priority tags.
- **documents**: File attachments mapped to leads/deals stored in Cloud Storage.
