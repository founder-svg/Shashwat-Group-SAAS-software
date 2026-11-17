const { initDatabase, mockData } = require('../../../database/connection');
const db = initDatabase();

async function getDeals(req, res, next) {
  try {
    const { stage } = req.query;

    if (db.isMock) {
      let deals = [...mockData.deals];
      if (stage) deals = deals.filter(d => d.stage.toLowerCase() === stage.toLowerCase());
      return res.json({ success: true, count: deals.length, data: deals });
    }

    let queryText = 'SELECT * FROM deals WHERE 1=1';
    const params = [];

    if (stage) {
      params.push(stage);
      queryText += ` AND stage = $${params.length}`;
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

async function createDeal(req, res, next) {
  try {
    const { title, value, currency, stage, probability, expectedCloseDate, notes, contactId } = req.body;

    if (!title || value === undefined) {
      return res.status(400).json({ success: false, message: 'Deal title and value are required' });
    }

    if (db.isMock) {
      const newDeal = {
        id: `deal-${Date.now()}`,
        title,
        value: Number(value),
        currency: currency || 'INR',
        stage: stage || 'Prospecting',
        probability: probability || 20,
        expected_close_date: expectedCloseDate,
        notes
      };
      mockData.deals.push(newDeal);
      return res.status(201).json({ success: true, message: 'Deal created (Demo Mode)', data: newDeal });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const assignedTo = req.user?.id || null;

    const result = await db.query(
      `INSERT INTO deals (organization_id, contact_id, assigned_to, title, value, currency, stage, probability, expected_close_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [orgId, contactId || null, assignedTo, title, value, currency || 'INR', stage || 'Prospecting', probability || 20, expectedCloseDate || null, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

async function updateDealStage(req, res, next) {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, message: 'Stage is required' });
    }

    if (db.isMock) {
      const deal = mockData.deals.find(d => d.id === id);
      if (deal) deal.stage = stage;
      return res.json({ success: true, message: 'Deal stage updated (Demo Mode)', data: deal });
    }

    const result = await db.query(
      'UPDATE deals SET stage = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [stage, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    res.json({
      success: true,
      message: 'Deal stage updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDeals,
  createDeal,
  updateDealStage
};
