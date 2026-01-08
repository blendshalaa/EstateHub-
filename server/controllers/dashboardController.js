import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
export const getOverview = asyncHandler(async (req, res) => {
    const { agent_id } = req.query;

    const agentFilter = agent_id ? `AND agent_id = ${parseInt(agent_id)}` : '';
    const clientAgentFilter = agent_id ? `AND assigned_agent_id = ${parseInt(agent_id)}` : '';

    const [properties, clients, deals, showings, tasks] = await Promise.all([
        query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'available') as active FROM properties WHERE 1=1 ${agentFilter}`),
        query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active, COUNT(*) FILTER (WHERE status = 'lead') as leads FROM clients WHERE 1=1 ${clientAgentFilter}`),
        query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE stage NOT IN ('closed_won', 'closed_lost')) as active, COALESCE(SUM(commission_amount) FILTER (WHERE stage = 'closed_won'), 0) as total_commission FROM deals WHERE 1=1 ${agentFilter}`),
        query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'scheduled' AND scheduled_date >= NOW()) as upcoming FROM showings WHERE 1=1 ${agentFilter}`),
        query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'pending') as pending, COUNT(*) FILTER (WHERE status = 'pending' AND due_date < NOW()) as overdue FROM tasks WHERE 1=1 ${agent_id ? `AND assigned_to = ${parseInt(agent_id)}` : ''}`)
    ]);

    res.json({
        success: true,
        data: {
            properties: properties.rows[0],
            clients: clients.rows[0],
            deals: deals.rows[0],
            showings: showings.rows[0],
            tasks: tasks.rows[0]
        }
    });
});

// @desc    Get deal pipeline
// @route   GET /api/dashboard/pipeline
export const getDealPipeline = asyncHandler(async (req, res) => {
    const { agent_id } = req.query;
    let queryText = `SELECT stage, COUNT(*) as count, COALESCE(SUM(offer_amount), 0) as total_value FROM deals WHERE 1=1`;
    if (agent_id) queryText += ` AND agent_id = $1`;
    queryText += ` GROUP BY stage ORDER BY CASE stage WHEN 'lead' THEN 1 WHEN 'viewing' THEN 2 WHEN 'offer_made' THEN 3 WHEN 'negotiation' THEN 4 WHEN 'under_contract' THEN 5 WHEN 'closed_won' THEN 6 WHEN 'closed_lost' THEN 7 END`;

    const result = await query(queryText, agent_id ? [parseInt(agent_id)] : []);
    res.json({ success: true, data: result.rows });
});

// @desc    Get agent performance
// @route   GET /api/dashboard/agent-performance
export const getAgentPerformance = asyncHandler(async (req, res) => {
    const { period } = req.query;
    let dateFilter = '';
    if (period === 'month') dateFilter = "AND d.actual_close_date >= CURRENT_DATE - INTERVAL '1 month'";
    else if (period === 'quarter') dateFilter = "AND d.actual_close_date >= CURRENT_DATE - INTERVAL '3 months'";
    else if (period === 'year') dateFilter = "AND d.actual_close_date >= CURRENT_DATE - INTERVAL '1 year'";

    const result = await query(`
    SELECT a.id, a.first_name, a.last_name, a.photo_url,
      COUNT(d.id) FILTER (WHERE d.stage = 'closed_won' ${dateFilter}) as closed_deals,
      COALESCE(SUM(d.commission_amount) FILTER (WHERE d.stage = 'closed_won' ${dateFilter}), 0) as total_commission,
      COALESCE(AVG(d.final_amount) FILTER (WHERE d.stage = 'closed_won' ${dateFilter}), 0) as avg_deal_value,
      (SELECT COUNT(*) FROM clients WHERE assigned_agent_id = a.id AND status = 'active') as active_clients,
      (SELECT COUNT(*) FROM properties WHERE agent_id = a.id AND status = 'available') as active_listings
    FROM agents a LEFT JOIN deals d ON a.id = d.agent_id WHERE a.status = 'active'
    GROUP BY a.id ORDER BY closed_deals DESC, total_commission DESC LIMIT 10
  `);
    res.json({ success: true, data: result.rows });
});

// @desc    Get recent activity
// @route   GET /api/dashboard/recent-activity
export const getRecentActivity = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;

    const [dealActivities, communications, showings] = await Promise.all([
        query(`SELECT 'deal_activity' as type, da.activity_type, da.description, da.activity_date as date, d.id as deal_id, u.email as user_email FROM deal_activities da LEFT JOIN deals d ON da.deal_id = d.id LEFT JOIN users u ON da.performed_by = u.id ORDER BY da.activity_date DESC LIMIT $1`, [Math.ceil(limit / 3)]),
        query(`SELECT 'communication' as type, cm.communication_type as activity_type, cm.subject as description, cm.communication_date as date, c.first_name || ' ' || c.last_name as client_name FROM communications cm LEFT JOIN clients c ON cm.client_id = c.id ORDER BY cm.communication_date DESC LIMIT $1`, [Math.ceil(limit / 3)]),
        query(`SELECT 'showing' as type, s.showing_type as activity_type, p.address as description, s.scheduled_date as date, s.status FROM showings s LEFT JOIN properties p ON s.property_id = p.id ORDER BY s.created_at DESC LIMIT $1`, [Math.ceil(limit / 3)])
    ]);

    const allActivities = [...dealActivities.rows, ...communications.rows, ...showings.rows]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

    res.json({ success: true, data: allActivities });
});

// @desc    Get property stats
// @route   GET /api/dashboard/property-stats
export const getPropertyStats = asyncHandler(async (req, res) => {
    const [byStatus, byType, byCity, priceStats] = await Promise.all([
        query(`SELECT status, COUNT(*) as count FROM properties GROUP BY status`),
        query(`SELECT property_type, COUNT(*) as count, AVG(price) as avg_price FROM properties GROUP BY property_type`),
        query(`SELECT city, COUNT(*) as count FROM properties GROUP BY city ORDER BY count DESC LIMIT 10`),
        query(`SELECT AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price, AVG(days_on_market) as avg_days_on_market FROM properties WHERE status = 'available'`)
    ]);

    res.json({
        success: true,
        data: {
            by_status: byStatus.rows,
            by_type: byType.rows,
            by_city: byCity.rows,
            price_stats: priceStats.rows[0]
        }
    });
});

// @desc    Get sales stats
// @route   GET /api/dashboard/sales-stats
export const getSalesStats = asyncHandler(async (req, res) => {
    const { period = 'year' } = req.query;
    let interval = '1 year';
    let groupBy = "TO_CHAR(actual_close_date, 'YYYY-MM')";

    if (period === 'month') { interval = '1 month'; groupBy = "TO_CHAR(actual_close_date, 'YYYY-MM-DD')"; }
    else if (period === 'quarter') { interval = '3 months'; groupBy = "TO_CHAR(actual_close_date, 'YYYY-WW')"; }

    const result = await query(`
    SELECT ${groupBy} as period, COUNT(*) as deals_closed, COALESCE(SUM(final_amount), 0) as total_value, COALESCE(SUM(commission_amount), 0) as total_commission
    FROM deals WHERE stage = 'closed_won' AND actual_close_date >= CURRENT_DATE - INTERVAL '${interval}'
    GROUP BY ${groupBy} ORDER BY period
  `);
    res.json({ success: true, data: result.rows });
});
