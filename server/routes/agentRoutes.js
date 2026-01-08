import express from 'express';
import {
    getAllAgents, getAgentById, createAgent,
    updateAgent, deleteAgent, getAgentStats
} from '../controllers/agentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllAgents);
router.get('/:id', getAgentById);
router.get('/:id/stats', getAgentStats);
router.post('/', authorize('admin', 'manager'), createAgent);
router.put('/:id', authorize('admin', 'manager'), updateAgent);
router.delete('/:id', authorize('admin'), deleteAgent);

export default router;
