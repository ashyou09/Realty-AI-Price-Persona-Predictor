# Real Estate AI - Server Startup Guide

This guide provides commands to run all three servers: AI Model, Backend Server, and Client.

## Prerequisites

1. **MongoDB**: Make sure MongoDB is running on your system
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.adminCommand('ping')"
   ```

2. **Node.js**: Ensure Node.js is installed (v18 or higher)
   ```bash
   node --version
   ```

3. **Python**: Ensure Python 3.8+ is installed
   ```bash
   python3 --version
   ```

## Setup Instructions

### 1. AI Model Server Setup
```bash
cd ai-model
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Backend Server Setup
```bash
cd server
npm install
# Create .env file from .env.example
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET
```

### 3. Client Setup
```bash
cd client
npm install
```

## Running the Servers

### Option 1: Run Each Server in Separate Terminals

#### Terminal 1 - AI Model Server (Port 8000)
```bash
cd ai-model
source venv/bin/activate  # On Windows: venv\Scripts\activate
python server.py
```

#### Terminal 2 - Backend Server (Port 3000)
```bash
cd server
npm start
```

#### Terminal 3 - Client (Port 5173)
```bash
cd client
npm run dev
```

### Option 2: Use the Startup Script (macOS/Linux)

Create a script to run all servers:

```bash
# Make the script executable
chmod +x start_all.sh

# Run all servers
./start_all.sh
```

## Server URLs

- **AI Model Server**: http://localhost:8000
- **Backend Server**: http://localhost:3000
- **Client**: http://localhost:5173

## Environment Variables

### Server (.env file)
```
MONGODB_URI=mongodb://localhost:27017
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
```

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running
   ```bash
   # Start MongoDB (macOS with Homebrew)
   brew services start mongodb-community
   
   # Start MongoDB (Linux)
   sudo systemctl start mongod
   ```

2. **Port Already in Use**: Stop the process using the port
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

3. **Module Not Found**: Install dependencies
   ```bash
   # For server
   cd server && npm install
   
   # For client
   cd client && npm install
   
   # For AI model
   cd ai-model && pip install -r requirements.txt
   ```

## Testing

1. **Test AI Model Server**:
   ```bash
   curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{"sqft": 1200, "bedrooms": 2, "bathrooms": 2, "location_score": 7.5, "age": 5}'
   ```

2. **Test Backend Server**:
   ```bash
   curl http://localhost:3000/
   ```

3. **Test Client**: Open http://localhost:5173 in your browser

