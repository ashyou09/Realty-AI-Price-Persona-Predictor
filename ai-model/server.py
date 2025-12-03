from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
import uvicorn
import os
import sys
from pathlib import Path
from feature_transformer import transform_for_prediction

# Configuration
BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "realty_price_model.pkl"

# Global model variable
model = None

def load_model():
    """Load the trained model from disk."""
    global model
    try:
        if MODEL_PATH.exists():
            print(f"🔄 Loading model from {MODEL_PATH}...")
            model = joblib.load(MODEL_PATH)
            print(f"✅ Model loaded successfully! Type: {type(model).__name__}")
            
            if hasattr(model, 'feature_names_'):
                print(f"📋 Model expects {len(model.feature_names_)} features")
            else:
                print("⚠️  Model does not have feature names metadata")
        else:
            print(f"❌ Model file not found at {MODEL_PATH}")
            print("   Please run 'python train_model.py' first.")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()

# Initialize App
app = FastAPI(title="Real Estate AI Model Server")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
load_model()

@app.get("/")
async def root():
    return {
        "message": "Real Estate AI Model Server",
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health():
    if model is None:
        return {"status": "unhealthy", "detail": "Model not loaded"}
    return {"status": "healthy"}

@app.post("/predict")
async def predict(request: Request):
    if model is None:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Please run training script first."
        )
    
    try:
        data = await request.json()
        
        # Extract and validate inputs
        try:
            sqft = float(data.get('sqft', 0))
            bedrooms = int(data.get('bedrooms', 0))
            bathrooms = int(data.get('bathrooms', 0))
            location_score = float(data.get('location_score', 5))
            
            # Optional fields with defaults
            age = int(data.get('age', 0))
            status = data.get('status', 'Ready_to_move')
            transaction = data.get('transaction', 'Resale')
            property_type = data.get('property_type', 'Apartment')
            furnishing = data.get('furnishing', 'Semi-Furnished')
            parking = int(data.get('parking', 1))
            
        except (ValueError, TypeError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid input data types: {str(e)}")

        # Transform features
        try:
            df = transform_for_prediction(
                sqft=sqft,
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                location_score=location_score,
                status=status,
                transaction=transaction,
                property_type=property_type,
                furnishing=furnishing,
                parking=parking
            )
            
            # Ensure columns match model expectation
            if hasattr(model, 'feature_names_'):
                # Add missing columns with 0
                for col in model.feature_names_:
                    if col not in df.columns:
                        df[col] = 0
                # Reorder to match model
                df = df[model.feature_names_]
            
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            print(f"❌ Feature transformation error: {e}")
            raise HTTPException(status_code=500, detail=f"Feature transformation failed: {str(e)}")

        # Predict
        try:
            prediction = model.predict(df)[0]
            
            # Post-process prediction
            predicted_price = max(0.0, float(prediction))
            
            return {
                "predicted_price": predicted_price,
                "currency": "INR",
                "inputs": {
                    "sqft": sqft,
                    "bedrooms": bedrooms,
                    "bathrooms": bathrooms,
                    "location_score": location_score
                }
            }
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
