import express from 'express';
import {
    getAllProperties, getPropertyById, createProperty, updateProperty, deleteProperty,
    addPropertyPhoto, deletePropertyPhoto, addPropertyDocument, deletePropertyDocument
} from '../controllers/propertyController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional auth for enhanced features)
router.get('/', optionalAuth, getAllProperties);
router.get('/:id', optionalAuth, getPropertyById);

// Protected routes
router.post('/', authenticate, createProperty);
router.put('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);

// Photo management
router.post('/:id/photos', authenticate, addPropertyPhoto);
router.delete('/:id/photos/:photoId', authenticate, deletePropertyPhoto);

// Document management
router.post('/:id/documents', authenticate, addPropertyDocument);
router.delete('/:id/documents/:docId', authenticate, deletePropertyDocument);

export default router;
