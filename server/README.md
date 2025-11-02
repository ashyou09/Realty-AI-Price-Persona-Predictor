# Realty-AI Server (MongoDB)

## Setup

1. Create a `.env` file in the server directory with the following content:

```
MONGODB_URI="your-mongodb-connection-string-here"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-to-something-random-and-secure"
PORT=5000
```

**Important**: 
- Replace `MONGODB_URI` with your MongoDB connection string (see below)
- Change the `JWT_SECRET` to a secure random string in production!

2. **MongoDB Connection String Examples:**

   **Local MongoDB:**
   ```
   MONGODB_URI="mongodb://localhost:27017/realty-ai"
   ```

   **MongoDB Atlas (Cloud):**
   ```
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/realty-ai?retryWrites=true&w=majority"
   ```

3. Seed the test user:
```bash
npm run seed
```

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Public Routes

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123" }`

- `POST /api/auth/login` - Login user
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Returns: `{ "token": "JWT_TOKEN", "user": {...} }`

- `GET /api/health` - Health check

### Protected Routes (require JWT token in Authorization header)

- `GET /api/auth/me` - Get current user info
  - Headers: `Authorization: Bearer <JWT_TOKEN>`

- `GET /api/dashboard` - Get dashboard data
  - Headers: `Authorization: Bearer <JWT_TOKEN>`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

