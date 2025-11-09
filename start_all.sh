#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Real Estate AI Servers...${NC}\n"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use!${NC}"
        return 1
    else
        return 0
    fi
}

# Check ports
echo -e "${BLUE}Checking ports...${NC}"
check_port 8000 || exit 1
check_port 3000 || exit 1
check_port 5173 || exit 1
echo -e "${GREEN}All ports are available${NC}\n"

# Start AI Model Server
echo -e "${BLUE}Starting AI Model Server on port 8000...${NC}"
cd ai-model
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python server.py &
AI_PID=$!
cd ..
echo -e "${GREEN}AI Model Server started (PID: $AI_PID)${NC}\n"

# Wait a bit for AI server to start
sleep 2

# Start Backend Server
echo -e "${BLUE}Starting Backend Server on port 3000...${NC}"
cd server
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing server dependencies...${NC}"
    npm install
fi
# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Warning: .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}Please edit server/.env and set your MONGODB_URI and JWT_SECRET${NC}"
fi
npm start &
SERVER_PID=$!
cd ..
echo -e "${GREEN}Backend Server started (PID: $SERVER_PID)${NC}\n"

# Wait a bit for backend server to start
sleep 2

# Start Client
echo -e "${BLUE}Starting Client on port 5173...${NC}"
cd client
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing client dependencies...${NC}"
    npm install
fi
npm run dev &
CLIENT_PID=$!
cd ..
echo -e "${GREEN}Client started (PID: $CLIENT_PID)${NC}\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All servers started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "AI Model Server:  ${BLUE}http://localhost:8000${NC}"
echo -e "Backend Server:   ${BLUE}http://localhost:3000${NC}"
echo -e "Client:           ${BLUE}http://localhost:5173${NC}"
echo -e "${GREEN}========================================${NC}\n"
echo -e "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Stopping all servers...${NC}"
    kill $AI_PID $SERVER_PID $CLIENT_PID 2>/dev/null
    echo -e "${GREEN}All servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for all processes
wait

