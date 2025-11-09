# Server Setup and Configuration

## Overview

The server is now fully configured with:
- User authentication (JWT-based)
- Property management (CRUD operations)
- AI model integration for price predictions
- MongoDB database connection

## File Structure

```
server/
├── config/
│   └── mongodb.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js   # Authentication controllers
│   └── propertyController.js # Property CRUD controllers
├── middleware/
│   └── authMiddleware.js   # JWT authentication middleware
├── models/
│   ├── userModel.js        # User schema
│   └── property.js         # Property schema
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── predictRoutes.js    # Prediction routes (AI model integration)
│   └── propertyRoutes.js   # Property CRUD routes
└── server.js               # Main server file
```

## API Endpoints

### Authentication Routes (Public)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify authentication token

### Property Routes (Protected - Requires Authentication)
- `GET /api/properties` - Get all properties for authenticated user
- `GET /api/properties/:id` - Get a single property by ID
- `POST /api/properties` - Create a new property
- `PUT /api/properties/:id` - Update a property
- `DELETE /api/properties/:id` - Delete a property

### Prediction Routes (Protected - Requires Authentication)
- `POST /api/predict/price` - Predict property price using AI model

## Property Model Schema

```javascript
{
  title: String (required),
  sqft: Number (required),
  bedrooms: Number (required),
  bathrooms: Number (required),
  location_score: Number (required, 1-10),
  age: Number (required, >= 0),
  price: Number (required), // Predicted price from AI model
  persona: String (optional),
  persona_cluster: Number (optional),
  model_version: String (default: '1.0'),
  ownerId: ObjectId (required, references 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

## AI Model Integration

The prediction endpoint (`POST /api/predict/price`) integrates with the AI model server:

1. **Input Validation**: Validates all required fields and ranges
2. **AI Model Call**: Sends request to `http://localhost:8000/predict`
3. **Optional Save**: If `save: true` and `title` provided, saves property to database
4. **Response**: Returns predicted price and optionally saved property info

### Prediction Request Format

```json
{
  "sqft": 1200,
  "bedrooms": 2,
  "bathrooms": 2,
  "location_score": 7.5,
  "age": 5,
  "title": "My Property", // Optional, required if save: true
  "save": true // Optional, if true saves property to database
}
```

### Prediction Response Format

```json
{
  "success": true,
  "predicted_price": 5000000,
  "inputs": {
    "sqft": 1200,
    "bedrooms": 2,
    "bathrooms": 2,
    "location_score": 7.5,
    "age": 5
  },
  "property": {
    "id": "property_id",
    "title": "My Property",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Authentication

All property and prediction routes require authentication. The authentication middleware:
1. Checks for token in cookies or Authorization header
2. Verifies JWT token
3. Attaches user information to `req.user` and `req.userId`

## Environment Variables

Required environment variables in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
```

## Database Connection

The server connects to MongoDB at `${MONGODB_URI}/real_state` and creates collections for:
- `users` - User accounts
- `properties` - Property listings with predictions

## Error Handling

All routes include comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Server errors (500)
- AI model service unavailable (503)

## Testing

### Test Prediction Endpoint

```bash
# First, login to get a token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}' \
  -c cookies.txt

# Then make prediction
curl -X POST http://localhost:3000/api/predict/price \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "sqft": 1200,
    "bedrooms": 2,
    "bathrooms": 2,
    "location_score": 7.5,
    "age": 5,
    "title": "Test Property",
    "save": true
  }'
```

### Test Property Endpoints

```bash
# Get all properties
curl -X GET http://localhost:3000/api/properties \
  -b cookies.txt

# Create a property
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "My Property",
    "sqft": 1200,
    "bedrooms": 2,
    "bathrooms": 2,
    "location_score": 7.5,
    "age": 5,
    "price": 5000000
  }'
```

## Integration with AI Model

The server expects the AI model server to be running on `http://localhost:8000` with the following endpoint:
- `POST /predict` - Accepts property features and returns predicted price

The AI model server must be running before making prediction requests.

## Notes

- All property operations are scoped to the authenticated user
- Properties can only be accessed/modified by their owner
- The prediction endpoint can optionally save properties to the database
- The property model includes all fields required by the AI model
- Authentication is required for all property and prediction operations

