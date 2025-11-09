from fastapi import FastAPI, Request
import joblib
import numpy as np
import uvicorn

# Load model
model = joblib.load("realty_price_model.pkl")

app = FastAPI()

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    # Example expected input keys: ['sqft', 'bedrooms', 'bathrooms', 'location_score', 'age']
    features = np.array([
        data['sqft'],
        data['bedrooms'],
        data['bathrooms'],
        data['location_score'],
        data['age']
    ]).reshape(1, -1)
    
    price = model.predict(features)[0]
    return {"predicted_price": float(price)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
