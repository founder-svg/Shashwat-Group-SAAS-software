const { initDatabase, mockData } = require('../../../database/connection');
const db = initDatabase();

async function getDashboardMetrics(req, res, next) {
  try {
    if (db.isMock) {
      const totalPipelineValue = mockData.deals.reduce((acc, d) => acc + (d.value || 0), 0);
      return res.json({
        success: true,
        data: {
          totalLeads: mockData.leads.length,
          activeDeals: mockData.deals.length,
          pipelineValueINR: totalPipelineValue,
          conversionRatePercent: 28.5,
          topSources: [
            { source: 'Website', count: 12 },
            { source: 'Referral', count: 8 },
            { source: 'Cold Outreach', count: 5 }
          ]
        }
      });
    }

    const leadsCount = await db.query('SELECT COUNT(*) FROM leads');
    const dealsStats = await db.query('SELECT COUNT(*) AS total_deals, COALESCE(SUM(value), 0) AS total_value FROM deals');
    const closedWonStats = await db.query("SELECT COUNT(*) FROM deals WHERE stage = 'Closed Won'");

    const totalLeads = parseInt(leadsCount.rows[0].count, 10);
    const totalDeals = parseInt(dealsStats.rows[0].total_deals, 10);
    const pipelineValue = parseFloat(dealsStats.rows[0].total_value);
    const closedWon = parseInt(closedWonStats.rows[0].count, 10);
    const conversionRate = totalDeals > 0 ? ((closedWon / totalDeals) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalLeads,
        activeDeals: totalDeals,
        pipelineValueINR: pipelineValue,
        conversionRatePercent: Number(conversionRate)
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardMetrics
};
