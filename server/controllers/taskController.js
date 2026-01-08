import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/helpers.js';
import { validateEnum, validateRequired } from '../utils/validators.js';

// @desc    Get all tasks
// @route   GET /api/tasks
export const getAllTasks = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { status, priority, task_type, assigned_to } = req.query;

    let queryText = `
    SELECT t.*, a.first_name as assigned_first_name, a.last_name as assigned_last_name
    FROM tasks t LEFT JOIN agents a ON t.assigned_to = a.id WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (status) { queryText += ` AND t.status = $${paramIndex}`; queryParams.push(status); paramIndex++; }
    if (priority) { queryText += ` AND t.priority = $${paramIndex}`; queryParams.push(priority); paramIndex++; }
    if (task_type) { queryText += ` AND t.task_type = $${paramIndex}`; queryParams.push(task_type); paramIndex++; }
    if (assigned_to) { queryText += ` AND t.assigned_to = $${paramIndex}`; queryParams.push(parseInt(assigned_to)); paramIndex++; }

    const countResult = await query(`SELECT COUNT(*) FROM tasks t WHERE 1=1 ${status ? `AND t.status = $1` : ''}`, status ? [status] : []);
    const total = parseInt(countResult.rows[0].count);

    queryText += ` ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, t.due_date ASC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);
    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get task by ID
export const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await query(`SELECT t.*, a.first_name as assigned_first_name, a.last_name as assigned_last_name FROM tasks t LEFT JOIN agents a ON t.assigned_to = a.id WHERE t.id = $1`, [id]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: result.rows[0] });
});

// @desc    Create task
export const createTask = asyncHandler(async (req, res) => {
    const { title, description, task_type, related_to, related_id, assigned_to, due_date, priority } = req.body;
    validateRequired(['title'], req.body);
    if (task_type) validateEnum(task_type, ['follow_up', 'showing', 'document', 'closing'], 'task_type');
    if (priority) validateEnum(priority, ['low', 'medium', 'high', 'urgent'], 'priority');

    const result = await query(
        `INSERT INTO tasks (title, description, task_type, related_to, related_id, assigned_to, due_date, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [title, description || null, task_type || null, related_to || null, related_id || null, assigned_to || null, due_date ? new Date(due_date) : null, priority || 'medium']
    );
    res.status(201).json({ success: true, message: 'Task created successfully', data: result.rows[0] });
});

// @desc    Update task
export const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, task_type, related_to, related_id, assigned_to, due_date, priority, status } = req.body;

    const existingTask = await query('SELECT id FROM tasks WHERE id = $1', [id]);
    if (existingTask.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });

    const result = await query(
        `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), task_type = COALESCE($3, task_type), related_to = COALESCE($4, related_to), related_id = COALESCE($5, related_id), assigned_to = COALESCE($6, assigned_to), due_date = COALESCE($7, due_date), priority = COALESCE($8, priority), status = COALESCE($9, status) WHERE id = $10 RETURNING *`,
        [title, description, task_type, related_to, related_id, assigned_to, due_date ? new Date(due_date) : null, priority, status, id]
    );
    res.json({ success: true, message: 'Task updated successfully', data: result.rows[0] });
});

// @desc    Complete task
export const completeTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await query(`UPDATE tasks SET status = 'completed', completed_at = NOW() WHERE id = $1 AND status = 'pending' RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found or already completed' });
    res.json({ success: true, message: 'Task completed successfully', data: result.rows[0] });
});

// @desc    Delete task
export const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
});

// @desc    Get my tasks
export const getMyTasks = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const agentResult = await query('SELECT id FROM agents WHERE user_id = $1', [req.user.id]);
    if (agentResult.rows.length === 0) return res.json({ success: true, data: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0 } });

    const agentId = agentResult.rows[0].id;
    const countResult = await query('SELECT COUNT(*) FROM tasks WHERE assigned_to = $1', [agentId]);
    const total = parseInt(countResult.rows[0].count);
    const result = await query(`SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, due_date ASC NULLS LAST LIMIT $2 OFFSET $3`, [agentId, limit, offset]);
    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get overdue tasks
export const getOverdueTasks = asyncHandler(async (req, res) => {
    const { assigned_to } = req.query;
    let queryText = `SELECT t.*, a.first_name as assigned_first_name, a.last_name as assigned_last_name FROM tasks t LEFT JOIN agents a ON t.assigned_to = a.id WHERE t.status = 'pending' AND t.due_date < NOW()`;
    const queryParams = [];
    if (assigned_to) { queryText += ` AND t.assigned_to = $1`; queryParams.push(parseInt(assigned_to)); }
    queryText += ` ORDER BY t.due_date ASC`;
    const result = await query(queryText, queryParams);
    res.json({ success: true, data: result.rows, count: result.rows.length });
});
