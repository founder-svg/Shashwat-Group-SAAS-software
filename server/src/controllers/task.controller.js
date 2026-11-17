const { initDatabase } = require('../../../database/connection');
const db = initDatabase();

const mockTasks = [
  {
    id: 'task-1',
    title: 'Follow up with Patel Enterprises regarding contract',
    priority: 'High',
    status: 'Pending',
    due_date: new Date(Date.now() + 86400000 * 2)
  }
];

async function getTasks(req, res, next) {
  try {
    if (db.isMock) {
      return res.json({ success: true, count: mockTasks.length, data: mockTasks });
    }

    const result = await db.query('SELECT * FROM tasks ORDER BY due_date ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, dueDate, priority, leadId, dealId } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    if (db.isMock) {
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        description,
        due_date: dueDate,
        priority: priority || 'Medium',
        status: 'Pending',
        created_at: new Date()
      };
      mockTasks.push(newTask);
      return res.status(201).json({ success: true, message: 'Task created (Demo Mode)', data: newTask });
    }

    const orgId = req.user?.orgId || 'a0000000-0000-0000-0000-000000000001';
    const assignedTo = req.user?.id || null;

    const result = await db.query(
      `INSERT INTO tasks (organization_id, assigned_to, lead_id, deal_id, title, description, due_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [orgId, assignedTo, leadId || null, dealId || null, title, description, dueDate || null, priority || 'Medium']
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  createTask
};
