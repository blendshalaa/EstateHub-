import express from 'express';
import {
    getAllDeals, getDealById, createDeal, updateDeal,
    updateDealStage, deleteDeal, addDealActivity,
    getDealActivities, getDealPipeline
} from '../controllers/dealController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllDeals);
router.get('/pipeline', getDealPipeline);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.put('/:id', updateDeal);
router.put('/:id/stage', updateDealStage);
router.delete('/:id', deleteDeal);
router.get('/:id/activities', getDealActivities);
router.post('/:id/activities', addDealActivity);

export default router;
