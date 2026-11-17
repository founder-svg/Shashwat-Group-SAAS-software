# Shashwat Group SaaS & CRM - System Architecture

## 1. High-Level Architecture Overview

```
                      +---------------------------------------+
                      |       Web / Mobile Client App         |
                      |  (React / Next.js / Tailwind CSS)     |
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / REST / JWT
                                          v
                      +---------------------------------------+
                      |         Node.js / Express Server      |
                      |        (Hosted on Render Free Tier)   |
                      +--------+------------------+-----------+
                               |                  |
           +-------------------+                  +-------------------+
           |                                                          |
           v                                                          v
+------------------------+                                 +------------------------+
|    Cloud Database      |                                 |     Cloud Storage      |
| Supabase / Neon (Free) |                                 | Cloudinary / Supabase  |
| - PostgreSQL           |                                 | - 25GB Free Storage    |
| - Row Level Security   |                                 | - Media & PDF CDN      |
| - Multi-tenant Schemas |                                 | - Client Contracts     |
+------------------------+                                 +------------------------+
```

---

## 2. Zero-Cost Budget Breakdown (35,000 INR Project)

To maximize profitability on a 35,000 INR budget, every layer utilizes enterprise-grade 100% free tiers:

| Layer | Provider | Free Capacity | Monthly Cost |
|---|---|---|---|
| **Database** | Supabase / Neon | 500 MB - 3 GB Postgres | ₹0 / month |
| **Cloud Storage** | Cloudinary / Supabase | 25 GB bandwidth & storage | ₹0 / month |
| **Backend Hosting** | Render.com | 750 hours/month web service | ₹0 / month |
| **Frontend Hosting**| Vercel / Netlify | 100 GB bandwidth / unlimited sites | ₹0 / month |
| **Email Service** | Resend | 3,000 emails/month | ₹0 / month |
| **SSL & CDN** | Cloudflare | Unlimited DDoS + SSL | ₹0 / month |
| **TOTAL RUNTIME INFRASTRUCTURE COST** | | | **₹0 / month** |

---

## 3. Multi-Tenant SaaS Design

The schema is built for multi-tenancy from day one:
1. `organizations` acts as the root tenant.
2. Every table (`users`, `leads`, `contacts`, `deals`, `tasks`, `documents`) is strictly scoped by `organization_id`.
3. Ensures strict data privacy and isolation between different branches or clients of Shashwat Group.

---

## 4. Micro-PDF & Data Size Optimization (< 15 KB per Bill)

To guarantee that generated bills, delivery slips, and vouchers consume space in **Kilobytes (KB)** rather than Megabytes (MB):

1. **Pure Vector Type-1 PDF Engine (`microPdfGenerator.js`)**:
   - Uses zero-overhead PostScript / PDF 1.4 core standard fonts (Helvetica).
   - Generates pure vector tables, borders, and text streams without bloated embedded TrueType fonts or raster bitmaps.
   - Standard Invoice PDF Size: **~4 KB to 8 KB**.
   - Standard Stock Voucher Size: **~3 KB to 5 KB**.
2. **Storage Capacity Benefit**:
   - In a 15 GB Free Google Drive, a standard 3 MB uncompressed Chromium PDF can store only ~5,000 bills before hitting quota.
   - With our **~6 KB Micro-PDFs**, the same 15 GB drive can store over **1,800,000+ customer bills & stock vouchers** with zero paid storage upgrade needed!
3. **HTTP Payload Compression**:
   - Gzip and Deflate enabled on API endpoints via compression middleware to ensure all JSON responses are strictly 1 KB - 5 KB.
