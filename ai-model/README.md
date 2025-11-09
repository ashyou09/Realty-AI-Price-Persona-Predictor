# AI Model Server

This directory contains the FastAPI server for the Real Estate AI price prediction model.

## Model Information

- **Model Type**: CatBoostRegressor
- **Model File**: `realty_price_model.pkl`
- **Features**: 
  - `sqft`: Square footage (must be > 0)
  - `bedrooms`: Number of bedrooms (>= 0)
  - `bathrooms`: Number of bathrooms (>= 0)
  - `location_score`: Location score (1-10)
  - `age`: Property age in years (>= 0)

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python server.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
```bash
GET /health
```

### Root
```bash
GET /
```

### Predict Price
```bash
POST /predict
Content-Type: application/json

{
  "sqft": 1200,
  "bedrooms": 2,
  "bathrooms": 2,
  "location_score": 7.5,
  "age": 5
}
```

## Testing

Test the prediction endpoint:
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "sqft": 1200,
    "bedrooms": 2,
    "bathrooms": 2,
    "location_score": 7.5,
    "age": 5
  }'
```

## Requirements

- Python 3.8+
- FastAPI
- Uvicorn
- CatBoost
- NumPy
- Joblib
- scikit-learn

## Notes

- The model file (`realty_price_model.pkl`) must be in the same directory as `server.py`
- The server includes CORS middleware to allow requests from the frontend and backend
- Error handling is included for missing model files and invalid inputs

