import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/helpers.js';
import { validateClient, validateEnum } from '../utils/validators.js';

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getAllClients = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { status, client_type, assigned_agent_id, search, min_score, max_score } = req.query;

    let queryText = `
    SELECT c.*, 
           a.first_name as agent_first_name, 
           a.last_name as agent_last_name,
           (SELECT COUNT(*) FROM deals WHERE client_id = c.id) as deal_count,
           (SELECT MAX(communication_date) FROM communications WHERE client_id = c.id) as last_contact
    FROM clients c
    LEFT JOIN agents a ON c.assigned_agent_id = a.id
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
        queryText += ` AND c.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
    }

    if (client_type) {
        queryText += ` AND c.client_type = $${paramIndex}`;
        queryParams.push(client_type);
        paramIndex++;
    }

    if (assigned_agent_id) {
        queryText += ` AND c.assigned_agent_id = $${paramIndex}`;
        queryParams.push(parseInt(assigned_agent_id));
        paramIndex++;
    }

    if (min_score) {
        queryText += ` AND c.lead_score >= $${paramIndex}`;
        queryParams.push(parseInt(min_score));
        paramIndex++;
    }

    if (max_score) {
        queryText += ` AND c.lead_score <= $${paramIndex}`;
        queryParams.push(parseInt(max_score));
        paramIndex++;
    }

    if (search) {
        queryText += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
    }

    // Get total count
    const countParamsCopy = [...queryParams];
    const countQuery = queryText.replace(
        /SELECT c\.\*.*FROM clients c/s,
        'SELECT COUNT(*) FROM clients c'
    ).split('ORDER BY')[0];
    const countResult = await query(countQuery, countParamsCopy);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    queryText += ` ORDER BY c.lead_score DESC, c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `SELECT c.*, 
            a.first_name as agent_first_name, 
            a.last_name as agent_last_name,
            a.phone as agent_phone,
            (SELECT COUNT(*) FROM deals WHERE client_id = c.id) as deal_count
     FROM clients c
     LEFT JOIN agents a ON c.assigned_agent_id = a.id
     WHERE c.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Client not found'
        });
    }

    // Get deals
    const deals = await query(
        `SELECT d.*, p.address as property_address
     FROM deals d
     LEFT JOIN properties p ON d.property_id = p.id
     WHERE d.client_id = $1
     ORDER BY d.created_at DESC`,
        [id]
    );

    // Get recent communications
    const communications = await query(
        `SELECT id, communication_type, subject, direction, communication_date
     FROM communications
     WHERE client_id = $1
     ORDER BY communication_date DESC
     LIMIT 10`,
        [id]
    );

    // Get showings
    const showings = await query(
        `SELECT s.*, p.address as property_address
     FROM showings s
     LEFT JOIN properties p ON s.property_id = p.id
     WHERE s.client_id = $1
     ORDER BY s.scheduled_date DESC
     LIMIT 10`,
        [id]
    );

    res.json({
        success: true,
        data: {
            ...result.rows[0],
            deals: deals.rows,
            communications: communications.rows,
            showings: showings.rows
        }
    });
});

// @desc    Create client
// @route   POST /api/clients
// @access  Private
export const createClient = asyncHandler(async (req, res) => {
    const {
        first_name, last_name, email, phone, secondary_phone,
        client_type, status, lead_source, lead_score,
        budget_min, budget_max, preferred_locations, requirements,
        assigned_agent_id
    } = req.body;

    validateClient(req.body);

    const result = await query(
        `INSERT INTO clients (
      first_name, last_name, email, phone, secondary_phone,
      client_type, status, lead_source, lead_score,
      budget_min, budget_max, preferred_locations, requirements,
      assigned_agent_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
        [
            first_name, last_name, email || null, phone || null, secondary_phone || null,
            client_type, status || 'lead', lead_source || null, lead_score || 0,
            budget_min || null, budget_max || null,
            preferred_locations || null,
            requirements ? JSON.stringify(requirements) : null,
            assigned_agent_id || null
        ]
    );

    res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: result.rows[0]
    });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        first_name, last_name, email, phone, secondary_phone,
        client_type, status, lead_source, lead_score,
        budget_min, budget_max, preferred_locations, requirements,
        assigned_agent_id
    } = req.body;

    // Check if client exists
    const existingClient = await query('SELECT id FROM clients WHERE id = $1', [id]);

    if (existingClient.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Client not found'
        });
    }

    // Validate enums if provided
    if (client_type) validateEnum(client_type, ['buyer', 'seller', 'renter', 'investor'], 'client_type');
    if (status) validateEnum(status, ['lead', 'active', 'inactive', 'closed'], 'status');

    const result = await query(
        `UPDATE clients SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      secondary_phone = COALESCE($5, secondary_phone),
      client_type = COALESCE($6, client_type),
      status = COALESCE($7, status),
      lead_source = COALESCE($8, lead_source),
      lead_score = COALESCE($9, lead_score),
      budget_min = COALESCE($10, budget_min),
      budget_max = COALESCE($11, budget_max),
      preferred_locations = COALESCE($12, preferred_locations),
      requirements = COALESCE($13, requirements),
      assigned_agent_id = COALESCE($14, assigned_agent_id)
    WHERE id = $15
    RETURNING *`,
        [
            first_name, last_name, email, phone, secondary_phone,
            client_type, status, lead_source, lead_score,
            budget_min, budget_max, preferred_locations,
            requirements ? JSON.stringify(requirements) : null,
            assigned_agent_id, id
        ]
    );

    res.json({
        success: true,
        message: 'Client updated successfully',
        data: result.rows[0]
    });
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        'DELETE FROM clients WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Client not found'
        });
    }

    res.json({
        success: true,
        message: 'Client deleted successfully'
    });
});

// @desc    Assign agent to client
// @route   PUT /api/clients/:id/assign-agent
// @access  Private
export const assignAgent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { agent_id } = req.body;

    // Check if client exists
    const clientResult = await query('SELECT id FROM clients WHERE id = $1', [id]);

    if (clientResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Client not found'
        });
    }

    // Check if agent exists
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
        `UPDATE clients SET assigned_agent_id = $1 WHERE id = $2
     RETURNING *`,
        [agent_id || null, id]
    );

    res.json({
        success: true,
        message: agent_id ? 'Agent assigned successfully' : 'Agent unassigned successfully',
        data: result.rows[0]
    });
});

// @desc    Update lead score
// @route   PUT /api/clients/:id/lead-score
// @access  Private
export const updateLeadScore = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { lead_score } = req.body;

    if (lead_score === undefined || lead_score < 0 || lead_score > 100) {
        return res.status(400).json({
            success: false,
            message: 'Lead score must be between 0 and 100'
        });
    }

    const result = await query(
        `UPDATE clients SET lead_score = $1 WHERE id = $2
     RETURNING *`,
        [lead_score, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Client not found'
        });
    }

    res.json({
        success: true,
        message: 'Lead score updated successfully',
        data: result.rows[0]
    });
});
