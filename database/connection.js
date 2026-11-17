/**
 * Database Connection Manager for Shashwat Group CRM
 * Supports:
 *  - Supabase PostgreSQL (100% Free Cloud Database)
 *  - Neon PostgreSQL (100% Free Serverless Postgres)
 *  - Local PostgreSQL / Fallback Mock Mode
 */

const { Pool } = require('pg');

let pool = null;
let isConnected = false;

function initDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.warn('\n⚠️  [DATABASE WARNING] No valid DATABASE_URL found in environment.');
    console.warn('ℹ️  Running in Mock / Memory DB Mode for development.');
    console.warn('ℹ️  To connect free cloud DB, check database/README.md for free Supabase setup.\n');
    return {
      query: mockQuery,
      isMock: true,
      pool: null
    };
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' || connectionString.includes('supabase') || connectionString.includes('neon')
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    pool.on('connect', () => {
      isConnected = true;
      console.log('✅ Connected to Cloud PostgreSQL Database successfully.');
    });

    pool.on('error', (err) => {
      console.error('❌ Unexpected database error on idle client:', err.message);
      isConnected = false;
    });

    return {
      query: (text, params) => pool.query(text, params),
      isMock: false,
      pool
    };
  } catch (err) {
    console.error('❌ Failed to initialize database pool:', err.message);
    return {
      query: mockQuery,
      isMock: true,
      pool: null
    };
  }
}

// In-memory fallback mock for quick testing before cloud db credentials are added
const mockData = {
  users: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      first_name: 'Admin',
      last_name: 'Shashwat',
      email: 'admin@shashwatgroup.com',
      role: 'superadmin',
      is_active: true
    }
  ],
  leads: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      first_name: 'Vikram',
      last_name: 'Patel',
      email: 'vikram@patelenterprises.in',
      phone: '+91-9988776655',
      company: 'Patel Enterprises',
      status: 'Qualified',
      estimated_budget: 150000.00
    }
  ],
  deals: [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      title: 'Patel Enterprises SaaS Contract',
      value: 150000.00,
      currency: 'INR',
      stage: 'Proposal Sent'
    }
  ]
};

async function mockQuery(text, params) {
  console.log(`[Mock DB Query]: ${text.substring(0, 80)}...`);
  return {
    rows: [],
    rowCount: 0
  };
}

module.exports = {
  initDatabase,
  mockData
};
