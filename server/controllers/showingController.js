import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/helpers.js';
import { validateShowing, validateEnum, validateRequired } from '../utils/validators.js';

// @desc    Get all showings
// @route   GET /api/showings
// @access  Private
export const getAllShowings = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { status, agent_id, property_id, client_id, date_from, date_to } = req.query;

    let queryText = `
    SELECT s.*, 
           p.address as property_address, p.city as property_city,
           c.first_name as client_first_name, c.last_name as client_last_name,
           a.first_name as agent_first_name, a.last_name as agent_last_name
    FROM showings s
    LEFT JOIN properties p ON s.property_id = p.id
    LEFT JOIN clients c ON s.client_id = c.id
    LEFT JOIN agents a ON s.agent_id = a.id
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
        queryText += ` AND s.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
    }

    if (agent_id) {
        queryText += ` AND s.agent_id = $${paramIndex}`;
        queryParams.push(parseInt(agent_id));
        paramIndex++;
    }

    if (property_id) {
        queryText += ` AND s.property_id = $${paramIndex}`;
        queryParams.push(parseInt(property_id));
        paramIndex++;
    }

    if (client_id) {
        queryText += ` AND s.client_id = $${paramIndex}`;
        queryParams.push(parseInt(client_id));
        paramIndex++;
    }

    if (date_from) {
        queryText += ` AND s.scheduled_date >= $${paramIndex}`;
        queryParams.push(new Date(date_from));
        paramIndex++;
    }

    if (date_to) {
        queryText += ` AND s.scheduled_date <= $${paramIndex}`;
        queryParams.push(new Date(date_to));
        paramIndex++;
    }

    // Get total count
    const countParamsCopy = [...queryParams];
    const countQuery = queryText.replace(
        /SELECT s\.\*.*FROM showings s/s,
        'SELECT COUNT(*) FROM showings s'
    ).split('ORDER BY')[0];
    const countResult = await query(countQuery, countParamsCopy);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    queryText += ` ORDER BY s.scheduled_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get showing by ID
// @route   GET /api/showings/:id
// @access  Private
export const getShowingById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `SELECT s.*, 
            p.address as property_address, p.city as property_city, p.price as property_price,
            p.bedrooms, p.bathrooms, p.square_feet,
            c.first_name as client_first_name, c.last_name as client_last_name,
            c.email as client_email, c.phone as client_phone,
            a.first_name as agent_first_name, a.last_name as agent_last_name,
            a.phone as agent_phone
     FROM showings s
     LEFT JOIN properties p ON s.property_id = p.id
     LEFT JOIN clients c ON s.client_id = c.id
     LEFT JOIN agents a ON s.agent_id = a.id
     WHERE s.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Showing not found'
        });
    }

    res.json({
        success: true,
        data: result.rows[0]
    });
});

// @desc    Create showing
// @route   POST /api/showings
// @access  Private
export const createShowing = asyncHandler(async (req, res) => {
    const {
        property_id, client_id, agent_id, showing_type,
        scheduled_date, duration_minutes, status
    } = req.body;

    validateRequired(['property_id', 'agent_id', 'scheduled_date'], req.body);

    // Verify property exists
    const propertyResult = await query('SELECT id FROM properties WHERE id = $1', [property_id]);
    if (propertyResult.rows.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Verify agent exists
    const agentResult = await query('SELECT id FROM agents WHERE id = $1', [agent_id]);
    if (agentResult.rows.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Agent not found'
        });
    }

    // Verify client exists if provided
    if (client_id) {
        const clientResult = await query('SELECT id FROM clients WHERE id = $1', [client_id]);
        if (clientResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Client not found'
            });
        }
    }

    if (showing_type) validateEnum(showing_type, ['private', 'open_house'], 'showing_type');

    const result = await query(
        `INSERT INTO showings (
      property_id, client_id, agent_id, showing_type,
      scheduled_date, duration_minutes, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
        [
            property_id, client_id || null, agent_id, showing_type || 'private',
            new Date(scheduled_date), duration_minutes || 30, status || 'scheduled'
        ]
    );

    res.status(201).json({
        success: true,
        message: 'Showing scheduled successfully',
        data: result.rows[0]
    });
});

// @desc    Update showing
// @route   PUT /api/showings/:id
// @access  Private
export const updateShowing = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        property_id, client_id, agent_id, showing_type,
        scheduled_date, duration_minutes, status
    } = req.body;

    // Check if showing exists
    const existingShowing = await query('SELECT id FROM showings WHERE id = $1', [id]);

    if (existingShowing.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Showing not found'
        });
    }

    if (showing_type) validateEnum(showing_type, ['private', 'open_house'], 'showing_type');
    if (status) validateEnum(status, ['scheduled', 'completed', 'cancelled', 'no_show'], 'status');

    const result = await query(
        `UPDATE showings SET
      property_id = COALESCE($1, property_id),
      client_id = COALESCE($2, client_id),
      agent_id = COALESCE($3, agent_id),
      showing_type = COALESCE($4, showing_type),
      scheduled_date = COALESCE($5, scheduled_date),
      duration_minutes = COALESCE($6, duration_minutes),
      status = COALESCE($7, status)
    WHERE id = $8
    RETURNING *`,
        [
            property_id, client_id, agent_id, showing_type,
            scheduled_date ? new Date(scheduled_date) : null, duration_minutes, status, id
        ]
    );

    res.json({
        success: true,
        message: 'Showing updated successfully',
        data: result.rows[0]
    });
});

// @desc    Cancel showing
// @route   PUT /api/showings/:id/cancel
// @access  Private
export const cancelShowing = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `UPDATE showings SET status = 'cancelled' WHERE id = $1 AND status = 'scheduled'
     RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Showing not found or already completed/cancelled'
        });
    }

    res.json({
        success: true,
        message: 'Showing cancelled successfully',
        data: result.rows[0]
    });
});

// @desc    Add showing feedback
// @route   PUT /api/showings/:id/feedback
// @access  Private
export const addShowingFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { feedback, interest_level } = req.body;

    if (interest_level) {
        validateEnum(interest_level, ['high', 'medium', 'low', 'none'], 'interest_level');
    }

    const result = await query(
        `UPDATE showings SET 
      feedback = COALESCE($1, feedback), 
      interest_level = COALESCE($2, interest_level),
      status = 'completed'
     WHERE id = $3
     RETURNING *`,
        [feedback, interest_level, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Showing not found'
        });
    }

    res.json({
        success: true,
        message: 'Feedback added successfully',
        data: result.rows[0]
    });
});

// @desc    Get agent schedule
// @route   GET /api/showings/agent/:agentId/schedule
// @access  Private
export const getAgentSchedule = asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const { date_from, date_to } = req.query;

    // Default to current week if no dates provided
    const startDate = date_from ? new Date(date_from) : new Date();
    const endDate = date_to ? new Date(date_to) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = await query(
        `SELECT s.*, 
            p.address as property_address, p.city as property_city,
            c.first_name as client_first_name, c.last_name as client_last_name
     FROM showings s
     LEFT JOIN properties p ON s.property_id = p.id
     LEFT JOIN clients c ON s.client_id = c.id
     WHERE s.agent_id = $1 
       AND s.scheduled_date >= $2 
       AND s.scheduled_date <= $3
       AND s.status IN ('scheduled', 'completed')
     ORDER BY s.scheduled_date ASC`,
        [agentId, startDate, endDate]
    );

    res.json({
        success: true,
        data: {
            agent_id: parseInt(agentId),
            date_range: {
                from: startDate.toISOString(),
                to: endDate.toISOString()
            },
            showings: result.rows
        }
    });
});

// @desc    Get upcoming showings
// @route   GET /api/showings/upcoming
// @access  Private
export const getUpcomingShowings = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const result = await query(
        `SELECT s.*, 
            p.address as property_address, p.city as property_city,
            c.first_name as client_first_name, c.last_name as client_last_name,
            a.first_name as agent_first_name, a.last_name as agent_last_name
     FROM showings s
     LEFT JOIN properties p ON s.property_id = p.id
     LEFT JOIN clients c ON s.client_id = c.id
     LEFT JOIN agents a ON s.agent_id = a.id
     WHERE s.status = 'scheduled' AND s.scheduled_date >= NOW()
     ORDER BY s.scheduled_date ASC
     LIMIT $1`,
        [parseInt(limit)]
    );

    res.json({
        success: true,
        data: result.rows
    });
});
