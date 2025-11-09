# Quick Start Commands

## One-Line Commands to Start Each Server

### 1. AI Model Server (Port 8000)
```bash
cd ai-model && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python server.py
```

### 2. Backend Server (Port 3000)
```bash
cd server && npm install && npm start
```

### 3. Client (Port 5173)
```bash
cd client && npm install && npm run dev
```

## Or Use the Startup Script (Recommended)

```bash
./start_all.sh
```

## Manual Step-by-Step

### Step 1: Start AI Model Server
```bash
# Terminal 1
cd ai-model
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

### Step 2: Start Backend Server
```bash
# Terminal 2
cd server
npm install
# Make sure .env file exists (copy from .env.example if needed)
npm start
```

### Step 3: Start Client
```bash
# Terminal 3
cd client
npm install
npm run dev
```

## Verify All Servers Are Running

1. **AI Model Server**: http://localhost:8000/health
2. **Backend Server**: http://localhost:3000/
3. **Client**: http://localhost:5173/

## Important Notes

- Make sure MongoDB is running before starting the backend server
- The backend server needs a `.env` file in the `server` directory
- All servers must be running for the full application to work

