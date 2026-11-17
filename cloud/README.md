# Free Cloud Services Integration Guide

Since this project has a tight budget (~35,000 INR), we have architected the system using the best **100% Free Tier** cloud platforms available today.

---

## Free Cloud Stack Summary

| Component | Free Provider | Free Tier Allowance | Purpose in CRM |
|---|---|---|---|
| **Cloud Database** | **Supabase (PostgreSQL)** | 500 MB DB + Auth + Real-time | Multi-tenant SaaS records, leads, pipeline |
| **Alternative DB** | **Neon.tech** | 0.5 GB compute + 3 GB storage | Serverless Postgres backup |
| **Cloud File Storage** | **Cloudinary** | 25 GB storage & bandwidth/mo | Client proposals, PDFs, avatar uploads, photos |
| **Alternative Storage**| **Supabase Storage** | 1 GB storage & 2 GB bandwidth | Internal attachments and contracts |
| **Cloud Backend Host** | **Render.com** | 750 free hours/month (Free Web Service) | Hosting the Node.js REST API |
| **Alternative Host**   | **Vercel / Railway** | Generous monthly free hobby credits | Microservice / Serverless functions |
| **Transactional Email**| **Resend.com** | 3,000 emails/month (100/day) | Lead notifications, deal alerts, password reset |

---

## Storage Provider Switching

To switch storage providers, simply change the `STORAGE_PROVIDER` variable in your `.env`:

```env
# Choose between: 'local', 'cloudinary', or 'supabase'
STORAGE_PROVIDER=cloudinary
```

- When set to `local`: files are stored in `cloud/storage/local_uploads` (no cloud setup needed for local development).
- When set to `cloudinary`: files are stored and served via Cloudinary's global CDN.
- When set to `supabase`: files are uploaded directly to Supabase S3-compatible buckets.
