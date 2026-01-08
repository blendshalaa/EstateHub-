import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/helpers.js';
import { validateEnum, validateRequired } from '../utils/validators.js';

// @desc    Get all communications
// @route   GET /api/communications
// @access  Private
export const getAllCommunications = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { communication_type, client_id, agent_id, direction, date_from, date_to } = req.query;

    let queryText = `
    SELECT cm.*, 
           c.first_name as client_first_name, c.last_name as client_last_name,
           a.first_name as agent_first_name, a.last_name as agent_last_name
    FROM communications cm
    LEFT JOIN clients c ON cm.client_id = c.id
    LEFT JOIN agents a ON cm.agent_id = a.id
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (communication_type) {
        queryText += ` AND cm.communication_type = $${paramIndex}`;
        queryParams.push(communication_type);
        paramIndex++;
    }

    if (client_id) {
        queryText += ` AND cm.client_id = $${paramIndex}`;
        queryParams.push(parseInt(client_id));
        paramIndex++;
    }

    if (agent_id) {
        queryText += ` AND cm.agent_id = $${paramIndex}`;
        queryParams.push(parseInt(agent_id));
        paramIndex++;
    }

    if (direction) {
        queryText += ` AND cm.direction = $${paramIndex}`;
        queryParams.push(direction);
        paramIndex++;
    }

    if (date_from) {
        queryText += ` AND cm.communication_date >= $${paramIndex}`;
        queryParams.push(new Date(date_from));
        paramIndex++;
    }

    if (date_to) {
        queryText += ` AND cm.communication_date <= $${paramIndex}`;
        queryParams.push(new Date(date_to));
        paramIndex++;
    }

    // Get total count
    const countParamsCopy = [...queryParams];
    const countQuery = queryText.replace(
        /SELECT cm\.\*.*FROM communications cm/s,
        'SELECT COUNT(*) FROM communications cm'
    ).split('ORDER BY')[0];
    const countResult = await query(countQuery, countParamsCopy);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    queryText += ` ORDER BY cm.communication_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get communication by ID
// @route   GET /api/communications/:id
// @access  Private
export const getCommunicationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `SELECT cm.*, 
            c.first_name as client_first_name, c.last_name as client_last_name,
            c.email as client_email, c.phone as client_phone,
            a.first_name as agent_first_name, a.last_name as agent_last_name
     FROM communications cm
     LEFT JOIN clients c ON cm.client_id = c.id
     LEFT JOIN agents a ON cm.agent_id = a.id
     WHERE cm.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Communication not found'
        });
    }

    res.json({
        success: true,
        data: result.rows[0]
    });
});

// @desc    Create communication
// @route   POST /api/communications
// @access  Private
export const createCommunication = asyncHandler(async (req, res) => {
    const {
        client_id, agent_id, communication_type, subject, content, direction
    } = req.body;

    validateRequired(['client_id', 'communication_type'], req.body);
    validateEnum(communication_type, ['email', 'call', 'sms', 'meeting', 'note'], 'communication_type');
    if (direction) validateEnum(direction, ['inbound', 'outbound'], 'direction');

    // Verify client exists
    const clientResult = await query('SELECT id FROM clients WHERE id = $1', [client_id]);
    if (clientResult.rows.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Client not found'
        });
    }

    // Verify agent exists if provided
    if (agent_id) {
        const agentResult = await query('SELECT id FROM agents WHERE id = $1', [agent_id]);
        if (agentResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Agent not found'
            });
        }
    }

    const result = await query(
        `INSERT INTO communications (
      client_id, agent_id, communication_type, subject, content, direction
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
        [
            client_id, agent_id || null, communication_type,
            subject || null, content || null, direction || 'outbound'
        ]
    );

    res.status(201).json({
        success: true,
        message: 'Communication logged successfully',
        data: result.rows[0]
    });
});

// @desc    Update communication
// @route   PUT /api/communications/:id
// @access  Private
export const updateCommunication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { communication_type, subject, content, direction } = req.body;

    // Check if communication exists
    const existingComm = await query('SELECT id FROM communications WHERE id = $1', [id]);

    if (existingComm.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Communication not found'
        });
    }

    if (communication_type) validateEnum(communication_type, ['email', 'call', 'sms', 'meeting', 'note'], 'communication_type');
    if (direction) validateEnum(direction, ['inbound', 'outbound'], 'direction');

    const result = await query(
        `UPDATE communications SET
      communication_type = COALESCE($1, communication_type),
      subject = COALESCE($2, subject),
      content = COALESCE($3, content),
      direction = COALESCE($4, direction)
    WHERE id = $5
    RETURNING *`,
        [communication_type, subject, content, direction, id]
    );

    res.json({
        success: true,
        message: 'Communication updated successfully',
        data: result.rows[0]
    });
});

// @desc    Delete communication
// @route   DELETE /api/communications/:id
// @access  Private
export const deleteCommunication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        'DELETE FROM communications WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Communication not found'
        });
    }

    res.json({
        success: true,
        message: 'Communication deleted successfully'
    });
});

// @desc    Get client communications
// @route   GET /api/communications/client/:clientId
// @access  Private
export const getClientCommunications = asyncHandler(async (req, res) => {
    const { clientId } = req.params;
    const { page, limit, offset } = getPagination(req.query);

    // Check if client exists
    const clientResult = await query('SELECT id, first_name, last_name FROM clients WHERE id = $1', [clientId]);

    if (clientResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Client not found'
        });
    }

    const countResult = await query(
        'SELECT COUNT(*) FROM communications WHERE client_id = $1',
        [clientId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
        `SELECT cm.*, 
            a.first_name as agent_first_name, a.last_name as agent_last_name
     FROM communications cm
     LEFT JOIN agents a ON cm.agent_id = a.id
     WHERE cm.client_id = $1
     ORDER BY cm.communication_date DESC
     LIMIT $2 OFFSET $3`,
        [clientId, limit, offset]
    );

    res.json({
        success: true,
        data: {
            client: clientResult.rows[0],
            ...paginatedResponse(result.rows, total, page, limit)
        }
    });
});

// @desc    Get communication summary by type
// @route   GET /api/communications/summary
// @access  Private
export const getCommunicationSummary = asyncHandler(async (req, res) => {
    const { agent_id, date_from, date_to } = req.query;

    let queryText = `
    SELECT 
      communication_type,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE direction = 'inbound') as inbound_count,
      COUNT(*) FILTER (WHERE direction = 'outbound') as outbound_count
    FROM communications
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (agent_id) {
        queryText += ` AND agent_id = $${paramIndex}`;
        queryParams.push(parseInt(agent_id));
        paramIndex++;
    }

    if (date_from) {
        queryText += ` AND communication_date >= $${paramIndex}`;
        queryParams.push(new Date(date_from));
        paramIndex++;
    }

    if (date_to) {
        queryText += ` AND communication_date <= $${paramIndex}`;
        queryParams.push(new Date(date_to));
        paramIndex++;
    }

    queryText += ` GROUP BY communication_type ORDER BY count DESC`;

    const result = await query(queryText, queryParams);

    res.json({
        success: true,
        data: result.rows
    });
});
