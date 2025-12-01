import Property from '../models/property.js';
import mongoose from 'mongoose';

// Get all properties for the authenticated user or for a specific user (if admin)
export const getProperties = async (req, res) => {
    try {
        // If userId query param is provided, use that (admin viewing another user's properties)
        // Otherwise, use authenticated user's ID
        let userId = req.query.userId || req.userId;
        
        // Convert to ObjectId if it's a string
        if (typeof userId === 'string') {
            userId = new mongoose.Types.ObjectId(userId);
        }
        
        const properties = await Property.find({ ownerId: userId })
            .sort({ createdAt: -1 });
        
        return res.json({
            success: true,
            count: properties.length,
            properties
        });
    } catch (error) {
        console.error('Get properties error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single property by ID
export const getProperty = async (req, res) => {
    try {
        const property = await Property.findOne({
            _id: req.params.id,
            ownerId: req.userId
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        return res.json({
            success: true,
            property
        });
    } catch (error) {
        console.error('Get property error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create a new property
export const createProperty = async (req, res) => {
    try {
        const { title, sqft, bedrooms, bathrooms, location_score, age, price, persona, persona_cluster, userId } = req.body;

        // Validate required fields
        if (!title || !sqft || !bedrooms || !bathrooms || !location_score || age === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, sqft, bedrooms, bathrooms, location_score, age'
            });
        }

        // Validate location_score range
        if (location_score < 1 || location_score > 10) {
            return res.status(400).json({
                success: false,
                message: 'location_score must be between 1 and 10'
            });
        }

        // Validate age
        if (age < 0) {
            return res.status(400).json({
                success: false,
                message: 'age must be non-negative'
            });
        }

        // Determine source and isAiGenerated from request body
        const source = req.body.source || 'manual'; // 'ai', 'manual', 'wishlist'
        const isAiGenerated = source === 'ai';

        // If admin is creating property for another user, use provided userId
        // Otherwise, use authenticated user's ID
        let ownerId = userId || req.userId;
        
        // Ensure ownerId is a valid ObjectId
        if (typeof ownerId === 'string') {
            ownerId = new mongoose.Types.ObjectId(ownerId);
        }

        const property = new Property({
            title,
            sqft: Number(sqft),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            location_score: Number(location_score),
            age: Number(age),
            price: price ? Number(price) : 0,
            persona: persona || null,
            persona_cluster: persona_cluster || null,
            model_version: '1.0',
            isAiGenerated: isAiGenerated,
            source: source,
            ownerId: ownerId
        });

        const savedProperty = await property.save();

        return res.status(201).json({
            success: true,
            message: 'Property created successfully',
            property: savedProperty
        });
    } catch (error) {
        console.error('Create property error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update a property
export const updateProperty = async (req, res) => {
    try {
        const { title, sqft, bedrooms, bathrooms, location_score, age, price, persona, persona_cluster } = req.body;

        // Find property - allow admins to edit any property, users can only edit their own
        let property;
        if (req.user && req.user.role === 'admin') {
            // Admin can edit any property
            property = await Property.findById(req.params.id);
        } else {
            // Regular user can only edit their own properties
            property = await Property.findOne({
                _id: req.params.id,
                ownerId: req.userId
            });
        }

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Update fields
        if (title) property.title = title;
        if (sqft !== undefined) property.sqft = Number(sqft);
        if (bedrooms !== undefined) property.bedrooms = Number(bedrooms);
        if (bathrooms !== undefined) property.bathrooms = Number(bathrooms);
        if (location_score !== undefined) {
            if (location_score < 1 || location_score > 10) {
                return res.status(400).json({
                    success: false,
                    message: 'location_score must be between 1 and 10'
                });
            }
            property.location_score = Number(location_score);
        }
        if (age !== undefined) {
            if (age < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'age must be non-negative'
                });
            }
            property.age = Number(age);
        }
        if (price !== undefined) property.price = Number(price);
        if (persona !== undefined) property.persona = persona;
        if (persona_cluster !== undefined) property.persona_cluster = persona_cluster;
        
        property.updatedAt = new Date();

        const updatedProperty = await property.save();

        return res.json({
            success: true,
            message: 'Property updated successfully',
            property: updatedProperty
        });
    } catch (error) {
        console.error('Update property error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a property
export const deleteProperty = async (req, res) => {
    try {
        // Allow admins to delete any property, users can only delete their own
        let property;
        if (req.user && req.user.role === 'admin') {
            // Admin can delete any property
            property = await Property.findByIdAndDelete(req.params.id);
        } else {
            // Regular user can only delete their own properties
            property = await Property.findOneAndDelete({
                _id: req.params.id,
                ownerId: req.userId
            });
        }

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        return res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

