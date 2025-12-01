import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        const user = await userModel.findById(req.user._id);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can view all users'
            });
        }

        const users = await userModel.find().select('-password');
        res.json({
            success: true,
            users,
            total: users.length
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single user
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is admin
        const admin = await userModel.findById(req.user._id);
        if (admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can view user details'
            });
        }

        const user = await userModel.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user is admin
        const admin = await userModel.findById(req.user._id);
        if (admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can create users'
            });
        }

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new userModel({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'user' // Default role is 'user'
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        // Check if user is admin
        const admin = await userModel.findById(req.user._id);
        if (admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can update users'
            });
        }

        // Find user
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is already in use by another user
        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email: email.toLowerCase().trim() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email.toLowerCase().trim();
        }

        // Update fields
        if (name) user.name = name.trim();
        if (role) user.role = role;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is admin
        const admin = await userModel.findById(req.user._id);
        if (admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete users'
            });
        }

        // Prevent admin from deleting themselves
        if (id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await userModel.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Check if user is admin
        const admin = await userModel.findById(req.user._id);
        if (admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can assign roles'
            });
        }

        // Validate role
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "admin" or "user"'
            });
        }

        const user = await userModel.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
