import express from 'express';
import {
    getAllTasks, getTaskById, createTask, updateTask,
    completeTask, deleteTask, getMyTasks, getOverdueTasks
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTasks);
router.get('/my-tasks', getMyTasks);
router.get('/overdue', getOverdueTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

export default router;
