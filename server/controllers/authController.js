import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const register = async(req,res)=>{

    const{name,email,password,role} = req.body;

    // console.log('Registration request:', { name, email, hasPassword: !!password });

    if(!name || !email || !password){
        // console.log('Missing fields:', { name: !!name, email: !!email, password: !!password });
        return res.status(400).json({success: false,message:'All fields are required'})
    }

    try{
        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();
        
        const existingUser = await userModel.findOne({email: normalizedEmail});
        if(existingUser){
            return res.status(400).json({success: false,message:'User already exists'})
        }
        
        const hashedPassword = await bcrypt.hash(password,10);

        // Create user with explicit field assignment
        const userData = {
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: role && ['user', 'admin'].includes(role) ? role : 'user'
        };
        
        // console.log('Creating user with data:', { name: userData.name, email: userData.email, hasPassword: !!userData.password });
        
        const user = new userModel(userData);
        const savedUser = await user.save();
        
        // console.log('User saved successfully:', { 
        //     id: savedUser._id, 
        //     name: savedUser.name, 
        //     email: savedUser.email,
        //     hasName: !!savedUser.name 
        // });
        
        // Verify the saved user has name field by fetching from DB
        const verifyUser = await userModel.findById(savedUser._id);
        if (!verifyUser.name) {
            console.error('ERROR: Name field is missing after save!');
            // Try to update the user with name field
            verifyUser.name = normalizedName;
            await verifyUser.save();
            console.log('Updated user with name field');
        }
        
        console.log('Verified user from DB:', { 
            id: verifyUser._id, 
            name: verifyUser.name, 
            email: verifyUser.email 
        });

        // we have to generate token so that i can use as cookie
        const token = jwt.sign({id : verifyUser._id},process.env.JWT_SECRET,{expiresIn:'15d'});
        res.cookie('token',token,{
            httpOnly: true, 
            secure: true, // Always true for cross-domain cookies
            sameSite: 'none', // Allow cross-domain cookies
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            message: 'Registration successful',
            token: token,
            user: { 
                id: verifyUser._id.toString(), 
                name: verifyUser.name || normalizedName, 
                email: verifyUser.email,
                role: verifyUser.role || 'user'
            }
        })
    }
    catch(error){
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const login = async(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({success: false,message:'All fields are required'})
    }

    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            })
        }

        const token = jwt.sign({id : user._id},process.env.JWT_SECRET,{expiresIn:'15d'});
        res.cookie('token',token,{
            httpOnly: true, 
            secure: true, // Always true for cross-domain cookies
            sameSite: 'none', // Allow cross-domain cookies
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        console.log('Login successful:', { id: user._id, name: user.name, email: user.email });

        return res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: { 
                id: user._id.toString(), 
                name: user.name, 
                email: user.email,
                role: user.role || 'user'
            }
        })

    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async(req,res)=>{

    try{
        res.clearCookie('token',{
            httpOnly: true, 
            secure: true, // Must match the original cookie settings
            sameSite: 'none', // Must match the original cookie settings
        });
        return res.json({
            success: true,
            message: 'Logout successful'
        })
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const verify = async(req,res)=>{
    try{
        // Get token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        
        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');
        
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.json({
            success: true,
            user: { 
                id: user._id.toString(), 
                name: user.name, 
                email: user.email,
                role: user.role || 'user'
            }
        })
    }
    catch(error){
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }
}

export const getUsers = async(req,res)=>{
    try{
        const users = await userModel.find().select('-password').sort({ createdAt: -1 });
        
        if(!users){
            return res.status(404).json({
                success: false,
                message: 'No users found'
            })
        }

        return res.json({
            success: true,
            users: users.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                createdAt: user.createdAt
            }))
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteUser = async(req,res)=>{
    try{
        const { id } = req.params;
        
        // Verify it's a valid MongoDB ID
        if(!id || id.length !== 24){
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            })
        }

        // Find user
        const user = await userModel.findById(id);
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Delete user's properties first (if Property model exists)
        try {
            const Property = require('../models/property.js').default;
            await Property.deleteMany({ ownerId: id });
        } catch (err) {
            // If property deletion fails, continue with user deletion
            console.log('Note: Could not delete user properties:', err.message);
        }

        // Delete the user
        await userModel.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: 'User deleted successfully'
        })
    }
    catch(error){
        console.error('Delete user error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}           