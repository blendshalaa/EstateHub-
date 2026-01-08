import { query, getClient } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/helpers.js';
import { validateDeal, validateEnum } from '../utils/validators.js';

// @desc    Get all deals
// @route   GET /api/deals
// @access  Private
export const getAllDeals = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { stage, deal_type, agent_id, client_id, property_id } = req.query;

    let queryText = `
    SELECT d.*, 
           p.address as property_address, p.price as property_price,
           c.first_name as client_first_name, c.last_name as client_last_name,
           a.first_name as agent_first_name, a.last_name as agent_last_name
    FROM deals d
    LEFT JOIN properties p ON d.property_id = p.id
    LEFT JOIN clients c ON d.client_id = c.id
    LEFT JOIN agents a ON d.agent_id = a.id
    WHERE 1=1
  `;
    const queryParams = [];
    let paramIndex = 1;

    if (stage) {
        queryText += ` AND d.stage = $${paramIndex}`;
        queryParams.push(stage);
        paramIndex++;
    }

    if (deal_type) {
        queryText += ` AND d.deal_type = $${paramIndex}`;
        queryParams.push(deal_type);
        paramIndex++;
    }

    if (agent_id) {
        queryText += ` AND d.agent_id = $${paramIndex}`;
        queryParams.push(parseInt(agent_id));
        paramIndex++;
    }

    if (client_id) {
        queryText += ` AND d.client_id = $${paramIndex}`;
        queryParams.push(parseInt(client_id));
        paramIndex++;
    }

    if (property_id) {
        queryText += ` AND d.property_id = $${paramIndex}`;
        queryParams.push(parseInt(property_id));
        paramIndex++;
    }

    // Get total count
    const countParamsCopy = [...queryParams];
    const countQuery = queryText.replace(
        /SELECT d\.\*.*FROM deals d/s,
        'SELECT COUNT(*) FROM deals d'
    ).split('ORDER BY')[0];
    const countResult = await query(countQuery, countParamsCopy);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    queryText += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get deal by ID
// @route   GET /api/deals/:id
// @access  Private
export const getDealById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        `SELECT d.*, 
            p.address as property_address, p.price as property_price, 
            p.id as property_id, p.mls_number,
            c.first_name as client_first_name, c.last_name as client_last_name,
            c.email as client_email, c.phone as client_phone,
            a.first_name as agent_first_name, a.last_name as agent_last_name,
            a.phone as agent_phone
     FROM deals d
     LEFT JOIN properties p ON d.property_id = p.id
     LEFT JOIN clients c ON d.client_id = c.id
     LEFT JOIN agents a ON d.agent_id = a.id
     WHERE d.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Deal not found'
        });
    }

    // Get activities
    const activities = await query(
        `SELECT da.*, u.email as performed_by_email
     FROM deal_activities da
     LEFT JOIN users u ON da.performed_by = u.id
     WHERE da.deal_id = $1
     ORDER BY da.activity_date DESC`,
        [id]
    );

    res.json({
        success: true,
        data: {
            ...result.rows[0],
            activities: activities.rows
        }
    });
});

// @desc    Create deal
// @route   POST /api/deals
// @access  Private
export const createDeal = asyncHandler(async (req, res) => {
    const {
        property_id, client_id, agent_id, deal_type, stage,
        offer_amount, expected_close_date, notes
    } = req.body;

    validateDeal(req.body);

    // Verify client exists
    const clientResult = await query('SELECT id FROM clients WHERE id = $1', [client_id]);
    if (clientResult.rows.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Client not found'
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

    // Verify property exists if provided
    if (property_id) {
        const propertyResult = await query('SELECT id FROM properties WHERE id = $1', [property_id]);
        if (propertyResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Property not found'
            });
        }
    }

    const result = await query(
        `INSERT INTO deals (
      property_id, client_id, agent_id, deal_type, stage,
      offer_amount, expected_close_date, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
        [
            property_id || null, client_id, agent_id, deal_type, stage || 'lead',
            offer_amount || null, expected_close_date || null, notes || null
        ]
    );

    // Create initial activity
    await query(
        `INSERT INTO deal_activities (deal_id, activity_type, description, new_stage, performed_by)
     VALUES ($1, 'stage_change', 'Deal created', $2, $3)`,
        [result.rows[0].id, stage || 'lead', req.user?.id || null]
    );

    res.status(201).json({
        success: true,
        message: 'Deal created successfully',
        data: result.rows[0]
    });
});

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private
export const updateDeal = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        property_id, client_id, agent_id, deal_type,
        offer_amount, final_amount, commission_amount,
        expected_close_date, actual_close_date, notes
    } = req.body;

    // Check if deal exists
    const existingDeal = await query('SELECT id FROM deals WHERE id = $1', [id]);

    if (existingDeal.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Deal not found'
        });
    }

    if (deal_type) validateEnum(deal_type, ['purchase', 'sale', 'rental', 'lease'], 'deal_type');

    const result = await query(
        `UPDATE deals SET
      property_id = COALESCE($1, property_id),
      client_id = COALESCE($2, client_id),
      agent_id = COALESCE($3, agent_id),
      deal_type = COALESCE($4, deal_type),
      offer_amount = COALESCE($5, offer_amount),
      final_amount = COALESCE($6, final_amount),
      commission_amount = COALESCE($7, commission_amount),
      expected_close_date = COALESCE($8, expected_close_date),
      actual_close_date = COALESCE($9, actual_close_date),
      notes = COALESCE($10, notes)
    WHERE id = $11
    RETURNING *`,
        [
            property_id, client_id, agent_id, deal_type,
            offer_amount, final_amount, commission_amount,
            expected_close_date, actual_close_date, notes, id
        ]
    );

    res.json({
        success: true,
        message: 'Deal updated successfully',
        data: result.rows[0]
    });
});

// @desc    Update deal stage
// @route   PUT /api/deals/:id/stage
// @access  Private
export const updateDealStage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stage, notes } = req.body;

    validateEnum(stage, ['lead', 'viewing', 'offer_made', 'negotiation', 'under_contract', 'closed_won', 'closed_lost'], 'stage');

    // Get current deal
    const currentDeal = await query('SELECT id, stage FROM deals WHERE id = $1', [id]);

    if (currentDeal.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Deal not found'
        });
    }

    const previousStage = currentDeal.rows[0].stage;

    // Use transaction for consistency
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // Update deal stage
        const updateData = { stage };

        // If closing the deal, set actual_close_date
        if (stage === 'closed_won' || stage === 'closed_lost') {
            await client.query(
                `UPDATE deals SET stage = $1, actual_close_date = CURRENT_DATE WHERE id = $2`,
                [stage, id]
            );
        } else {
            await client.query(
                `UPDATE deals SET stage = $1 WHERE id = $2`,
                [stage, id]
            );
        }

        // Log activity
        await client.query(
            `INSERT INTO deal_activities (deal_id, activity_type, description, previous_stage, new_stage, performed_by)
       VALUES ($1, 'stage_change', $2, $3, $4, $5)`,
            [id, notes || `Stage changed from ${previousStage} to ${stage}`, previousStage, stage, req.user?.id || null]
        );

        // If deal is won and has a property, update property status
        if (stage === 'closed_won') {
            const dealResult = await client.query('SELECT property_id, deal_type FROM deals WHERE id = $1', [id]);
            if (dealResult.rows[0].property_id) {
                const newStatus = dealResult.rows[0].deal_type === 'sale' || dealResult.rows[0].deal_type === 'purchase'
                    ? 'sold'
                    : 'off_market';
                await client.query(
                    `UPDATE properties SET status = $1, sold_date = CURRENT_DATE WHERE id = $2`,
                    [newStatus, dealResult.rows[0].property_id]
                );
            }
        }

        await client.query('COMMIT');

        // Get updated deal
        const result = await query(
            `SELECT d.*, p.address as property_address
       FROM deals d
       LEFT JOIN properties p ON d.property_id = p.id
       WHERE d.id = $1`,
            [id]
        );

        res.json({
            success: true,
            message: `Deal stage updated to ${stage}`,
            data: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private
export const deleteDeal = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await query(
        'DELETE FROM deals WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Deal not found'
        });
    }

    res.json({
        success: true,
        message: 'Deal deleted successfully'
    });
});

// @desc    Add deal activity
// @route   POST /api/deals/:id/activities
// @access  Private
export const addDealActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { activity_type, description } = req.body;

    // Check if deal exists
    const dealResult = await query('SELECT id FROM deals WHERE id = $1', [id]);

    if (dealResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Deal not found'
        });
    }

    validateEnum(activity_type, ['stage_change', 'note', 'email', 'call', 'meeting', 'viewing'], 'activity_type');

    const result = await query(
        `INSERT INTO deal_activities (deal_id, activity_type, description, performed_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [id, activity_type, description || null, req.user?.id || null]
    );

    res.status(201).json({
        success: true,
        message: 'Activity added successfully',
        data: result.rows[0]
    });
});

// @desc    Get deal activities
// @route   GET /api/deals/:id/activities
// @access  Private
export const getDealActivities = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page, limit, offset } = getPagination(req.query);

    // Check if deal exists
    const dealResult = await query('SELECT id FROM deals WHERE id = $1', [id]);

    if (dealResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Deal not found'
        });
    }

    const countResult = await query(
        'SELECT COUNT(*) FROM deal_activities WHERE deal_id = $1',
        [id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
        `SELECT da.*, u.email as performed_by_email
     FROM deal_activities da
     LEFT JOIN users u ON da.performed_by = u.id
     WHERE da.deal_id = $1
     ORDER BY da.activity_date DESC
     LIMIT $2 OFFSET $3`,
        [id, limit, offset]
    );

    res.json(paginatedResponse(result.rows, total, page, limit));
});

// @desc    Get deal pipeline summary
// @route   GET /api/deals/pipeline
// @access  Private
export const getDealPipeline = asyncHandler(async (req, res) => {
    const { agent_id } = req.query;

    let queryText = `
    SELECT 
      stage,
      COUNT(*) as count,
      COALESCE(SUM(offer_amount), 0) as total_value
    FROM deals
    WHERE 1=1
  `;
    const queryParams = [];

    if (agent_id) {
        queryText += ` AND agent_id = $1`;
        queryParams.push(parseInt(agent_id));
    }

    queryText += ` GROUP BY stage ORDER BY 
    CASE stage 
      WHEN 'lead' THEN 1
      WHEN 'viewing' THEN 2
      WHEN 'offer_made' THEN 3
      WHEN 'negotiation' THEN 4
      WHEN 'under_contract' THEN 5
      WHEN 'closed_won' THEN 6
      WHEN 'closed_lost' THEN 7
    END`;

    const result = await query(queryText, queryParams);

    res.json({
        success: true,
        data: result.rows
    });
});
