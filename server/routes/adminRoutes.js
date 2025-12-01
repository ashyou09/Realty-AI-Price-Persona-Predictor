import express from 'express';
import {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const adminRoutes = express.Router();

// All admin routes require authentication
adminRoutes.use(authMiddleware);

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

export default adminRoutes;
