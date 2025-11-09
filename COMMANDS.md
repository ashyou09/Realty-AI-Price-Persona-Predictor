# Real Estate AI - Quick Command Reference

## 🚀 Start All Servers

### Method 1: Using the Startup Script (Recommended)
```bash
./start_all.sh
```

### Method 2: Manual Startup (3 Separate Terminals)

#### Terminal 1: AI Model Server (Port 8000)
```bash
cd ai-model
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```

#### Terminal 2: Backend Server (Port 3000)
```bash
cd server
npm install
npm start
```

#### Terminal 3: Client (Port 5173)
```bash
cd client
npm install
npm run dev
```

## 📦 Initial Setup (One-time)

### 1. AI Model Server Setup
```bash
cd ai-model
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Backend Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and set MONGODB_URI and JWT_SECRET
```

### 3. Client Setup
```bash
cd client
npm install
```

## 🗄️ MongoDB Setup

### Start MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Check MongoDB Status
```bash
mongosh --eval "db.adminCommand('ping')"
```

## 🔧 Environment Variables

Create `server/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
```

## 🌐 Server URLs

- **AI Model Server**: http://localhost:8000
- **Backend Server**: http://localhost:3000
- **Client**: http://localhost:5173

## 🧪 Test Commands

### Test AI Model Server
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

### Test Backend Server
```bash
curl http://localhost:3000/
```

### Test Backend Health
```bash
curl http://localhost:8000/health
```

## 🛑 Stop Servers

### If using startup script:
Press `Ctrl+C` in the terminal running the script

### If running manually:
Press `Ctrl+C` in each terminal

### Kill processes by port:
```bash
# Kill process on port 8000 (AI Model)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (Backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (Client)
lsof -ti:5173 | xargs kill -9
```

## 📝 Common Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Module Not Found
```bash
# Reinstall dependencies
cd server && npm install
cd ../client && npm install
cd ../ai-model && pip install -r requirements.txt
```

### Python Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Deactivate
deactivate
```

## 📚 Project Structure

```
real_estate_Ai/
├── ai-model/          # FastAPI server (Port 8000)
│   ├── server.py
│   ├── requirements.txt
│   └── realty_price_model.pkl
├── server/            # Express server (Port 3000)
│   ├── server.js
│   ├── package.json
│   └── .env
└── client/            # React app (Port 5173)
    ├── src/
    └── package.json
```

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] AI Model Server is running on port 8000
- [ ] Backend Server is running on port 3000
- [ ] Client is running on port 5173
- [ ] `.env` file exists in `server/` directory
- [ ] All dependencies are installed
- [ ] Virtual environment is activated for AI model

## 🎯 Quick Start Sequence

1. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

2. **Start AI Model Server**
   ```bash
   cd ai-model && source venv/bin/activate && python server.py
   ```

3. **Start Backend Server** (in new terminal)
   ```bash
   cd server && npm start
   ```

4. **Start Client** (in new terminal)
   ```bash
   cd client && npm run dev
   ```

5. **Open Browser**
   ```
   http://localhost:5173
   ```

