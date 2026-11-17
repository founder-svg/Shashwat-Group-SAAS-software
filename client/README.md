# Shashwat Group CRM - Frontend Client (Option A: BaaS)

A modern, responsive, zero-maintenance frontend dashboard built with **React, Vite, and Tailwind CSS**.

Connects directly to **Supabase** (PostgreSQL, Auth, Storage) with ₹0 hosting and zero backend server maintenance.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Add your free Supabase URL and anon key.  
*(Note: If no `.env` is provided, the app automatically runs in **Offline/Demo Mode** with realistic seed data).*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 100% Free Production Deployment (Vercel / Netlify / GitHub Pages)

1. Push this repository to GitHub: `https://github.com/founder-svg/Shashwat-Group-SAAS-software`
2. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) and click **Add New Project**.
3. Select your GitHub repository.
4. Set the Root Directory to `client`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Environment Variables.
6. Click **Deploy** — your live CRM app will be online with a free SSL certificate!
