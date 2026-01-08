import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/helpers.js';
import { isValidEmail, validateEnum } from '../utils/validators.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { role, search } = req.query;

    let queryText = `
    SELECT id, email, role, created_at, updated_at 
    FROM users
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (role) {
        queryText += ` AND role = $${paramIndex}`;
        queryParams.push(role);
        paramIndex++;
    }

    if (search) {
        queryText += ` AND email ILIKE $${paramIndex}`;
        queryParams.push(`%${search}%`);
        paramIndex++;
    }

    // Get total count
    const countResult = await query(
        `SELECT COUNT(*) FROM users WHERE 1=1 ${role ? `AND role = $1` : ''} ${search ? `AND email ILIKE $${role ? 2 : 1}` : ''}`,
        role && search ? [role, `%${search}%`] : role ? [role] : search ? [`%${search}%`] : []
    );
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `SELECT id, email, role, created_at, updated_at 
     FROM users WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const user = result.rows[0];

    // Get agent info if exists
    const agentResult = await query(
        `SELECT id, first_name, last_name, phone, license_number, 
            commission_rate, territory, hire_date, status, photo_url
     FROM agents WHERE user_id = $1`,
        [id]
    );

    res.json({
        success: true,
        data: {
            ...user,
            agent: agentResult.rows[0] || null
        }
    });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, role, password } = req.body;

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE id = $1', [id]);

    if (existingUser.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (email) {
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        updates.push(`email = $${paramIndex}`);
        values.push(email.toLowerCase());
        paramIndex++;
    }

    if (role) {
        validateEnum(role, ['admin', 'agent', 'manager'], 'role');
        updates.push(`role = $${paramIndex}`);
        values.push(role);
        paramIndex++;
    }

    if (password) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        updates.push(`password_hash = $${paramIndex}`);
        values.push(passwordHash);
        paramIndex++;
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No fields to update'
        });
    }

    values.push(id);

    const result = await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
     RETURNING id, email, role, created_at, updated_at`,
        values
    );

    res.json({
        success: true,
        message: 'User updated successfully',
        data: result.rows[0]
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete your own account'
        });
    }

    const result = await query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});
