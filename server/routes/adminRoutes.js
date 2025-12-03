import express from 'express';
import {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserProperties
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const adminRoutes = express.Router();

// All admin routes require authentication
adminRoutes.use(authenticate);

// Get all users
adminRoutes.get('/users', getAllUsers);

// Get single user
adminRoutes.get('/users/:id', getUser);

// Create new user
adminRoutes.post('/users', createUser);

// Update user
adminRoutes.put('/users/:id', updateUser);

// Delete user
adminRoutes.delete('/users/:id', deleteUser);

// Update user role
adminRoutes.patch('/users/:id/role', updateUserRole);

// Get user properties
adminRoutes.get('/users/:userId/properties', getUserProperties);

export default adminRoutes;
