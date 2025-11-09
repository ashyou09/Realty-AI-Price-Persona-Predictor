import express from 'express';
import {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All property routes require authentication
router.use(authenticate);

// Get all properties for the authenticated user
router.get('/', getProperties);

// Get a single property by ID
router.get('/:id', getProperty);

// Create a new property
router.post('/', createProperty);

// Update a property
router.put('/:id', updateProperty);

// Delete a property
router.delete('/:id', deleteProperty);

export default router;

