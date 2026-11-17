-- ==============================================================================
-- SHASHWAT GROUP SAAS & CRM SOFTWARE - SEED DATA
-- ==============================================================================

-- 1. Insert Default Organization (Shashwat Group)
INSERT INTO organizations (id, name, slug, plan, status)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Shashwat Group HQ',
    'shashwat-group',
    'pro',
    'active'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Default Admin User
-- Default password: Password@123 (bcrypt hash for demo)
INSERT INTO users (id, organization_id, first_name, last_name, email, password_hash, role, phone, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Admin',
    'Shashwat',
    'admin@shashwatgroup.com',
    '$2a$10$7798XGv7QjT532z5dYx9c.d5W20j4nU0cE1dD7Rfs9d2t8082pPsq',
    'superadmin',
    '+91-9876543210',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- 3. Insert Sample Sales Representative
INSERT INTO users (id, organization_id, first_name, last_name, email, password_hash, role, phone, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Rajesh',
    'Sharma',
    'rajesh@shashwatgroup.com',
    '$2a$10$7798XGv7QjT532z5dYx9c.d5W20j4nU0cE1dD7Rfs9d2t8082pPsq',
    'sales_rep',
    '+91-9811223344',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- 4. Insert Initial CRM Leads
INSERT INTO leads (id, organization_id, assigned_to, first_name, last_name, email, phone, company, designation, source, status, estimated_budget, notes)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Vikram',
    'Patel',
    'vikram@patelenterprises.in',
    '+91-9988776655',
    'Patel Enterprises',
    'Managing Director',
    'Website',
    'Qualified',
    150000.00,
    'Interested in full CRM deployment for 25 sales agents.'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Ananya',
    'Deshmukh',
    'ananya@deshmukhlogistics.com',
    '+91-9765432100',
    'Deshmukh Logistics',
    'Operations Head',
    'Referral',
    'Contacted',
    80000.00,
    'Requested demo meeting next Monday.'
);

-- 5. Insert Sample Deals
INSERT INTO deals (id, organization_id, assigned_to, title, value, currency, stage, probability, expected_close_date, notes)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Patel Enterprises Annual SaaS License',
    150000.00,
    'INR',
    'Proposal Sent',
    70,
    CURRENT_DATE + INTERVAL '15 days',
    'Proposal sent via email on 15% discount model.'
);
