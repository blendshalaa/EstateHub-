import express from 'express';
import {
    getAllClients, getClientById, createClient, updateClient,
    deleteClient, assignAgent, updateLeadScore
} from '../controllers/clientController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.put('/:id/assign-agent', assignAgent);
router.put('/:id/lead-score', updateLeadScore);

export default router;
