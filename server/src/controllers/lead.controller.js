const { initDatabase, mockData } = require('../../../database/connection');
const db = initDatabase();

async function getLeads(req, res, next) {
  try {
    const { status, search } = req.query;

    if (db.isMock) {
      let filtered = [...mockData.leads];
      if (status) filtered = filtered.filter(l => l.status.toLowerCase() === status.toLowerCase());
      if (search) filtered = filtered.filter(l => l.first_name.toLowerCase().includes(search.toLowerCase()) || (l.company && l.company.toLowerCase().includes(search.toLowerCase())));
      return res.json({ success: true, count: filtered.length, data: filtered });
    }

    let queryText = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (first_name ILIKE $${params.length} OR company ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC';
    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

async function createLead(req, res, next) {
  try {
    const { firstName, lastName, email, phone, company, designation, source, status, estimatedBudget, notes } = req.body;

    if (!firstName) {
      return res.status(400).json({ success: false, message: 'Lead first name is required' });
    }

    if (db.isMock) {
      const newLead = {
        id: `lead-${Date.now()}`,
        first_name: firstName,
        last_name: lastName || '',
        email,
        phone,
        company,
        designation,
        source: source || 'Website',
        status: status || 'New',
        estimated_budget: estimatedBudget || 0,
        notes,
        created_at: new Date()
      };
      mockData.leads.push(newLead);
      return res.status(201).json({ success: true, message: 'Lead created (Demo Mode)', data: newLead });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const assignedTo = req.user?.id || null;

    const result = await db.query(
      `INSERT INTO leads (organization_id, assigned_to, first_name, last_name, email, phone, company, designation, source, status, estimated_budget, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [orgId, assignedTo, firstName, lastName, email, phone, company, designation, source || 'Website', status || 'New', estimatedBudget || 0, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

async function updateLeadStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    if (db.isMock) {
      const lead = mockData.leads.find(l => l.id === id);
      if (lead) lead.status = status;
      return res.json({ success: true, message: 'Status updated (Demo Mode)', data: lead });
    }

    const result = await db.query(
      'UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({
      success: true,
      message: 'Lead status updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLeads,
  createLead,
  updateLeadStatus
};
