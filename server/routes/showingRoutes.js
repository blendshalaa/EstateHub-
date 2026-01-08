import express from 'express';
import {
    getAllShowings, getShowingById, createShowing, updateShowing,
    cancelShowing, addShowingFeedback, getAgentSchedule, getUpcomingShowings
} from '../controllers/showingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllShowings);
router.get('/upcoming', getUpcomingShowings);
router.get('/agent/:agentId/schedule', getAgentSchedule);
router.get('/:id', getShowingById);
router.post('/', createShowing);
router.put('/:id', updateShowing);
router.put('/:id/cancel', cancelShowing);
router.put('/:id/feedback', addShowingFeedback);

export default router;
