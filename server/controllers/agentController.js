import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse, getSortClause } from '../utils/helpers.js';
import { validateRequired, validateEnum } from '../utils/validators.js';

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private
export const getAllAgents = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { status, territory, search } = req.query;

    let queryText = `
    SELECT a.*, u.email,
           (SELECT COUNT(*) FROM properties WHERE agent_id = a.id) as property_count,
           (SELECT COUNT(*) FROM clients WHERE assigned_agent_id = a.id) as client_count,
           (SELECT COUNT(*) FROM deals WHERE agent_id = a.id AND stage = 'closed_won') as closed_deals
    FROM agents a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
        queryText += ` AND a.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
    }

    if (territory) {
        queryText += ` AND a.territory ILIKE $${paramIndex}`;
        queryParams.push(`%${territory}%`);
        paramIndex++;
    }

    if (search) {
        queryText += ` AND (a.first_name ILIKE $${paramIndex} OR a.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
    }

    // Get total count
    const countQuery = `
    SELECT COUNT(*) FROM agents a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
    ${status ? `AND a.status = $1` : ''}
    ${territory ? `AND a.territory ILIKE $${status ? 2 : 1}` : ''}
    ${search ? `AND (a.first_name ILIKE $${(status ? 1 : 0) + (territory ? 1 : 0) + 1} OR a.last_name ILIKE $${(status ? 1 : 0) + (territory ? 1 : 0) + 1})` : ''}
  `;

    const countParams = [];
    if (status) countParams.push(status);
    if (territory) countParams.push(`%${territory}%`);
    if (search) countParams.push(`%${search}%`);

    const countResult = await query(
        `SELECT COUNT(*) FROM agents a WHERE 1=1 ${status ? 'AND a.status = $1' : ''}`,
        status ? [status] : []
    );
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    queryText += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Private
export const getAgentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `SELECT a.*, u.email,
            (SELECT COUNT(*) FROM properties WHERE agent_id = a.id) as property_count,
            (SELECT COUNT(*) FROM clients WHERE assigned_agent_id = a.id) as client_count,
            (SELECT COUNT(*) FROM deals WHERE agent_id = a.id) as total_deals,
            (SELECT COUNT(*) FROM deals WHERE agent_id = a.id AND stage = 'closed_won') as closed_deals,
            (SELECT COALESCE(SUM(commission_amount), 0) FROM deals WHERE agent_id = a.id AND stage = 'closed_won') as total_commission
     FROM agents a
     LEFT JOIN users u ON a.user_id = u.id
     WHERE a.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Agent not found'
        });
    }

    // Get recent deals
    const dealsResult = await query(
        `SELECT d.*, p.address, c.first_name as client_first_name, c.last_name as client_last_name
     FROM deals d
     LEFT JOIN properties p ON d.property_id = p.id
     LEFT JOIN clients c ON d.client_id = c.id
     WHERE d.agent_id = $1
     ORDER BY d.created_at DESC
     LIMIT 5`,
        [id]
    );

    res.json({
        success: true,
        data: {
            ...result.rows[0],
            recent_deals: dealsResult.rows
        }
    });
});

// @desc    Create agent
// @route   POST /api/agents
// @access  Private/Admin
export const createAgent = asyncHandler(async (req, res) => {
    const {
        user_id, first_name, last_name, phone, license_number,
        commission_rate, territory, hire_date, status, photo_url, bio
    } = req.body;

    validateRequired(['first_name', 'last_name'], req.body);

    // If user_id provided, verify user exists and is an agent role
    if (user_id) {
        const userResult = await query(
            'SELECT id, role FROM users WHERE id = $1',
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if agent already exists for this user
        const existingAgent = await query(
            'SELECT id FROM agents WHERE user_id = $1',
            [user_id]
        );

        if (existingAgent.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Agent profile already exists for this user'
            });
        }
    }

    const result = await query(
        `INSERT INTO agents (
      user_id, first_name, last_name, phone, license_number,
      commission_rate, territory, hire_date, status, photo_url, bio
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
        [
            user_id || null, first_name, last_name, phone || null, license_number || null,
            commission_rate || null, territory || null, hire_date || null,
            status || 'active', photo_url || null, bio || null
        ]
    );

    res.status(201).json({
        success: true,
        message: 'Agent created successfully',
        data: result.rows[0]
    });
});

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private/Admin
export const updateAgent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        first_name, last_name, phone, license_number,
        commission_rate, territory, hire_date, status, photo_url, bio
    } = req.body;

    // Check if agent exists
    const existingAgent = await query('SELECT id FROM agents WHERE id = $1', [id]);

    if (existingAgent.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Agent not found'
        });
    }

    if (status) {
        validateEnum(status, ['active', 'inactive'], 'status');
    }

    const result = await query(
        `UPDATE agents SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      phone = COALESCE($3, phone),
      license_number = COALESCE($4, license_number),
      commission_rate = COALESCE($5, commission_rate),
      territory = COALESCE($6, territory),
      hire_date = COALESCE($7, hire_date),
      status = COALESCE($8, status),
      photo_url = COALESCE($9, photo_url),
      bio = COALESCE($10, bio)
    WHERE id = $11
    RETURNING *`,
        [first_name, last_name, phone, license_number, commission_rate,
            territory, hire_date, status, photo_url, bio, id]
    );

    res.json({
        success: true,
        message: 'Agent updated successfully',
        data: result.rows[0]
    });
});

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private/Admin
export const deleteAgent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        'DELETE FROM agents WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Agent not found'
        });
    }

    res.json({
        success: true,
        message: 'Agent deleted successfully'
    });
});

// @desc    Get agent stats
// @route   GET /api/agents/:id/stats
// @access  Private
export const getAgentStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { period } = req.query; // 'month', 'quarter', 'year'

    // Check if agent exists
    const agentResult = await query('SELECT id, first_name, last_name FROM agents WHERE id = $1', [id]);

    if (agentResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Agent not found'
        });
    }

    let dateFilter = '';
    if (period === 'month') {
        dateFilter = "AND d.created_at >= CURRENT_DATE - INTERVAL '1 month'";
    } else if (period === 'quarter') {
        dateFilter = "AND d.created_at >= CURRENT_DATE - INTERVAL '3 months'";
    } else if (period === 'year') {
        dateFilter = "AND d.created_at >= CURRENT_DATE - INTERVAL '1 year'";
    }

    // Deal statistics
    const dealStats = await query(
        `SELECT 
      COUNT(*) as total_deals,
      COUNT(*) FILTER (WHERE stage = 'closed_won') as won_deals,
      COUNT(*) FILTER (WHERE stage = 'closed_lost') as lost_deals,
      COUNT(*) FILTER (WHERE stage NOT IN ('closed_won', 'closed_lost')) as active_deals,
      COALESCE(SUM(commission_amount) FILTER (WHERE stage = 'closed_won'), 0) as total_commission,
      COALESCE(AVG(final_amount) FILTER (WHERE stage = 'closed_won'), 0) as avg_deal_value
    FROM deals d
    WHERE d.agent_id = $1 ${dateFilter}`,
        [id]
    );

    // Showing statistics
    const showingStats = await query(
        `SELECT 
      COUNT(*) as total_showings,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_showings,
      COUNT(*) FILTER (WHERE interest_level = 'high') as high_interest_showings
    FROM showings
    WHERE agent_id = $1 ${dateFilter.replace('d.', '')}`,
        [id]
    );

    // Client statistics
    const clientStats = await query(
        `SELECT 
      COUNT(*) as total_clients,
      COUNT(*) FILTER (WHERE status = 'active') as active_clients,
      AVG(lead_score) as avg_lead_score
    FROM clients
    WHERE assigned_agent_id = $1`,
        [id]
    );

    // Property statistics
    const propertyStats = await query(
        `SELECT 
      COUNT(*) as total_listings,
      COUNT(*) FILTER (WHERE status = 'available') as active_listings,
      COUNT(*) FILTER (WHERE status = 'sold') as sold_listings
    FROM properties
    WHERE agent_id = $1`,
        [id]
    );

    res.json({
        success: true,
        data: {
            agent: agentResult.rows[0],
            period: period || 'all_time',
            deals: dealStats.rows[0],
            showings: showingStats.rows[0],
            clients: clientStats.rows[0],
            properties: propertyStats.rows[0]
        }
    });
});
