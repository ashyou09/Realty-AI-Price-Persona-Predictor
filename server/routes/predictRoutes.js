import express from "express";
import axios from "axios";
import { authenticate } from '../middleware/authMiddleware.js';
import Property from '../models/property.js';

const router = express.Router();

// All prediction routes require authentication
router.use(authenticate);

// Predict property price
router.post("/price", async (req, res) => {
  try {
    const { sqft, bedrooms, bathrooms, location_score, age, title, save } = req.body;

    // Validate required fields for prediction
    if (!sqft || !bedrooms || bathrooms === undefined || !location_score || age === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sqft, bedrooms, bathrooms, location_score, age"
      });
    }

    // Validate input ranges
    if (sqft <= 0) {
      return res.status(400).json({ success: false, error: "sqft must be greater than 0" });
    }
    if (bedrooms < 0) {
      return res.status(400).json({ success: false, error: "bedrooms must be non-negative" });
    }
    if (bathrooms < 0) {
      return res.status(400).json({ success: false, error: "bathrooms must be non-negative" });
    }
    if (location_score < 1 || location_score > 10) {
      return res.status(400).json({ success: false, error: "location_score must be between 1 and 10" });
    }
    if (age < 0) {
      return res.status(400).json({ success: false, error: "age must be non-negative" });
    }

    // Prepare data for AI model
    const predictionData = {
      sqft: Number(sqft),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      location_score: Number(location_score),
      age: Number(age)
    };

    // Call AI model server
    let predictionResponse;
    try {
      predictionResponse = await axios.post("http://127.0.0.1:8000/predict", predictionData);
    } catch (error) {
      console.error("AI Model Server Error:", error.response?.data || error.message);
      return res.status(503).json({
        success: false,
        error: "Prediction service unavailable",
        details: error.response?.data?.detail || error.message
      });
    }

    const predictedPrice = predictionResponse.data.predicted_price;

    // If save is true, save the property to database
    let savedProperty = null;
    let saveError = null;
    
    // Check if save is requested (handle both boolean and string "true")
    const shouldSave = save === true || save === "true" || save === 1;
    
    console.log("Save request details:", {
      save: save,
      shouldSave: shouldSave,
      title: title,
      hasTitle: !!title,
      userId: req.userId
    });
    
    if (shouldSave) {
      if (!title || !title.trim()) {
        saveError = "Title is required to save property";
        console.error("❌ Cannot save property: Title is missing");
      } else {
        try {
          console.log("💾 Attempting to save property...");
          console.log("Property data:", {
            title: title.trim(),
            sqft: predictionData.sqft,
            bedrooms: predictionData.bedrooms,
            bathrooms: predictionData.bathrooms,
            location_score: predictionData.location_score,
            age: predictionData.age,
            price: predictedPrice,
            ownerId: req.userId,
            ownerIdType: typeof req.userId,
            model_version: '1.0'
          });
          
          const property = new Property({
            title: title.trim(),
            sqft: predictionData.sqft,
            bedrooms: predictionData.bedrooms,
            bathrooms: predictionData.bathrooms,
            location_score: predictionData.location_score,
            age: predictionData.age,
            price: predictedPrice,
            ownerId: req.userId,
            model_version: '1.0',
            isAiGenerated: true, // Mark as AI-generated
            source: 'ai' // Source is AI prediction
          });

          // Save property (Mongoose will validate automatically)
          savedProperty = await property.save();
          console.log("✅ Property saved successfully:", {
            id: savedProperty._id,
            title: savedProperty.title,
            ownerId: savedProperty.ownerId,
            createdAt: savedProperty.createdAt
          });
        } catch (error) {
          saveError = error.message;
          console.error("❌ Error saving property:", error);
          console.error("Error details:", {
            message: error.message,
            name: error.name,
            code: error.code,
            errors: error.errors,
            stack: error.stack?.split('\n').slice(0, 5).join('\n')
          });
          
          // If it's a validation error, provide more details
          if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors || {}).map(e => e.message).join(', ');
            saveError = `Validation error: ${validationErrors}`;
          }
        }
      }
    } else {
      console.log("ℹ️ Property save not requested");
    }

    // Return prediction result
    return res.json({
      success: true,
      predicted_price: predictedPrice,
      inputs: predictionResponse.data.inputs || predictionData,
      property: savedProperty ? {
        id: savedProperty._id,
        title: savedProperty.title,
        createdAt: savedProperty.createdAt
      } : null,
      saveError: saveError || null,
      saved: !!savedProperty
    });
  } catch (error) {
    console.error("Prediction error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});

export default router;
