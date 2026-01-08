import express from 'express';
import {
    getAllCommunications, getCommunicationById, createCommunication,
    updateCommunication, deleteCommunication, getClientCommunications,
    getCommunicationSummary
} from '../controllers/communicationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllCommunications);
router.get('/summary', getCommunicationSummary);
router.get('/client/:clientId', getClientCommunications);
router.get('/:id', getCommunicationById);
router.post('/', createCommunication);
router.put('/:id', updateCommunication);
router.delete('/:id', deleteCommunication);

export default router;
