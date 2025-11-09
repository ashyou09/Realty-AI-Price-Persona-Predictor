from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
import uvicorn
import os
from pathlib import Path
from feature_transformer import transform_features_for_model, create_feature_dataframe

# Get the directory where this script is located
BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "realty_price_model.pkl"

# Load model
model = None
model_features = None
feature_order = None

try:
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded successfully from {MODEL_PATH}")
        print(f"📦 Model type: {type(model).__name__}")
        
        # Try to get feature names if available (for CatBoost models)
        # CatBoost stores feature names in feature_names_ if provided during training
        # If not provided, we need to infer from the training data structure
        if hasattr(model, 'feature_names_') and model.feature_names_:
            model_features = model.feature_names_
            feature_order = model_features
            print(f"📋 Model expects {len(model_features)} features")
            print(f"📋 First 10 features: {model_features[:10]}")
            print(f"📋 Last 10 features: {model_features[-10:]}")
        else:
            # If feature names not available, we'll use the standard feature order
            # based on the preprocessing in the notebook
            print(f"⚠️ Model feature names not available, using inferred feature order")
            # Standard order from preprocessing: Area, BHK, Bathroom, Parking, Status, Transaction, Type,
            # Furnishing_Furnished, Furnishing_Semi-Furnished, Furnishing_Unfurnished,
            # Locality_0 through Locality_364
            feature_order = (
                ['Area', 'BHK', 'Bathroom', 'Parking', 'Status', 'Transaction', 'Type'] +
                ['Furnishing_Furnished', 'Furnishing_Semi-Furnished', 'Furnishing_Unfurnished'] +
                [f'Locality_{i}' for i in range(365)]
            )
            print(f"📋 Using inferred feature order with {len(feature_order)} features")
    else:
        print(f"❌ Model file not found at {MODEL_PATH}")
        print(f"📁 Current directory: {os.getcwd()}")
        print(f"📁 Script directory: {BASE_DIR}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print(f"📁 Attempted path: {MODEL_PATH}")
    import traceback
    traceback.print_exc()
    model = None

app = FastAPI(title="Real Estate AI Model Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Real Estate AI Model Server is running", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
async def predict(request: Request):
    if model is None:
        raise HTTPException(
            status_code=503, 
            detail=f"Model not loaded. Please check if the model file exists at {MODEL_PATH}"
        )
    
    try:
        data = await request.json()
        
        # Validate required fields
        required_fields = ['sqft', 'bedrooms', 'bathrooms', 'location_score', 'age']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Validate input ranges
        if data['sqft'] <= 0:
            raise HTTPException(status_code=400, detail="sqft must be greater than 0")
        if data['bedrooms'] < 0:
            raise HTTPException(status_code=400, detail="bedrooms must be non-negative")
        if data['bathrooms'] < 0:
            raise HTTPException(status_code=400, detail="bathrooms must be non-negative")
        if not (1 <= data['location_score'] <= 10):
            raise HTTPException(status_code=400, detail="location_score must be between 1 and 10")
        if data['age'] < 0:
            raise HTTPException(status_code=400, detail="age must be non-negative")
        
        # Get optional parameters with defaults
        status = data.get('status', 'Ready_to_move')
        transaction = data.get('transaction', 'Resale')
        property_type = data.get('property_type', 'Apartment')
        furnishing = data.get('furnishing', 'Semi-Furnished')
        parking = data.get('parking', 1)
        
        # Transform simple inputs to model's expected format
        try:
            # Create feature DataFrame
            df = create_feature_dataframe(
                sqft=float(data['sqft']),
                bedrooms=int(data['bedrooms']),
                bathrooms=int(data['bathrooms']),
                location_score=float(data['location_score']),
                age=int(data['age']),
                status=status,
                transaction=transaction,
                property_type=property_type,
                furnishing=furnishing,
                parking=parking
            )
            
            # Ensure all expected columns exist and are in correct order
            if feature_order is not None:
                # Add any missing columns with zeros
                for col in feature_order:
                    if col not in df.columns:
                        df[col] = 0
                
                # If model has feature names, CatBoost will match by name (order doesn't matter)
                # If model doesn't have feature names, order is critical
                # Reorder to match expected order to be safe
                df = df[feature_order]
            else:
                # If we don't know the feature order, ensure we have all expected columns
                # and let CatBoost match by name if it can
                expected_cols = (
                    ['Area', 'BHK', 'Bathroom', 'Parking', 'Status', 'Transaction', 'Type'] +
                    ['Furnishing_Furnished', 'Furnishing_Semi-Furnished', 'Furnishing_Unfurnished'] +
                    [f'Locality_{i}' for i in range(365)]
                )
                for col in expected_cols:
                    if col not in df.columns:
                        df[col] = 0
            
            print(f"📊 Transformed features DataFrame shape: {df.shape}")
            print(f"📊 Feature columns: {len(df.columns)}")
            print(f"📊 Column names (first 10): {list(df.columns[:10])}")
            print(f"📊 Has Transaction: {'Transaction' in df.columns}")
            print(f"📊 Transaction value: {df['Transaction'].iloc[0] if 'Transaction' in df.columns else 'N/A'}")
            
            # CatBoost can accept pandas DataFrame directly
            # If model has feature_names_, it will match by column name
            # Otherwise, it will use column order
            features_df = df
            
        except Exception as transform_error:
            print(f"❌ Feature transformation failed: {transform_error}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Feature transformation failed: {str(transform_error)}"
            )
        
        # Make prediction
        try:
            # CatBoost accepts pandas DataFrame and matches features by column name
            # This is the safest way to ensure feature matching
            price = model.predict(features_df)[0]
            print(f"✅ Prediction successful: {price}")
        except Exception as pred_error:
            print(f"❌ Model prediction failed: {pred_error}")
            print(f"📊 Features DataFrame shape: {features_df.shape}")
            print(f"📊 DataFrame columns: {list(features_df.columns)}")
            print(f"📊 First row values (first 20): {features_df.iloc[0].values[:20].tolist()}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Model prediction failed: {str(pred_error)}"
            )
        
        # Ensure price is non-negative and handle NaN/Inf
        if not np.isfinite(price):
            print(f"⚠️ Warning: Model returned non-finite value: {price}")
            price = 0.0
        elif price < 0:
            price = 0.0
        
        return {
            "predicted_price": float(price),
            "inputs": {
                "sqft": float(data['sqft']),
                "bedrooms": int(data['bedrooms']),
                "bathrooms": int(data['bathrooms']),
                "location_score": float(data['location_score']),
                "age": int(data['age'])
            }
        }
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
