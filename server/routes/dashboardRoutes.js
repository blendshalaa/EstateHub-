import express from 'express';
import {
    getOverview, getDealPipeline, getAgentPerformance,
    getRecentActivity, getPropertyStats, getSalesStats
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/pipeline', getDealPipeline);
router.get('/agent-performance', getAgentPerformance);
router.get('/recent-activity', getRecentActivity);
router.get('/property-stats', getPropertyStats);
router.get('/sales-stats', getSalesStats);

export default router;
